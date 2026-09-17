import type {
    Block,
    BlockStyle,
    Inline,
    InlineStyle,
    ParseContext,
    TableBlock,
    TableRow,
    TextToken,
} from './types';

interface ElementNode {
    name: string;
    style: Record<string, string>;
    children: HtmlNode[];
}
type HtmlNode = ElementNode | { text: string };

const VOID = new Set(['br', 'col', 'hr', 'img', 'meta', 'input']);
const INLINE = new Set(['strong', 'b', 'em', 'i', 'span', 'a', 'code', 'u', 'small', 'br']);

function stripComments(html: string): string {
    return html.replace(/<!--[\s\S]*?-->/g, '');
}

function decodeEntities(text: string): string {
    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, n: string) => String.fromCharCode(parseInt(n, 16)));
}

function parseStyle(raw: string): Record<string, string> {
    const out: Record<string, string> = {};
    const m = /style\s*=\s*"([^"]*)"/i.exec(raw);
    if (!m) {
        return out;
    }
    for (const decl of m[1]!.split(';')) {
        const idx = decl.indexOf(':');
        if (idx < 0) {
            continue;
        }
        const key = decl.slice(0, idx).trim().toLowerCase();
        const value = decl.slice(idx + 1).trim();
        if (key) {
            out[key] = value;
        }
    }
    return out;
}

function parseTree(html: string): ElementNode {
    const root: ElementNode = { name: '#root', style: {}, children: [] };
    const stack: ElementNode[] = [root];
    const tagRe = /<(\/)?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)(\/)?>/g;
    let last = 0;
    let m: RegExpExecArray | null;

    const pushText = (raw: string): void => {
        const text = decodeEntities(raw);
        if (text.length > 0) {
            stack[stack.length - 1]!.children.push({ text });
        }
    };

    while ((m = tagRe.exec(html)) !== null) {
        if (m.index > last) {
            pushText(html.slice(last, m.index));
        }
        last = tagRe.lastIndex;
        const closing = m[1] === '/';
        const name = m[2]!.toLowerCase();
        const rawAttrs = m[3] ?? '';
        const selfClose = m[4] === '/' || VOID.has(name);

        if (closing) {
            for (let i = stack.length - 1; i > 0; i--) {
                if (stack[i]!.name === name) {
                    stack.length = i;
                    break;
                }
            }
            continue;
        }
        const node: ElementNode = { name, style: parseStyle(rawAttrs), children: [] };
        stack[stack.length - 1]!.children.push(node);
        if (!selfClose) {
            stack.push(node);
        }
    }
    if (last < html.length) {
        pushText(html.slice(last));
    }
    return root;
}

function toNumber(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : undefined;
}

function blockStyle(style: Record<string, string>): BlockStyle | undefined {
    const s: BlockStyle = {};
    const align = style['text-align'];
    if (align === 'left' || align === 'center' || align === 'right' || align === 'justify') {
        s.align = align;
    }
    if (style.color) {
        s.color = style.color;
    }
    const bg = style.background ?? style['background-color'];
    if (bg) {
        s.background = bg.split(/\s+/)[0]!;
    }
    const fontSize = toNumber(style['font-size']);
    if (fontSize !== undefined) {
        s.fontSize = fontSize;
    }
    if (style['font-weight'] === 'bold' || Number(style['font-weight']) >= 600) {
        s.fontWeight = 'bold';
    }
    if (style['font-style'] === 'italic') {
        s.fontStyle = 'italic';
    }
    const tt = style['text-transform'];
    if (tt === 'uppercase' || tt === 'lowercase' || tt === 'none') {
        s.textTransform = tt;
    }
    return Object.keys(s).length > 0 ? s : undefined;
}

function inlineStyleFrom(style: Record<string, string>, base: InlineStyle): InlineStyle {
    const s: InlineStyle = { ...base };
    if (style.color) {
        s.color = style.color;
    }
    const bg = style.background ?? style['background-color'];
    if (bg) {
        s.backgroundColor = bg.split(/\s+/)[0]!;
    }
    const fontSize = toNumber(style['font-size']);
    if (fontSize !== undefined) {
        s.fontSize = fontSize;
    }
    if (style['font-style'] === 'italic') {
        s.italic = true;
    }
    if (style['font-weight'] === 'bold' || Number(style['font-weight']) >= 600) {
        s.bold = true;
    }
    return s;
}

function isElement(node: HtmlNode): node is ElementNode {
    return (node as ElementNode).name !== undefined;
}

function collapse(text: string): string {
    return text.replace(/\s+/g, ' ');
}

function hasVisible(nodes: HtmlNode[]): boolean {
    return nodes.some((n) =>
        isElement(n) ? hasVisible(n.children) : collapse(n.text).trim().length > 0,
    );
}

function emit(ctx: ParseContext, text: string, style: InlineStyle): TextToken {
    const start = ctx.cursor;
    ctx.parts.push(text);
    ctx.cursor += text.length;
    return { type: 'text', text, start, end: ctx.cursor, style };
}

function gap(ctx: ParseContext): void {
    if (ctx.cursor > 0) {
        ctx.parts.push('\n');
        ctx.cursor += 1;
    }
}

function inlinesFrom(nodes: HtmlNode[], base: InlineStyle, ctx: ParseContext, out: Inline[]): void {
    for (const node of nodes) {
        if (!isElement(node)) {
            const text = collapse(node.text);
            if (text.length === 0) {
                continue;
            }
            if (text === ' ' && out.length === 0) {
                continue;
            }
            out.push(emit(ctx, text, { ...base }));
            continue;
        }
        switch (node.name) {
            case 'strong':
            case 'b':
                inlinesFrom(node.children, { ...base, bold: true }, ctx, out);
                break;
            case 'em':
            case 'i':
                inlinesFrom(node.children, { ...base, italic: true }, ctx, out);
                break;
            case 'code':
                inlinesFrom(node.children, { ...base, code: true }, ctx, out);
                break;
            case 'a':
                inlinesFrom(node.children, { ...base }, ctx, out);
                break;
            case 'span':
            case 'u':
            case 'small':
                inlinesFrom(node.children, inlineStyleFrom(node.style, base), ctx, out);
                break;
            case 'br':
                break;
            default:
                inlinesFrom(node.children, base, ctx, out);
                break;
        }
    }
}

function headingLevel(name: string): 1 | 2 | 3 | 4 | 5 | 6 | null {
    const m = /^h([1-6])$/.exec(name);
    return m ? (Number(m[1]) as 1 | 2 | 3 | 4 | 5 | 6) : null;
}

function mergeStyle(a?: BlockStyle, b?: BlockStyle): BlockStyle | undefined {
    if (!a) {
        return b;
    }
    if (!b) {
        return a;
    }
    return { ...a, ...b };
}

function textInherit(style?: BlockStyle): BlockStyle | undefined {
    if (!style) {
        return undefined;
    }
    const s: BlockStyle = {};
    if (style.align) {
        s.align = style.align;
    }
    if (style.color) {
        s.color = style.color;
    }
    if (style.fontSize !== undefined) {
        s.fontSize = style.fontSize;
    }
    if (style.fontWeight) {
        s.fontWeight = style.fontWeight;
    }
    if (style.fontStyle) {
        s.fontStyle = style.fontStyle;
    }
    if (style.textTransform) {
        s.textTransform = style.textTransform;
    }
    return Object.keys(s).length > 0 ? s : undefined;
}

function tableFrom(node: ElementNode, ctx: ParseContext, inherit?: BlockStyle): TableBlock {
    const colWidths: (number | null)[] = [];
    const collectCols = (n: ElementNode): void => {
        for (const child of n.children) {
            if (!isElement(child)) {
                continue;
            }
            if (child.name === 'colgroup') {
                collectCols(child);
            } else if (child.name === 'col') {
                const w = child.style.width;
                const pct = w ? toNumber(w) : undefined;
                colWidths.push(pct !== undefined ? pct / 100 : null);
            }
        }
    };
    collectCols(node);

    const rows: TableRow[] = [];
    const collectRows = (n: ElementNode): void => {
        for (const child of n.children) {
            if (!isElement(child)) {
                continue;
            }
            if (child.name === 'tr') {
                const cells = child.children
                    .filter(
                        (c): c is ElementNode =>
                            isElement(c) && (c.name === 'td' || c.name === 'th'),
                    )
                    .map((c) => {
                        gap(ctx);
                        const own = blockStyle(c.style);
                        const cellInherit = textInherit(mergeStyle(inherit, own));
                        return {
                            children: blocksFrom(c.children, ctx, cellInherit),
                            style: own,
                        };
                    });
                rows.push({ cells });
            } else if (child.name === 'tbody' || child.name === 'thead') {
                collectRows(child);
            }
        }
    };
    collectRows(node);

    const table: TableBlock = { type: 'table', rows, align: [] };
    if (colWidths.length > 0) {
        table.colWidths = colWidths;
    }
    const style = blockStyle(node.style);
    if (style) {
        table.style = style;
    }
    return table;
}

function blocksFrom(nodes: HtmlNode[], ctx: ParseContext, inherit?: BlockStyle): Block[] {
    const blocks: Block[] = [];
    let inlineBuf: HtmlNode[] = [];

    const flushInline = (): void => {
        if (inlineBuf.length > 0 && hasVisible(inlineBuf)) {
            gap(ctx);
            const inlines: Inline[] = [];
            inlinesFrom(inlineBuf, {}, ctx, inlines);
            if (inlines.length > 0) {
                blocks.push(
                    inherit
                        ? { type: 'paragraph', inlines, style: inherit }
                        : { type: 'paragraph', inlines },
                );
            }
        }
        inlineBuf = [];
    };

    for (const node of nodes) {
        if (!isElement(node) || INLINE.has(node.name)) {
            inlineBuf.push(node);
            continue;
        }
        flushInline();
        const level = headingLevel(node.name);
        if (level) {
            gap(ctx);
            const inlines: Inline[] = [];
            inlinesFrom(node.children, {}, ctx, inlines);
            const style = mergeStyle(inherit, blockStyle(node.style));
            blocks.push(
                style
                    ? { type: 'heading', level, inlines, style }
                    : { type: 'heading', level, inlines },
            );
            continue;
        }
        switch (node.name) {
            case 'p': {
                gap(ctx);
                const inlines: Inline[] = [];
                inlinesFrom(node.children, {}, ctx, inlines);
                const style = mergeStyle(inherit, blockStyle(node.style));
                blocks.push(
                    style ? { type: 'paragraph', inlines, style } : { type: 'paragraph', inlines },
                );
                break;
            }
            case 'div':
            case 'section':
            case 'article':
            case 'header':
            case 'footer':
            case 'main': {
                const own = blockStyle(node.style);
                const childInherit = textInherit(mergeStyle(inherit, own));
                const children = blocksFrom(node.children, ctx, childInherit);
                blocks.push(
                    own
                        ? { type: 'container', children, style: own }
                        : { type: 'container', children },
                );
                break;
            }
            case 'table':
                blocks.push(tableFrom(node, ctx, inherit));
                break;
            case 'hr':
                blocks.push({ type: 'thematicBreak' });
                break;
            case 'blockquote':
                blocks.push({
                    type: 'blockquote',
                    children: blocksFrom(node.children, ctx, inherit),
                });
                break;
            default:
                blocks.push(...blocksFrom(node.children, ctx, inherit));
                break;
        }
    }
    flushInline();
    return blocks;
}

export function looksLikeHtml(source: string): boolean {
    const trimmed = stripComments(source).trimStart();
    return /^<(div|table|section|article|header|footer|main|p|h[1-6])[\s>]/i.test(trimmed);
}

export function parseHtml(source: string, ctx: ParseContext): Block[] {
    const root = parseTree(stripComments(source));
    return blocksFrom(root.children, ctx);
}
