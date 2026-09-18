import { type EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';

import type { SpeechEngine } from './types';

interface NativeDocumentSpeech {
    speak(text: string, options: Record<string, unknown>): void;
    stop(): void;
    pause?(): void;
    resume?(): void;
    addListener(event: string): void;
    removeListeners(count: number): void;
}

const LINK_ERROR =
    'Módulo nativo DocumentSpeech no enlazado. Instala react-native-document como dependencia nativa (pod install / gradle) o usa createMockSpeechEngine.';

export function createNativeSpeechEngine(): SpeechEngine {
    const native = NativeModules.DocumentSpeech as NativeDocumentSpeech | undefined;
    if (!native) {
        throw new Error(LINK_ERROR);
    }
    const emitter = new NativeEventEmitter(NativeModules.DocumentSpeech);
    let subs: EmitterSubscription[] = [];

    const clear = (): void => {
        for (const s of subs) {
            s.remove();
        }
        subs = [];
    };

    return {
        speak(text, handlers, options) {
            clear();
            subs.push(
                emitter.addListener(
                    'DocumentSpeech.boundary',
                    (e: { charIndex: number; charLength: number }) => {
                        handlers.onBoundary?.(e.charIndex, e.charLength);
                    },
                ),
            );
            subs.push(
                emitter.addListener('DocumentSpeech.done', () => {
                    handlers.onDone?.();
                }),
            );
            subs.push(
                emitter.addListener('DocumentSpeech.error', (e: { message?: string }) => {
                    handlers.onError?.(new Error(e?.message ?? 'speech error'));
                }),
            );
            native.speak(text, (options as Record<string, unknown>) ?? {});
        },
        stop() {
            clear();
            native.stop();
        },
        pause() {
            native.pause?.();
        },
        resume() {
            native.resume?.();
        },
    };
}
