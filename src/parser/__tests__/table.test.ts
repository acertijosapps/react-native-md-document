import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parse } from '../index';
import type { Inline, TableBlock, TableCell } from '../types';

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

function cellInlines(cell: TableCell): Inline[] {
    return cell.children.flatMap((b) => (b.type === 'paragraph' ? b.inlines : []));
}

function cellText(cell: TableCell): string {
    return cellInlines(cell)
        .map((t) => t.text)
        .join('');
}

test('parses a GFM pipe table with header and rows', () => {
    const table = firstTable(SAMPLE);
    assert.ok(table.header);
    assert.equal(table.header.cells.length, 2);
    assert.equal(table.rows.length, 1);
    assert.equal(cellText(table.header.cells[0]!), 'Original');
    assert.equal(cellText(table.rows[0]!.cells[1]!), 'Texto B con énfasis');
});

test('table cells preserve inline styles', () => {
    const table = firstTable(SAMPLE);
    assert.ok(
        cellInlines(table.header!.cells[0]!).some((t) => t.style.bold && t.text === 'Original'),
    );
    assert.ok(
        cellInlines(table.rows[0]!.cells[1]!).some((t) => t.style.italic && t.text === 'énfasis'),
    );
});

test('table cell offsets satisfy the keystone invariant', () => {
    const doc = parse(SAMPLE);
    const table = doc.blocks.find((b) => b.type === 'table') as TableBlock;
    const rows = table.header ? [table.header, ...table.rows] : table.rows;
    const cells = rows.flatMap((r) => r.cells);
    for (const cell of cells) {
        for (const tok of cellInlines(cell)) {
            assert.equal(tok.text, doc.plainText.slice(tok.start, tok.end));
        }
    }
});

test('alignment row is parsed from colons', () => {
    const md = `| a | b | c |\n| :--- | :---: | ---: |\n| 1 | 2 | 3 |`;
    const table = firstTable(md);
    assert.deepEqual(table.align, ['left', 'center', 'right']);
});
