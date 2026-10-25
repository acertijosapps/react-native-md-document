export const DUAL_PAGE_MIN_WIDTH = 600;

export interface SpreadInput {
    width: number;
    height: number;
    enabled: boolean;
    minWidth: number;
    gap: number;
}

export interface SpreadLayout {
    isSpread: boolean;
    pageWidth: number;
}

export function resolveSpread({
    width,
    height,
    enabled,
    minWidth,
    gap,
}: SpreadInput): SpreadLayout {
    const isSpread = enabled && width > height && width >= minWidth;
    if (!isSpread) {
        return { isSpread: false, pageWidth: width };
    }
    return { isSpread: true, pageWidth: Math.max(0, (width - Math.max(0, gap)) / 2) };
}

export function spreadStartIndex(pageIndex: number, isSpread: boolean): number {
    return isSpread ? pageIndex - (pageIndex % 2) : pageIndex;
}
