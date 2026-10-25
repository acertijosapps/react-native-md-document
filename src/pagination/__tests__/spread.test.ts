import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveSpread, spreadStartIndex } from '../spread';

const BASE = { enabled: true, minWidth: 600, gap: 0, screenShortSide: 834 };

test('resolveSpread splits a wide landscape container into two pages', () => {
    const layout = resolveSpread({ ...BASE, width: 1000, height: 700 });
    assert.deepEqual(layout, { isSpread: true, pageWidth: 500 });
});

test('resolveSpread reserves the gap between both pages', () => {
    const layout = resolveSpread({ ...BASE, width: 1000, height: 700, gap: 40 });
    assert.deepEqual(layout, { isSpread: true, pageWidth: 480 });
});

test('resolveSpread keeps a single page in portrait', () => {
    const layout = resolveSpread({ ...BASE, width: 700, height: 1000 });
    assert.deepEqual(layout, { isSpread: false, pageWidth: 700 });
});

test('resolveSpread keeps a single page below the minimum width', () => {
    const layout = resolveSpread({ ...BASE, width: 580, height: 400 });
    assert.deepEqual(layout, { isSpread: false, pageWidth: 580 });
});

test('resolveSpread keeps a single page on a phone in landscape', () => {
    const layout = resolveSpread({ ...BASE, screenShortSide: 393, width: 852, height: 360 });
    assert.deepEqual(layout, { isSpread: false, pageWidth: 852 });
});

test('resolveSpread keeps a single page when disabled', () => {
    const layout = resolveSpread({ ...BASE, enabled: false, width: 1000, height: 700 });
    assert.deepEqual(layout, { isSpread: false, pageWidth: 1000 });
});

test('resolveSpread ignores a negative gap', () => {
    const layout = resolveSpread({ ...BASE, width: 1000, height: 700, gap: -20 });
    assert.equal(layout.pageWidth, 500);
});

test('spreadStartIndex snaps to the left page of the spread', () => {
    assert.equal(spreadStartIndex(0, true), 0);
    assert.equal(spreadStartIndex(1, true), 0);
    assert.equal(spreadStartIndex(5, true), 4);
    assert.equal(spreadStartIndex(5, false), 5);
});
