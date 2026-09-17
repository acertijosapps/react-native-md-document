import type { ActiveRange } from '../render';

export interface SpeechOptions {
    rate?: number;
    pitch?: number;
    language?: string;
    voice?: string;
}

export interface SpeechHandlers {
    onBoundary?: (charIndex: number, charLength: number) => void;
    onDone?: () => void;
    onError?: (error: unknown) => void;
}

export interface SpeechEngine {
    speak(text: string, handlers: SpeechHandlers, options?: SpeechOptions): void;
    stop(): void;
}

export interface SpeechUtterance {
    text: string;
    start: number;
    end: number;
}

export function segmentUtterances(plainText: string): SpeechUtterance[] {
    const out: SpeechUtterance[] = [];
    const re = /[^\n]+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(plainText)) !== null) {
        const text = m[0];
        if (text.trim().length === 0) {
            continue;
        }
        out.push({ text, start: m.index, end: m.index + text.length });
    }
    return out;
}

export function boundaryToRange(
    utterance: SpeechUtterance,
    charIndex: number,
    charLength: number,
): ActiveRange {
    const start = utterance.start + Math.max(0, charIndex);
    const end = Math.min(utterance.end, start + Math.max(0, charLength));
    return { start, end };
}
