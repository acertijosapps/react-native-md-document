import type { Block } from '../parser/types';

/**
 * Packs blocks into pages. A block flagged in `keepWithNext` (a heading) never ends a page
 * on its own: it travels with the blocks that follow it, up to and including the first
 * unflagged one. A group that is taller than a page is packed block by block instead.
 */
export function paginate(
    heights: number[],
    pageHeight: number,
    keepWithNext: readonly boolean[] = [],
): number[][] {
    const pages: number[][] = [];
    let current: number[] = [];
    let used = 0;

    const place = (indices: number[], height: number): void => {
        if (current.length > 0 && used + height > pageHeight) {
            pages.push(current);
            current = [];
            used = 0;
        }
        current.push(...indices);
        used += height;
    };

    let i = 0;
    while (i < heights.length) {
        let end = i;
        while (end < heights.length - 1 && keepWithNext[end]) {
            end++;
        }
        const group: number[] = [];
        let groupHeight = 0;
        for (let j = i; j <= end; j++) {
            group.push(j);
            groupHeight += heights[j]!;
        }

        if (groupHeight <= pageHeight) {
            place(group, groupHeight);
        } else {
            for (const index of group) {
                place([index], heights[index]!);
            }
        }
        i = end + 1;
    }

    if (current.length > 0) {
        pages.push(current);
    }

    return pages;
}

export function keepWithNextFlags(blocks: readonly Block[]): boolean[] {
    return blocks.map((block) => block.type === 'heading');
}
