import type { SpeechEngine } from './types';

export interface MockSpeechOptions {
    wordsPerMinute?: number;
}

export function createMockSpeechEngine(options: MockSpeechOptions = {}): SpeechEngine {
    const wpm = options.wordsPerMinute ?? 160;
    const perWordMs = Math.max(120, Math.round(60000 / wpm));
    let timers: ReturnType<typeof setTimeout>[] = [];

    const clear = (): void => {
        for (const t of timers) {
            clearTimeout(t);
        }
        timers = [];
    };

    return {
        speak(text, handlers) {
            clear();
            const words: { index: number; length: number }[] = [];
            const re = /\S+/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec(text)) !== null) {
                words.push({ index: m.index, length: m[0].length });
            }
            words.forEach((w, i) => {
                timers.push(
                    setTimeout(() => {
                        handlers.onBoundary?.(w.index, w.length);
                    }, i * perWordMs),
                );
            });
            timers.push(
                setTimeout(
                    () => {
                        handlers.onDone?.();
                    },
                    Math.max(1, words.length) * perWordMs,
                ),
            );
        },
        stop() {
            clear();
        },
    };
}
