import type { SpeechEngine, SpeechHandlers } from './types';

export interface MockSpeechOptions {
    wordsPerMinute?: number;
}

interface Word {
    index: number;
    length: number;
}

export function createMockSpeechEngine(options: MockSpeechOptions = {}): SpeechEngine {
    const wpm = options.wordsPerMinute ?? 160;
    const basePerWordMs = Math.max(120, Math.round(60000 / wpm));
    let perWordMs = basePerWordMs;
    let timers: ReturnType<typeof setTimeout>[] = [];
    let words: Word[] = [];
    let handlers: SpeechHandlers | null = null;
    let nextIndex = 0;

    const clear = (): void => {
        for (const t of timers) {
            clearTimeout(t);
        }
        timers = [];
    };

    const schedule = (from: number): void => {
        clear();
        for (let i = from; i < words.length; i++) {
            const w = words[i]!;
            timers.push(
                setTimeout(
                    () => {
                        nextIndex = i + 1;
                        handlers?.onBoundary?.(w.index, w.length);
                    },
                    (i - from) * perWordMs,
                ),
            );
        }
        timers.push(
            setTimeout(
                () => {
                    handlers?.onDone?.();
                },
                Math.max(1, words.length - from) * perWordMs,
            ),
        );
    };

    return {
        speak(text, h, opts) {
            handlers = h;
            const rate = opts?.rate && opts.rate > 0 ? opts.rate : 1;
            perWordMs = Math.max(40, Math.round(basePerWordMs / rate));
            words = [];
            const re = /\S+/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec(text)) !== null) {
                words.push({ index: m.index, length: m[0].length });
            }
            nextIndex = 0;
            schedule(0);
        },
        stop() {
            clear();
            words = [];
            handlers = null;
            nextIndex = 0;
        },
        pause() {
            clear();
        },
        resume() {
            if (handlers) {
                schedule(nextIndex);
            }
        },
    };
}
