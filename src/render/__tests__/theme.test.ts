import assert from 'node:assert/strict';
import { test } from 'node:test';

import { darkTheme, lightTheme, mergeTheme, resolveThemeColor, themeForScheme } from '../theme';

test('resolveThemeColor maps base tokens to the active palette', () => {
    assert.equal(resolveThemeColor('var(--page-bg)', darkTheme), darkTheme.colors.pageBackground);
    assert.equal(resolveThemeColor('var(--text)', darkTheme), darkTheme.colors.text);
    assert.equal(resolveThemeColor('var(--heading)', lightTheme), lightTheme.colors.heading);
});

test('resolveThemeColor uses consumer tokens for non-base names', () => {
    const themed = { ...darkTheme, tokens: { accent: '#0f5c43' } };
    assert.equal(resolveThemeColor('var(--accent)', themed), '#0f5c43');
});

test('resolveThemeColor leaves literals untouched and omits unknown tokens', () => {
    assert.equal(resolveThemeColor('#006847', darkTheme), '#006847');
    assert.equal(resolveThemeColor('var(--accent)', darkTheme), undefined);
    assert.equal(resolveThemeColor(undefined, darkTheme), undefined);
});

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
