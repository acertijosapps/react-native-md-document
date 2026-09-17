import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parse } from '../index';
import type { TableBlock } from '../types';

const SAMPLE = `# Doc

| **Original** | Texto A |
| --- | --- |
| **Vigente** | Texto B con *énfasis* |

Fin.`;

function firstTable(md: string): TableBlock {
    const doc = parse(md);
    const table = doc.blocks.find((b) => b.type === 'table');
    assert.ok(table && table.type === 'table');
    return table;
}

test('parses a GFM pipe table with header and rows', () => {
    const table = firstTable(SAMPLE);
    assert.equal(table.header.cells.length, 2);
    assert.equal(table.rows.length, 1);
    assert.equal(table.header.cells[0]!.inlines.map((t) => t.text).join(''), 'Original');
    assert.equal(
        table.rows[0]!.cells[1]!.inlines.map((t) => t.text).join(''),
        'Texto B con énfasis',
    );
});

test('table cells preserve inline styles', () => {
    const table = firstTable(SAMPLE);
    assert.ok(table.header.cells[0]!.inlines.some((t) => t.style.bold && t.text === 'Original'));
    const lastCell = table.rows[0]!.cells[1]!;
    assert.ok(lastCell.inlines.some((t) => t.style.italic && t.text === 'énfasis'));
});

test('table cell offsets satisfy the keystone invariant', () => {
    const doc = parse(SAMPLE);
    const table = doc.blocks.find((b) => b.type === 'table') as TableBlock;
    const cells = [table.header, ...table.rows].flatMap((r) => r.cells);
    for (const cell of cells) {
        for (const tok of cell.inlines) {
            assert.equal(tok.text, doc.plainText.slice(tok.start, tok.end));
        }
    }
});

test('alignment row is parsed from colons', () => {
    const md = `| a | b | c |\n| :--- | :---: | ---: |\n| 1 | 2 | 3 |`;
    const table = firstTable(md);
    assert.deepEqual(table.align, ['left', 'center', 'right']);
});
