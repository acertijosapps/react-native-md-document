import type { Highlight } from '../render';
import type { HighlightStore, KeyValueStore } from './types';

function isHighlight(value: unknown): value is Highlight {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const h = value as Record<string, unknown>;
    return (
        typeof h.id === 'string' &&
        typeof h.start === 'number' &&
        typeof h.end === 'number' &&
        (h.color === undefined || typeof h.color === 'string')
    );
}

function parseHighlights(raw: string | null): Highlight[] {
    if (!raw) {
        return [];
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(isHighlight);
    } catch {
        return [];
    }
}

export function createKeyValueHighlightStore(
    kv: KeyValueStore,
    keyPrefix = 'rnd:highlights:',
): HighlightStore {
    const keyFor = (docId: string): string => `${keyPrefix}${docId}`;
    return {
        async load(docId) {
            const raw = await Promise.resolve(kv.getItem(keyFor(docId)));
            return parseHighlights(raw);
        },
        async save(docId, highlights) {
            await Promise.resolve(kv.setItem(keyFor(docId), JSON.stringify(highlights)));
        },
    };
}

export function createMemoryHighlightStore(): HighlightStore {
    const map = new Map<string, Highlight[]>();
    return {
        load(docId) {
            return map.get(docId) ?? [];
        },
        save(docId, highlights) {
            map.set(docId, highlights);
        },
    };
}
