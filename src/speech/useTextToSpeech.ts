import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ActiveRange } from '../render';
import type { SpeechEngine, SpeechOptions } from './types';
import { boundaryToRange, segmentUtterances } from './types';

export type SpeechStatus = 'idle' | 'speaking' | 'paused';

export interface UseTextToSpeechParams {
    plainText: string;
    engine: SpeechEngine;
    options?: SpeechOptions;
}

export interface UseTextToSpeech {
    status: SpeechStatus;
    activeRange: ActiveRange | null;
    index: number;
    count: number;
    play: (fromOffset?: number) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
}

export function useTextToSpeech({
    plainText,
    engine,
    options,
}: UseTextToSpeechParams): UseTextToSpeech {
    const utterances = useMemo(() => segmentUtterances(plainText), [plainText]);

    const uttRef = useRef(utterances);
    const engineRef = useRef(engine);
    const optionsRef = useRef(options);
    useEffect(() => {
        uttRef.current = utterances;
        engineRef.current = engine;
        optionsRef.current = options;
    });

    const [status, setStatus] = useState<SpeechStatus>('idle');
    const [activeRange, setActiveRange] = useState<ActiveRange | null>(null);
    const [index, setIndex] = useState(0);
    const indexRef = useRef(0);
    const statusRef = useRef<SpeechStatus>('idle');
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const speakAt = useCallback((i: number) => {
        const utts = uttRef.current;
        if (i >= utts.length) {
            indexRef.current = 0;
            setIndex(0);
            setActiveRange(null);
            setStatus('idle');
            return;
        }
        indexRef.current = i;
        setIndex(i);
        setStatus('speaking');
        const utt = utts[i]!;
        engineRef.current.speak(
            utt.text,
            {
                onBoundary: (charIndex, charLength) => {
                    setActiveRange(boundaryToRange(utt, charIndex, charLength));
                },
                onDone: () => speakAt(i + 1),
                onError: () => {
                    setActiveRange(null);
                    setStatus('idle');
                },
            },
            optionsRef.current,
        );
    }, []);

    const rate = options?.rate;
    useEffect(() => {
        if (statusRef.current === 'speaking') {
            speakAt(indexRef.current);
        }
    }, [rate, speakAt]);

    const play = useCallback(
        (fromOffset?: number) => {
            engineRef.current.stop();
            const utts = uttRef.current;
            let start = 0;
            if (fromOffset !== undefined && fromOffset > 0) {
                const found = utts.findIndex((u) => u.end > fromOffset);
                start = found < 0 ? 0 : found;
            }
            speakAt(start);
        },
        [speakAt],
    );

    const pause = useCallback(() => {
        const current = engineRef.current;
        if (current.pause) {
            current.pause();
        } else {
            current.stop();
        }
        setStatus('paused');
    }, []);

    const resume = useCallback(() => {
        const current = engineRef.current;
        if (current.resume) {
            current.resume();
            setStatus('speaking');
        } else {
            speakAt(indexRef.current);
        }
    }, [speakAt]);

    const stop = useCallback(() => {
        engineRef.current.stop();
        indexRef.current = 0;
        setIndex(0);
        setActiveRange(null);
        setStatus('idle');
    }, []);

    useEffect(() => {
        engineRef.current.stop();
        indexRef.current = 0;
        setIndex(0);
        setActiveRange(null);
        setStatus('idle');
    }, [plainText]);

    useEffect(
        () => () => {
            engineRef.current.stop();
        },
        [],
    );

    return {
        status,
        activeRange,
        index,
        count: utterances.length,
        play,
        pause,
        resume,
        stop,
    };
}
