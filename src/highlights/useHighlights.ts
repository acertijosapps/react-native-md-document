import { useCallback, useEffect, useRef, useState } from 'react';

import type { Highlight } from '../render';
import type { HighlightStore } from './types';
import { wordBoundsAt } from './wordBounds';

export interface UseHighlightsParams {
    docId: string;
    plainText: string;
    store?: HighlightStore;
    color?: string;
}

export interface UseHighlights {
    highlights: Highlight[];
    isLoaded: boolean;
    toggleWordAt: (offset: number) => void;
    add: (highlight: Highlight) => void;
    remove: (id: string) => void;
    clear: () => void;
}

export function useHighlights({
    docId,
    plainText,
    store,
    color,
}: UseHighlightsParams): UseHighlights {
    const storeRef = useRef(store);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const skipSaveRef = useRef(false);

    useEffect(() => {
        storeRef.current = store;
    });

    useEffect(() => {
        let cancelled = false;
        setIsLoaded(false);
        const active = storeRef.current;
        if (!active) {
            skipSaveRef.current = true;
            setHighlights([]);
            setIsLoaded(true);
            return;
        }
        Promise.resolve(active.load(docId))
            .then((loaded) => {
                if (cancelled) {
                    return;
                }
                skipSaveRef.current = true;
                setHighlights(loaded);
                setIsLoaded(true);
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }
                skipSaveRef.current = true;
                setHighlights([]);
                setIsLoaded(true);
            });
        return () => {
            cancelled = true;
        };
    }, [docId]);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }
        if (skipSaveRef.current) {
            skipSaveRef.current = false;
            return;
        }
        const active = storeRef.current;
        if (active) {
            Promise.resolve(active.save(docId, highlights)).catch(() => undefined);
        }
    }, [highlights, isLoaded, docId]);

    const toggleWordAt = useCallback(
        (offset: number) => {
            setHighlights((prev) => {
                const existing = prev.find((h) => offset >= h.start && offset < h.end);
                if (existing) {
                    return prev.filter((h) => h !== existing);
                }
                const bounds = wordBoundsAt(plainText, offset);
                if (!bounds) {
                    return prev;
                }
                const id = `${bounds.start}-${bounds.end}`;
                if (prev.some((h) => h.id === id)) {
                    return prev;
                }
                const next: Highlight = color
                    ? { id, start: bounds.start, end: bounds.end, color }
                    : { id, start: bounds.start, end: bounds.end };
                return [...prev, next];
            });
        },
        [plainText, color],
    );

    const add = useCallback((highlight: Highlight) => {
        setHighlights((prev) =>
            prev.some((h) => h.id === highlight.id) ? prev : [...prev, highlight],
        );
    }, []);

    const remove = useCallback((id: string) => {
        setHighlights((prev) => prev.filter((h) => h.id !== id));
    }, []);

    const clear = useCallback(() => {
        setHighlights([]);
    }, []);

    return { highlights, isLoaded, toggleWordAt, add, remove, clear };
}
