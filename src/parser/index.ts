import { parseBlocks } from './blocks';
import { looksLikeHtml, parseHtml } from './html';
import type { MDDocument, ParseContext } from './types';

export * from './types';

export function parse(source: string): MDDocument {
    const ctx: ParseContext = { parts: [], cursor: 0 };
    const normalized = source.replace(/\r\n?/g, '\n');
    const blocks = looksLikeHtml(normalized)
        ? parseHtml(normalized, ctx)
        : parseBlocks(normalized.split('\n'), ctx);
    const plainText = ctx.parts.join('');
    return { blocks, plainText, length: plainText.length };
}
