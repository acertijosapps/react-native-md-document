import type { Highlight } from '../render';

export interface HighlightStore {
    load(docId: string): Promise<Highlight[]> | Highlight[];
    save(docId: string, highlights: Highlight[]): Promise<void> | void;
}

export interface KeyValueStore {
    getItem(key: string): Promise<string | null> | string | null;
    setItem(key: string, value: string): Promise<void> | void;
}
