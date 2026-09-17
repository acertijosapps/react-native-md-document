import { parseInline } from './inline';
import type { Block, CodeBlock, ListItemBlock, ParseContext, TableAlign, TableRow } from './types';

const BLANK = /^\s*$/;
const ATX = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const THEMATIC = /^\s*([-*_])(\s*\1){2,}\s*$/;
const FENCE = /^(\s*)(`{3,}|~{3,})(.*)$/;
const BLOCKQUOTE = /^\s{0,3}>\s?(.*)$/;
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])(\s+)(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

function isBlank(line: string): boolean {
    return BLANK.test(line);
}

function gap(ctx: ParseContext): void {
    if (ctx.cursor > 0) {
        ctx.parts.push('\n');
        ctx.cursor += 1;
    }
}

function emitLiteral(ctx: ParseContext, text: string): { start: number; end: number } {
    const start = ctx.cursor;
    ctx.parts.push(text);
    ctx.cursor += text.length;
    return { start, end: ctx.cursor };
}

function markerWidth(m: RegExpExecArray): number {
    return m[1]!.length + m[2]!.length + m[3]!.length;
}

function leadingSpaces(line: string): number {
    const m = /^(\s*)/.exec(line);
    return m ? m[1]!.length : 0;
}

function splitRow(line: string): string[] {
    let s = line.trim();
    if (s.startsWith('|')) {
        s = s.slice(1);
    }
    if (s.endsWith('|')) {
        s = s.slice(0, -1);
    }
    return s.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

function parseAlign(spec: string): TableAlign {
    const s = spec.trim();
    const left = s.startsWith(':');
    const right = s.endsWith(':');
    if (left && right) {
        return 'center';
    }
    if (right) {
        return 'right';
    }
    if (left) {
        return 'left';
    }
    return null;
}

function isTableStart(lines: string[], i: number): boolean {
    const cur = lines[i];
    const nxt = lines[i + 1];
    return (
        cur !== undefined &&
        cur.includes('|') &&
        nxt !== undefined &&
        nxt.includes('-') &&
        TABLE_SEP.test(nxt)
    );
}

function buildRow(cells: string[], width: number, ctx: ParseContext): TableRow {
    const out = [];
    for (let c = 0; c < width; c++) {
        gap(ctx);
        out.push({ inlines: parseInline(cells[c] ?? '', ctx) });
    }
    return { cells: out };
}

function startsBlock(line: string): boolean {
    return (
        FENCE.test(line) ||
        ATX.test(line) ||
        THEMATIC.test(line) ||
        BLOCKQUOTE.test(line) ||
        LIST_ITEM.test(line)
    );
}

export function parseBlocks(lines: string[], ctx: ParseContext): Block[] {
    const blocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i]!;

        if (isBlank(line)) {
            i++;
            continue;
        }

        const fence = FENCE.exec(line);
        if (fence) {
            const marker = fence[2]!;
            const lang = fence[3]!.trim() || undefined;
            const body: string[] = [];
            i++;
            while (
                i < lines.length &&
                !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[i]!)
            ) {
                body.push(lines[i]!);
                i++;
            }
            if (i < lines.length) {
                i++;
            }
            gap(ctx);
            const text = body.join('\n');
            const { start, end } = emitLiteral(ctx, text);
            const block: CodeBlock = { type: 'code', text, start, end };
            if (lang) {
                block.lang = lang;
            }
            blocks.push(block);
            continue;
        }

        const atx = ATX.exec(line);
        if (atx) {
            gap(ctx);
            const level = atx[1]!.length as 1 | 2 | 3 | 4 | 5 | 6;
            blocks.push({ type: 'heading', level, inlines: parseInline(atx[2]!, ctx) });
            i++;
            continue;
        }

        if (THEMATIC.test(line)) {
            blocks.push({ type: 'thematicBreak' });
            i++;
            continue;
        }

        if (BLOCKQUOTE.test(line)) {
            const inner: string[] = [];
            while (i < lines.length) {
                const m = BLOCKQUOTE.exec(lines[i]!);
                if (!m) {
                    break;
                }
                inner.push(m[1]!);
                i++;
            }
            blocks.push({ type: 'blockquote', children: parseBlocks(inner, ctx) });
            continue;
        }

        const li = LIST_ITEM.exec(line);
        if (li) {
            const ordered = /\d/.test(li[2]!);
            const startNum = ordered ? parseInt(li[2]!, 10) : undefined;
            const items: ListItemBlock[] = [];

            while (i < lines.length) {
                const m = LIST_ITEM.exec(lines[i]!);
                if (!m) {
                    break;
                }
                const mOrdered = /\d/.test(m[2]!);
                if (mOrdered !== ordered) {
                    break;
                }

                const contentLines: string[] = [m[4]!];
                const indent = markerWidth(m);
                i++;
                while (i < lines.length) {
                    const next = lines[i]!;
                    if (isBlank(next)) {
                        contentLines.push('');
                        i++;
                        continue;
                    }
                    if (LIST_ITEM.test(next) && leadingSpaces(next) < indent) {
                        break;
                    }
                    if (leadingSpaces(next) >= indent) {
                        contentLines.push(next.slice(indent));
                        i++;
                        continue;
                    }
                    break;
                }
                items.push({ type: 'listItem', children: parseBlocks(contentLines, ctx) });
            }

            const list = ordered
                ? { type: 'list' as const, ordered, start: startNum, items }
                : { type: 'list' as const, ordered, items };
            blocks.push(list);
            continue;
        }

        if (isTableStart(lines, i)) {
            const headerCells = splitRow(lines[i]!);
            const aligns = splitRow(lines[i + 1]!).map(parseAlign);
            i += 2;
            const bodyRows: string[][] = [];
            while (i < lines.length && !isBlank(lines[i]!) && lines[i]!.includes('|')) {
                bodyRows.push(splitRow(lines[i]!));
                i++;
            }
            const width = Math.max(headerCells.length, ...bodyRows.map((r) => r.length));
            const align: TableAlign[] = [];
            for (let c = 0; c < width; c++) {
                align.push(aligns[c] ?? null);
            }
            gap(ctx);
            const header = buildRow(headerCells, width, ctx);
            const rows = bodyRows.map((r) => buildRow(r, width, ctx));
            blocks.push({ type: 'table', header, rows, align });
            continue;
        }

        const para: string[] = [];
        while (
            i < lines.length &&
            !isBlank(lines[i]!) &&
            !startsBlock(lines[i]!) &&
            !isTableStart(lines, i)
        ) {
            para.push(lines[i]!.trim());
            i++;
        }
        gap(ctx);
        blocks.push({ type: 'paragraph', inlines: parseInline(para.join(' '), ctx) });
    }

    return blocks;
}
