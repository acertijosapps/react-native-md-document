import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parse } from '../index';
import type { Block, MDDocument, TextToken } from '../types';

/** Collect every offset-bearing node (text tokens + code blocks). */
function offsetNodes(doc: MDDocument): { text: string; start: number; end: number }[] {
    const out: { text: string; start: number; end: number }[] = [];
    const walk = (blocks: Block[]) => {
        for (const b of blocks) {
            switch (b.type) {
                case 'heading':
                case 'paragraph':
                    for (const t of b.inlines) {
                        out.push(t);
                    }
                    break;
                case 'code':
                    out.push({ text: b.text, start: b.start, end: b.end });
                    break;
                case 'blockquote':
                    walk(b.children);
                    break;
                case 'list':
                    for (const it of b.items) {
                        walk(it.children);
                    }
                    break;
                case 'listItem':
                    walk(b.children);
                    break;
                default:
                    break;
            }
        }
    };
    walk(doc.blocks);
    return out;
}

const SAMPLE = `# Título del documento

Este es un **párrafo** con _énfasis_, \`código\` y un [enlace](https://example.com).

## Subtítulo

- item uno
- item **dos**
- item tres

1. primero
2. segundo

> una cita con *cursiva*
> segunda línea

\`\`\`ts
const x = 1;
const y = 2;
\`\`\`

---

Párrafo final con ~~tachado~~.`;

test('keystone invariant: token.text === plainText.slice(start,end)', () => {
    const doc = parse(SAMPLE);
    const nodes = offsetNodes(doc);
    assert.ok(nodes.length > 0, 'expected some offset-bearing nodes');
    for (const n of nodes) {
        assert.equal(
            n.text,
            doc.plainText.slice(n.start, n.end),
            `offset mismatch for ${JSON.stringify(n.text)} at [${n.start},${n.end})`,
        );
    }
});

test('offset ranges never overlap and are ordered', () => {
    const doc = parse(SAMPLE);
    const nodes = offsetNodes(doc).sort((a, b) => a.start - b.start);
    let prevEnd = -1;
    for (const n of nodes) {
        assert.ok(n.start >= prevEnd, `overlap at [${n.start},${n.end})`);
        assert.ok(n.end >= n.start, 'end before start');
        prevEnd = n.end;
    }
});

test('headings capture level and text', () => {
    const doc = parse(SAMPLE);
    const h1 = doc.blocks.find((b) => b.type === 'heading' && b.level === 1);
    assert.ok(h1 && h1.type === 'heading');
    assert.equal(h1.inlines.map((t) => t.text).join(''), 'Título del documento');
});

test('inline styles: bold, italic, code, link, strikethrough', () => {
    const doc = parse(SAMPLE);
    const all: TextToken[] = [];
    const collect = (blocks: Block[]) => {
        for (const b of blocks) {
            if (b.type === 'paragraph' || b.type === 'heading') {
                all.push(...b.inlines);
            } else if (b.type === 'blockquote') {
                collect(b.children);
            } else if (b.type === 'list') {
                b.items.forEach((it) => collect(it.children));
            }
        }
    };
    collect(doc.blocks);
    assert.ok(all.some((t) => t.style.bold && t.text === 'párrafo'));
    assert.ok(all.some((t) => t.style.italic && t.text === 'énfasis'));
    assert.ok(all.some((t) => t.style.code && t.text === 'código'));
    assert.ok(all.some((t) => t.style.link === 'https://example.com' && t.text === 'enlace'));
    assert.ok(all.some((t) => t.style.strikethrough && t.text === 'tachado'));
});

test('lists: ordered/unordered and item count', () => {
    const doc = parse(SAMPLE);
    const lists = doc.blocks.filter((b) => b.type === 'list');
    assert.equal(lists.length, 2);
    const [ul, ol] = lists as Extract<Block, { type: 'list' }>[];
    assert.ok(ul && ol);
    assert.equal(ul.ordered, false);
    assert.equal(ul.items.length, 3);
    assert.equal(ol.ordered, true);
    assert.equal(ol.start, 1);
    assert.equal(ol.items.length, 2);
});

test('fenced code preserves body and language', () => {
    const doc = parse(SAMPLE);
    const code = doc.blocks.find((b) => b.type === 'code');
    assert.ok(code && code.type === 'code');
    assert.equal(code.lang, 'ts');
    assert.equal(code.text, 'const x = 1;\nconst y = 2;');
});

test('thematic break present', () => {
    const doc = parse(SAMPLE);
    assert.ok(doc.blocks.some((b) => b.type === 'thematicBreak'));
});

test('empty input yields empty document', () => {
    const doc = parse('');
    assert.equal(doc.blocks.length, 0);
    assert.equal(doc.plainText, '');
    assert.equal(doc.length, 0);
});
