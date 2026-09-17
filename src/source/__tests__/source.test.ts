import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isUri, normalizeSource, sourceSignature } from '../types';

test('isUri detects remote, file, asset and absolute paths', () => {
    assert.equal(isUri('https://example.com/a.md'), true);
    assert.equal(isUri('http://x/y'), true);
    assert.equal(isUri('file:///var/mobile/a.md'), true);
    assert.equal(isUri('content://docs/1'), true);
    assert.equal(isUri('/data/user/0/app/files/a.md'), true);
    assert.equal(isUri('# Hola\n\ntexto'), false);
    assert.equal(isUri('solo texto markdown'), false);
});

test('normalizeSource routes strings to markdown or uri', () => {
    assert.deepEqual(normalizeSource('# Title'), { kind: 'markdown', markdown: '# Title' });
    assert.deepEqual(normalizeSource('https://x/a.md'), { kind: 'uri', uri: 'https://x/a.md' });
});

test('normalizeSource handles object forms', () => {
    assert.deepEqual(normalizeSource({ markdown: '# M' }), { kind: 'markdown', markdown: '# M' });
    assert.deepEqual(normalizeSource({ uri: 'file:///a.md', headers: { A: '1' } }), {
        kind: 'uri',
        uri: 'file:///a.md',
        headers: { A: '1' },
    });
});

test('sourceSignature is stable per source and differs across sources', () => {
    assert.equal(sourceSignature('# A'), sourceSignature('# A'));
    assert.notEqual(sourceSignature('# A'), sourceSignature('# B'));
    assert.notEqual(
        sourceSignature({ uri: 'https://x/a.md' }),
        sourceSignature({ uri: 'https://x/b.md' }),
    );
    assert.equal(
        sourceSignature({ uri: 'https://x/a.md', headers: { A: '1' } }),
        sourceSignature({ uri: 'https://x/a.md', headers: { A: '1' } }),
    );
});
