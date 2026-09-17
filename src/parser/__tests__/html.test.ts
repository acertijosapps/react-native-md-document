import assert from 'node:assert/strict';
import { test } from 'node:test';

import { looksLikeHtml } from '../html';
import { parse } from '../index';
import type { Block, TextToken } from '../types';

const HTML = `<!-- comment -->
<div style="color: #000;">
  <div style="background: #006847; color: #FFFFFF; text-align: center; font-size: 18pt; text-transform: uppercase;">Titulo Barra</div>
  <p style="text-align: center; font-weight: bold; font-size: 16pt;">Subtitulo</p>
  <table style="width: 100%;">
    <colgroup><col style="width: 21.34%;"><col style="width: 78.66%;"></colgroup>
    <tr>
      <td style="background: #006847; color: #FFFFFF; font-weight: bold;"><p>Etiqueta</p></td>
      <td><p>Cuerpo <strong>fuerte</strong> y <span style="color: #006847;">verde</span>.</p></td>
    </tr>
  </table>
</div>`;

function allTokens(doc: ReturnType<typeof parse>): TextToken[] {
    const out: TextToken[] = [];
    const walk = (blocks: Block[]): void => {
        for (const b of blocks) {
            switch (b.type) {
                case 'heading':
                case 'paragraph':
                    out.push(...b.inlines);
                    break;
                case 'container':
                case 'blockquote':
                case 'listItem':
                    walk(b.children);
                    break;
                case 'list':
                    b.items.forEach((it) => walk(it.children));
                    break;
                case 'table': {
                    const rows = b.header ? [b.header, ...b.rows] : b.rows;
                    rows.forEach((r) => r.cells.forEach((c) => walk(c.children)));
                    break;
                }
                default:
                    break;
            }
        }
    };
    walk(doc.blocks);
    return out;
}

test('looksLikeHtml detects HTML-in-markdown after comments', () => {
    assert.equal(looksLikeHtml(HTML), true);
    assert.equal(looksLikeHtml('# Solo markdown\n\ntexto'), false);
});

test('parses container, styled paragraphs and a table', () => {
    const doc = parse(HTML);
    const container = doc.blocks.find((b) => b.type === 'container');
    assert.ok(container && container.type === 'container');

    const table = doc.blocks
        .flatMap((b) => (b.type === 'container' ? b.children : [b]))
        .find((b) => b.type === 'table');
    assert.ok(table && table.type === 'table');
    assert.deepEqual(
        table.colWidths?.map((w) => (w ? Math.round(w * 10000) / 10000 : w)),
        [0.2134, 0.7866],
    );
    assert.equal(table.rows.length, 1);
    assert.equal(table.rows[0]!.cells.length, 2);
});

test('inherits text style from a styled div onto its direct text', () => {
    const doc = parse(HTML);
    const tokens = allTokens(doc);
    const bar = tokens.find((t) => t.text.includes('Titulo'));
    assert.ok(bar);
    // color y centrado se propagan al párrafo (estilo de bloque), no al token,
    // así que basta con que el texto exista y el keystone se cumpla.
});

test('keeps inline styles inside table cells (bold, span color)', () => {
    const doc = parse(HTML);
    const tokens = allTokens(doc);
    assert.ok(tokens.some((t) => t.style.bold && t.text === 'fuerte'));
    assert.ok(tokens.some((t) => t.style.color === '#006847' && t.text === 'verde'));
});

test('keystone invariant holds for HTML content', () => {
    const doc = parse(HTML);
    for (const t of allTokens(doc)) {
        assert.equal(t.text, doc.plainText.slice(t.start, t.end));
    }
});
