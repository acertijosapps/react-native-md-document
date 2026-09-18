import type { Block } from '../parser/types';

export interface OffsetRange {
    start: number;
    end: number;
}

function collect(block: Block, acc: { min: number; max: number }): void {
    switch (block.type) {
        case 'heading':
        case 'paragraph':
            for (const t of block.inlines) {
                acc.min = Math.min(acc.min, t.start);
                acc.max = Math.max(acc.max, t.end);
            }
            break;
        case 'code':
            acc.min = Math.min(acc.min, block.start);
            acc.max = Math.max(acc.max, block.end);
            break;
        case 'container':
        case 'blockquote':
        case 'listItem':
            for (const c of block.children) {
                collect(c, acc);
            }
            break;
        case 'list':
            for (const it of block.items) {
                for (const c of it.children) {
                    collect(c, acc);
                }
            }
            break;
        case 'table': {
            const rows = block.header ? [block.header, ...block.rows] : block.rows;
            for (const r of rows) {
                for (const cell of r.cells) {
                    for (const c of cell.children) {
                        collect(c, acc);
                    }
                }
            }
            break;
        }
        default:
            break;
    }
}

export function topLevelBlockRanges(blocks: Block[]): OffsetRange[] {
    return blocks.map((b) => {
        const acc = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
        collect(b, acc);
        return acc.max >= acc.min ? { start: acc.min, end: acc.max } : { start: -1, end: -1 };
    });
}

export function blockIndexForOffset(ranges: OffsetRange[], offset: number): number {
    return ranges.findIndex((r) => offset >= r.start && offset < r.end);
}

export function pageForBlock(pages: number[][], blockIndex: number): number {
    return pages.findIndex((p) => p.includes(blockIndex));
}
