export interface WordBounds {
    start: number;
    end: number;
}

export function wordBoundsAt(text: string, offset: number): WordBounds | null {
    if (offset < 0 || offset >= text.length || /\s/.test(text[offset]!)) {
        return null;
    }
    let start = offset;
    while (start > 0 && !/\s/.test(text[start - 1]!)) {
        start--;
    }
    let end = offset;
    while (end < text.length && !/\s/.test(text[end]!)) {
        end++;
    }
    return { start, end };
}
