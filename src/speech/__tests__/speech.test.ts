import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parse } from '../../parser';
import { boundaryToRange, segmentUtterances } from '../types';

test('segmentUtterances splits on newlines with absolute offsets', () => {
    const doc = parse('# Titulo\n\nUn parrafo aqui.');
    const utts = segmentUtterances(doc.plainText);
    assert.ok(utts.length >= 2);
    for (const u of utts) {
        assert.equal(u.text, doc.plainText.slice(u.start, u.end));
        assert.equal(u.text.trim().length > 0, true);
    }
});

test('segmentUtterances skips blank lines', () => {
    const utts = segmentUtterances('a\n\n\n b \n');
    assert.deepEqual(
        utts.map((u) => u.text.trim()),
        ['a', 'b'],
    );
});

test('boundaryToRange maps utterance-local offsets to projection space', () => {
    const utt = { text: 'hola mundo', start: 100, end: 110 };
    assert.deepEqual(boundaryToRange(utt, 0, 4), { start: 100, end: 104 });
    assert.deepEqual(boundaryToRange(utt, 5, 5), { start: 105, end: 110 });
});

test('boundaryToRange clamps to the utterance end', () => {
    const utt = { text: 'hola', start: 10, end: 14 };
    assert.deepEqual(boundaryToRange(utt, 2, 999), { start: 12, end: 14 });
});

test('a boundary range selects the spoken word in plainText', () => {
    const doc = parse('El zorro veloz');
    const utt = segmentUtterances(doc.plainText)[0]!;
    const range = boundaryToRange(utt, 3, 5);
    assert.equal(doc.plainText.slice(range.start, range.end), 'zorro');
});
