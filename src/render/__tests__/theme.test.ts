import assert from 'node:assert/strict';
import { test } from 'node:test';

import { darkTheme, lightTheme, mergeTheme, themeForScheme } from '../theme';

test('light and dark palettes differ', () => {
    assert.notEqual(lightTheme.colors.pageBackground, darkTheme.colors.pageBackground);
    assert.notEqual(lightTheme.colors.text, darkTheme.colors.text);
});

test('non-color fields are shared between schemes', () => {
    assert.deepEqual(lightTheme.fontSizes, darkTheme.fontSizes);
    assert.equal(lightTheme.blockSpacing, darkTheme.blockSpacing);
    assert.equal(lightTheme.indent, darkTheme.indent);
});

test('themeForScheme selects the right base', () => {
    assert.equal(themeForScheme('light'), lightTheme);
    assert.equal(themeForScheme('dark'), darkTheme);
});

test('mergeTheme applies override over the given base', () => {
    const merged = mergeTheme({ colors: { ...darkTheme.colors, link: '#123456' } }, darkTheme);
    assert.equal(merged.colors.link, '#123456');
    assert.equal(merged.colors.pageBackground, darkTheme.colors.pageBackground);
    assert.equal(merged.fontSizes.body, darkTheme.fontSizes.body);
});

test('mergeTheme defaults to the light base', () => {
    assert.equal(mergeTheme(), lightTheme);
    assert.equal(mergeTheme(undefined).colors.text, lightTheme.colors.text);
});
