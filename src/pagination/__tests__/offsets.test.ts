import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parse } from '../../parser';
import {
    blockIndexForOffset,
    pageForBlock,
    pageIndexForOffset,
    topLevelBlockRanges,
} from '../offsets';

const DOC = parse('# Uno\n\nDos tres\n\n## Cuatro\n\nCinco seis siete');

test('topLevelBlockRanges cover each block and stay ordered', () => {
    const ranges = topLevelBlockRanges(DOC.blocks);
    assert.equal(ranges.length, DOC.blocks.length);
    let prevEnd = -1;
    for (const r of ranges) {
        assert.ok(r.start >= prevEnd);
        assert.ok(r.end >= r.start);
        prevEnd = r.end;
    }
});

test('blockIndexForOffset finds the block containing an offset', () => {
    const ranges = topLevelBlockRanges(DOC.blocks);
    const first = ranges[0]!;
    assert.equal(blockIndexForOffset(ranges, first.start), 0);
    const last = ranges[ranges.length - 1]!;
    assert.equal(blockIndexForOffset(ranges, last.end - 1), ranges.length - 1);
    assert.equal(blockIndexForOffset(ranges, 999999), -1);
});

test('pageForBlock maps a block index to its page', () => {
    const pages = [
        [0, 1],
        [2, 3],
    ];
    assert.equal(pageForBlock(pages, 0), 0);
    assert.equal(pageForBlock(pages, 3), 1);
    assert.equal(pageForBlock(pages, 9), -1);
});

test('an offset in the last block resolves to the last block', () => {
    const ranges = topLevelBlockRanges(DOC.blocks);
    const bi = blockIndexForOffset(ranges, DOC.length - 1);
    assert.equal(bi, DOC.blocks.length - 1);
});

test('pageIndexForOffset resolves the page holding an offset and falls back to 0', () => {
    const ranges = topLevelBlockRanges(DOC.blocks);
    const pages = DOC.blocks.map((_, i) => [i]);
    const last = ranges[ranges.length - 1]!;
    assert.equal(pageIndexForOffset(pages, ranges, last.start), pages.length - 1);
    assert.equal(pageIndexForOffset(pages, ranges, 999999), 0);
});
