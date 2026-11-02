import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
    DEFAULT_ACCESSIBILITY_LABELS,
    mergeAccessibilityLabels,
    stepPageIndex,
    visiblePageRange,
} from '../a11y';

test('visiblePageRange reports one page in single view', () => {
    assert.deepEqual(visiblePageRange(2, 1, 12), { first: 3, last: 3 });
});

test('visiblePageRange reports both pages of a spread', () => {
    assert.deepEqual(visiblePageRange(2, 2, 12), { first: 3, last: 4 });
});

test('visiblePageRange clamps the last page of an odd-length spread', () => {
    assert.deepEqual(visiblePageRange(10, 2, 11), { first: 11, last: 11 });
});

test('stepPageIndex moves by the pages shown and stays inside the document', () => {
    assert.equal(stepPageIndex(2, 1, 2, 12), 4);
    assert.equal(stepPageIndex(2, -1, 2, 12), 0);
    assert.equal(stepPageIndex(0, -1, 1, 12), 0);
    assert.equal(stepPageIndex(11, 1, 1, 12), 11);
});

test('default labels read the page position', () => {
    assert.equal(DEFAULT_ACCESSIBILITY_LABELS.pages(3, 3, 12), 'Page 3 of 12');
    assert.equal(DEFAULT_ACCESSIBILITY_LABELS.pages(3, 4, 12), 'Pages 3 and 4 of 12');
});

test('mergeAccessibilityLabels overrides only the given labels', () => {
    const labels = mergeAccessibilityLabels({ nextPage: 'Página siguiente' });
    assert.equal(labels.nextPage, 'Página siguiente');
    assert.equal(labels.previousPage, 'Previous page');
});
