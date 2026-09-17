import { parseBlocks } from './blocks';
import type { MDDocument, ParseContext } from './types';

export * from './types';

export function parse(source: string): MDDocument {
    const ctx: ParseContext = { parts: [], cursor: 0 };
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const blocks = parseBlocks(lines, ctx);
    const plainText = ctx.parts.join('');
    return { blocks, plainText, length: plainText.length };
}
