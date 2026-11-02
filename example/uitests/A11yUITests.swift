import XCTest

/// Checks what VoiceOver sees in the example app: the invisible page control,
/// the pages hidden behind the flip animation and the headings.
///
/// Runs on a phone-sized simulator, where the demo document has several pages and a
/// single page is shown at a time. XCUITest does not expose accessibility traits, so
/// the heading check is structural (see `testHeadingIsASingleAccessibilityElement`).
final class A11yUITests: XCTestCase {
    private var app: XCUIApplication!

    private let firstHeading = "1. What this document shows"
    private let laterHeading = "6. Long content to paginate"

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication(bundleIdentifier: "com.example.rnddoc")
        app.launch()
        XCTAssertTrue(element(label: firstHeading).waitForExistence(timeout: 90), "document did not render")
    }

    private func element(label: String) -> XCUIElement {
        app.descendants(matching: .any)
            .matching(NSPredicate(format: "label == %@", label))
            .firstMatch
    }

    private var pageControl: XCUIElement { element(label: "Document pages") }

    func testPageControlAnnouncesTheCurrentPage() throws {
        XCTAssertTrue(pageControl.exists, "the invisible page control is missing")
        let value = try XCTUnwrap(pageControl.value as? String)
        XCTAssertNotNil(
            value.range(of: #"^Page 1 of \d+$"#, options: .regularExpression),
            "unexpected spoken position: \(value)"
        )
        XCTAssertGreaterThanOrEqual(pageControl.frame.height, 44, "the control is too small to focus")
    }

    func testOnlyTheVisiblePageIsInTheAccessibilityTree() {
        XCTAssertTrue(element(label: firstHeading).exists)
        XCTAssertFalse(
            element(label: laterHeading).exists,
            "text from a page hidden behind the flip animation is exposed to screen readers"
        )
    }

    /// XCUITest cannot read the `header` trait, so this checks the structure it produces:
    /// a heading is an accessible container that swallows its text, while a paragraph
    /// keeps its own static text element.
    func testHeadingIsASingleAccessibilityElement() {
        let heading = element(label: firstHeading)
        XCTAssertEqual(heading.descendants(matching: .staticText).count, 0)
    }

    /// XCUITest can only `adjust` sliders and pickers, so the `increment` action itself
    /// cannot be fired here; this turns the page with a real drag instead and checks
    /// that the spoken position and the exposed content follow.
    func testTurningThePageUpdatesTheControlAndTheTree() throws {
        let from = app.coordinate(withNormalizedOffset: CGVector(dx: 0.85, dy: 0.5))
        let to = app.coordinate(withNormalizedOffset: CGVector(dx: 0.15, dy: 0.5))
        from.press(forDuration: 0.1, thenDragTo: to)

        let turned = NSPredicate(format: "value == %@", "Page 2 of 4")
        expectation(for: turned, evaluatedWith: pageControl)
        waitForExpectations(timeout: 15)
        XCTAssertFalse(element(label: firstHeading).exists, "page 1 is still exposed after turning")
    }
}
