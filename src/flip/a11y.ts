export interface ViewerAccessibilityLabels {
    /** Label of the invisible page control that screen readers swipe to turn pages. */
    control: string;
    /** Spoken position, e.g. "Page 3 of 12" or "Pages 3 and 4 of 12". */
    pages: (first: number, last: number, total: number) => string;
    nextPage: string;
    previousPage: string;
}

export const DEFAULT_ACCESSIBILITY_LABELS: ViewerAccessibilityLabels = {
    control: 'Document pages',
    pages: (first, last, total) =>
        first === last ? `Page ${first} of ${total}` : `Pages ${first} and ${last} of ${total}`,
    nextPage: 'Next page',
    previousPage: 'Previous page',
};

export function mergeAccessibilityLabels(
    overrides?: Partial<ViewerAccessibilityLabels>,
): ViewerAccessibilityLabels {
    return { ...DEFAULT_ACCESSIBILITY_LABELS, ...overrides };
}

export function visiblePageRange(
    pageIndex: number,
    pagesPerView: number,
    pageCount: number,
): { first: number; last: number } {
    const first = Math.min(pageIndex, Math.max(0, pageCount - 1)) + 1;
    return { first, last: Math.min(first + pagesPerView - 1, Math.max(1, pageCount)) };
}

export function stepPageIndex(
    pageIndex: number,
    direction: 1 | -1,
    pagesPerView: number,
    pageCount: number,
): number {
    const next = pageIndex + direction * pagesPerView;
    return Math.min(Math.max(0, next), Math.max(0, pageCount - 1));
}
