# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [1.4.0] - 2026-11-02

### Added

- `keepWithNextFlags(blocks)` export and an optional fifth `keepWithNext` argument for `usePagination`, plus a third `keepWithNext` argument for `paginate`, to control which blocks stay with the next one.

### Changed

- `CHANGELOG.md` is now included in the published package, so it is visible on npm and unpkg.

### Fixed

- A heading is no longer left alone at the bottom of a page: it moves to the next page together with the block that follows it (consecutive headings travel together). A group taller than a page is still split block by block.

## [1.3.0] - 2026-11-01

### Added

- Screen reader support (VoiceOver and TalkBack): an invisible adjustable control announces the current page ("Page 3 of 12", or "Pages 3 and 4 of 12" in book mode) and turns pages with the increment/decrement actions. Headings are exposed with the `header` role.
- `accessibilityLabels` prop on `DocumentViewer` to override the spoken strings, plus the `ViewerAccessibilityLabels` type and the `DEFAULT_ACCESSIBILITY_LABELS` export.
- GitHub Actions CI for every PR and push to `beta` and `main`: typecheck, lint, formatting and tests. It also reruns when a PR is retargeted.
- Git hooks (`.githooks/`) that require Conventional Commits and block direct commits on `main` and `beta`, and a contributing guide with the branching model.

### Changed

- Peer dependency ranges now match what the library supports: `react-native` ≥ 0.76, `react` ≥ 18.3.1, `react-native-reanimated` ≥ 3.16 and < 4, `react-native-gesture-handler` ≥ 2.20 and < 3. Reanimated 4 and Gesture Handler 3 are not supported yet.
- The repository moved from GitLab to GitHub (`acertijosapps/react-native-md-document`): `repository` and `bugs` in `package.json` and `source` in the podspec, which now uses the `vX.Y.Z` tag.
- The public documentation (README, changelog, contributing guide) is now in English.

### Fixed

- The pages stacked behind the current one for the flip animation are hidden from the accessibility tree, so screen readers no longer read them.
- The error thrown when the native speech module is not linked now names the published package (`@acertijosapps/react-native-md-document`) instead of the old `react-native-document`, and is in English.

## [1.2.0] - 2026-10-25

### Added

- Book mode: on tablets and foldables in landscape, the document is shown as two facing pages with page-turning. Props `dualPage` (on by default), `dualPageMinWidth` and `spreadGap` (space for a foldable's hinge).
- `onPageChange` receives a fourth argument, `pagesPerView` (1 or 2).
- "Book mode" and "Foldables" sections in the README, with screenshots.

### Fixed

- Pagination on tablets: it no longer gets stuck or leaves blank pages because of late layout events.
- Book mode only turns on for tablet- or foldable-sized screens (window short side of at least 600 dp); a phone in landscape still shows a single page.

## [1.1.2] - 2026-10-13

### Changed

- `author`, email and `homepage` of AcertijosApps in `package.json` and the podspec.

## [1.1.1] - 2026-09-19

### Added

- `homepage`, `repository` and `bugs` in `package.json`, and an aligned podspec.

## [1.1.0] - 2026-09-19

### Added

- Loading the document through `source`, with loading and error states (`onLoad*`, `renderLoading`, `renderError`).

## [1.0.1] - 2026-09-19

### Changed

- README with the published package name and absolute image URLs, so they render on npm; `media/` is included in the package.
- Podspec renamed to `react-native-md-document.podspec`.
- Keywords `android`, `ios` and `zoom`.

## [1.0.0] - 2026-09-19

### Added

- First public release: Markdown-as-PDF viewer with page-turning, zoom, persistent highlights, text-to-speech (TTS) and light/dark color tokens, with injectable storage, source and speech engine.
