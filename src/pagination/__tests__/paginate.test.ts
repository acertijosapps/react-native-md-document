import assert from 'node:assert/strict';
import { test } from 'node:test';

import { paginate } from '../paginate';

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
