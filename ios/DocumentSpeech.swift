import AVFoundation
import React

@objc(DocumentSpeech)
class DocumentSpeech: RCTEventEmitter, AVSpeechSynthesizerDelegate {
    private let synthesizer = AVSpeechSynthesizer()
    private var hasListeners = false

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["DocumentSpeech.boundary", "DocumentSpeech.done", "DocumentSpeech.error"]
    }

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }

    @objc(speak:options:)
    func speak(_ text: String, options: NSDictionary) {
        let utterance = AVSpeechUtterance(string: text)
        if let language = options["language"] as? String {
            utterance.voice = AVSpeechSynthesisVoice(language: language)
        }
        if let voice = options["voice"] as? String,
           let selected = AVSpeechSynthesisVoice(identifier: voice) {
            utterance.voice = selected
        }
        if let rate = options["rate"] as? NSNumber {
            utterance.rate = rate.floatValue
        }
        if let pitch = options["pitch"] as? NSNumber {
            utterance.pitchMultiplier = pitch.floatValue
        }
        synthesizer.stopSpeaking(at: .immediate)
        synthesizer.speak(utterance)
    }

    @objc(stop)
    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
    }

    func speechSynthesizer(
        _ synthesizer: AVSpeechSynthesizer,
        willSpeakRangeOfSpeechString characterRange: NSRange,
        utterance: AVSpeechUtterance
    ) {
        guard hasListeners else { return }
        sendEvent(
            withName: "DocumentSpeech.boundary",
            body: ["charIndex": characterRange.location, "charLength": characterRange.length]
        )
    }

    func speechSynthesizer(
        _ synthesizer: AVSpeechSynthesizer,
        didFinish utterance: AVSpeechUtterance
    ) {
        guard hasListeners else { return }
        sendEvent(withName: "DocumentSpeech.done", body: nil)
    }
}
