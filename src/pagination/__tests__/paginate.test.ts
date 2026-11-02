import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parse } from '../../parser';
import { keepWithNextFlags, paginate } from '../paginate';

test('packs blocks greedily until the page height is exceeded', () => {
    assert.deepEqual(paginate([100, 100, 100], 250), [[0, 1], [2]]);
});

test('exact fit fills a page without spilling', () => {
    assert.deepEqual(paginate([100, 100, 100], 300), [[0, 1, 2]]);
});

test('a block taller than the page stands alone', () => {
    assert.deepEqual(paginate([50, 400, 50], 100), [[0], [1], [2]]);
});

test('empty input yields no pages', () => {
    assert.deepEqual(paginate([], 500), []);
});

test('every block index appears exactly once, in order', () => {
    const heights = [30, 70, 120, 45, 200, 15];
    const pages = paginate(heights, 150);
    const flat = pages.flat();
    assert.deepEqual(
        flat,
        heights.map((_, i) => i),
    );
});

test('no page exceeds the height unless a single block does', () => {
    const heights = [40, 40, 40, 40, 40];
    const pageHeight = 100;
    for (const page of paginate(heights, pageHeight)) {
        const total = page.reduce((sum, i) => sum + heights[i]!, 0);
        const single = page.length === 1;
        assert.ok(single || total <= pageHeight, `page ${page} overflows`);
    }
});

test('a heading that would end a page moves to the next one with its block', () => {
    // heights: [text, heading, text]; the heading fits on page 1 but its text does not
    assert.deepEqual(paginate([100, 30, 100], 150, [false, true, false]), [[0], [1, 2]]);
});

test('without the flag the same heading stays orphaned at the end of the page', () => {
    assert.deepEqual(paginate([100, 30, 100], 150), [[0, 1], [2]]);
});

test('consecutive headings travel together with the block that follows', () => {
    assert.deepEqual(paginate([100, 20, 20, 100], 150, [false, true, true, false]), [
        [0],
        [1, 2, 3],
    ]);
});

test('a heading and its block stay on the same page when they fit', () => {
    assert.deepEqual(paginate([30, 30, 30, 30], 150, [false, true, false, false]), [[0, 1, 2, 3]]);
});

test('a group taller than the page is packed block by block', () => {
    assert.deepEqual(paginate([60, 60, 60], 100, [true, false, false]), [[0], [1], [2]]);
});

test('a heading that is the last block of the document stays where it is', () => {
    assert.deepEqual(paginate([100, 30], 150, [false, true]), [[0, 1]]);
    assert.deepEqual(paginate([100, 100, 30], 150, [false, false, true]), [[0], [1, 2]]);
});

test('keeping headings with their block still emits every index once, in order', () => {
    const heights = [30, 70, 120, 45, 200, 15, 25, 90];
    const flags = [false, true, false, true, true, false, true, false];
    const flat = paginate(heights, 150, flags).flat();
    assert.deepEqual(
        flat,
        heights.map((_, i) => i),
    );
});

test('keepWithNextFlags flags headings only', () => {
    const doc = parse('# Title\n\nParagraph\n\n## Section\n\nMore text\n\n> quote');
    assert.deepEqual(
        keepWithNextFlags(doc.blocks),
        doc.blocks.map((block) => block.type === 'heading'),
    );
    assert.ok(keepWithNextFlags(doc.blocks).some(Boolean));
});
