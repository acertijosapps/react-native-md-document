import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createKeyValueHighlightStore, createMemoryHighlightStore } from '../stores';
import type { KeyValueStore } from '../types';
import { wordBoundsAt } from '../wordBounds';

test('wordBoundsAt returns the whole word around an offset', () => {
    const text = 'hola mundo cruel';
    assert.deepEqual(wordBoundsAt(text, 6), { start: 5, end: 10 });
    assert.deepEqual(wordBoundsAt(text, 5), { start: 5, end: 10 });
    assert.deepEqual(wordBoundsAt(text, 9), { start: 5, end: 10 });
});

test('wordBoundsAt returns null on whitespace or out of range', () => {
    const text = 'hola mundo';
    assert.equal(wordBoundsAt(text, 4), null);
    assert.equal(wordBoundsAt(text, -1), null);
    assert.equal(wordBoundsAt(text, 10), null);
});

test('memory store round-trips highlights per docId', async () => {
    const store = createMemoryHighlightStore();
    assert.deepEqual(await store.load('a'), []);
    await store.save('a', [{ id: '0-4', start: 0, end: 4 }]);
    await store.save('b', [{ id: '5-9', start: 5, end: 9, color: '#f00' }]);
    assert.deepEqual(await store.load('a'), [{ id: '0-4', start: 0, end: 4 }]);
    assert.deepEqual(await store.load('b'), [{ id: '5-9', start: 5, end: 9, color: '#f00' }]);
});

test('key-value store serializes under a prefixed key', async () => {
    const map = new Map<string, string>();
    const kv: KeyValueStore = {
        getItem: (k) => map.get(k) ?? null,
        setItem: (k, v) => {
            map.set(k, v);
        },
    };
    const store = createKeyValueHighlightStore(kv, 'p:');
    await store.save('doc1', [{ id: '1-3', start: 1, end: 3 }]);
    assert.equal(map.get('p:doc1'), JSON.stringify([{ id: '1-3', start: 1, end: 3 }]));
    assert.deepEqual(await store.load('doc1'), [{ id: '1-3', start: 1, end: 3 }]);
});

test('key-value store tolerates missing and corrupt payloads', async () => {
    const map = new Map<string, string>();
    const kv: KeyValueStore = {
        getItem: (k) => map.get(k) ?? null,
        setItem: (k, v) => {
            map.set(k, v);
        },
    };
    const store = createKeyValueHighlightStore(kv);
    assert.deepEqual(await store.load('missing'), []);
    map.set('rnd:highlights:bad', '{not json');
    assert.deepEqual(await store.load('bad'), []);
    map.set(
        'rnd:highlights:mixed',
        JSON.stringify([{ id: 'ok', start: 0, end: 1 }, { nope: true }]),
    );
    assert.deepEqual(await store.load('mixed'), [{ id: 'ok', start: 0, end: 1 }]);
});
