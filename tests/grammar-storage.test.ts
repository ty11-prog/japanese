import 'fake-indexeddb/auto';
import { IDBObjectStore } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, recordReview, updateSettings } from '../src/lib/learning';
import { exportBackup, loadState, parseBackup, resetState, saveState, StorageConflictError } from '../src/lib/storage';
import { exportGrammarBackup, loadGrammarState, parseGrammarBackup, resetGrammarState, saveGrammarState } from '../src/lib/grammar-storage';

const now = new Date('2026-10-25T04:00:00.000Z');
const questionIds = ['grammar-uchini-q1', 'grammar-uchini-q2'];
function grammarFixture() {
  const state = updateSettings(createInitialState(now), { dailyNewLimit: 6, dailyMinutes: 5 }, now);
  return recordReview(state, questionIds[0], true, 'good', now);
}
function vocabularyFixture() {
  return recordReview(createInitialState(now), 'shitaku', true, 'good', now);
}

beforeEach(async () => {
  await resetState();
  await resetGrammarState();
});
afterEach(() => { vi.restoreAllMocks(); });

describe('independent grammar durability', () => {
  it('keeps existing vocabulary state untouched through first grammar use, reload, and vocabulary reset', async () => {
    const vocabulary = vocabularyFixture();
    await saveState(vocabulary, null);
    expect(await loadGrammarState()).toBeNull();
    expect(await loadState()).toEqual(vocabulary);
    const grammar = grammarFixture();
    await saveGrammarState(grammar, null);
    expect(await loadGrammarState()).toEqual(grammar);
    expect(await loadState()).toEqual(vocabulary);
    await resetState();
    expect(await loadState()).toBeNull();
    expect(await loadGrammarState()).toEqual(grammar);
  });

  it('permits vocabulary writes between grammar snapshots without a false grammar conflict', async () => {
    const vocabulary = vocabularyFixture();
    const grammar = grammarFixture();
    await saveState(vocabulary, null);
    await saveGrammarState(grammar, null);
    const previousGrammar = (await loadGrammarState())!;
    const nextVocabulary = recordReview(vocabulary, 'rusu', false, 'again', now);
    await saveState(nextVocabulary, vocabulary);
    const nextGrammar = recordReview(previousGrammar, questionIds[1], false, 'again', now);
    await saveGrammarState(nextGrammar, previousGrammar);
    expect(await loadGrammarState()).toEqual(nextGrammar);
    expect(await loadState()).toEqual(nextVocabulary);
    await resetGrammarState();
    expect(await loadGrammarState()).toBeNull();
    expect(await loadState()).toEqual(nextVocabulary);
  });

  it('rejects stale grammar snapshots, including a same-timestamp change, without replacing either domain', async () => {
    const vocabulary = vocabularyFixture();
    const grammar = grammarFixture();
    await saveState(vocabulary, null);
    await saveGrammarState(grammar, null);
    const firstTab = (await loadGrammarState())!;
    const secondTab = (await loadGrammarState())!;
    const next = recordReview(firstTab, questionIds[1], true, 'good', now);
    expect(next.updatedAt).toBe(secondTab.updatedAt);
    await saveGrammarState(next, firstTab);
    await expect(saveGrammarState(recordReview(secondTab, questionIds[0], false, 'again', now), secondTab))
      .rejects.toBeInstanceOf(StorageConflictError);
    expect(await loadGrammarState()).toEqual(next);
    expect(await loadState()).toEqual(vocabulary);
  });

  it('allows only one concurrent grammar initialization while a vocabulary record already exists', async () => {
    const vocabulary = vocabularyFixture();
    await saveState(vocabulary, null);
    const first = grammarFixture();
    const second = updateSettings(first, { dailyMinutes: 10 }, now);
    const outcomes = await Promise.allSettled([saveGrammarState(first, null), saveGrammarState(second, null)]);
    expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const failed = outcomes.find((result) => result.status === 'rejected');
    expect(failed?.status === 'rejected' && failed.reason).toBeInstanceOf(StorageConflictError);
    expect([5, 10]).toContain((await loadGrammarState())?.settings.dailyMinutes);
    expect(await loadState()).toEqual(vocabulary);
  });

  it('canonicalizes key order before checking a grammar snapshot', async () => {
    const state = recordReview(grammarFixture(), questionIds[1], true, 'good', now);
    await saveGrammarState(state, null);
    const reordered = { ...state, progress: Object.fromEntries(Object.entries(state.progress).reverse()) };
    const next = recordReview(reordered, questionIds[0], false, 'again', now);
    await saveGrammarState(next, reordered);
    expect(await loadGrammarState()).toEqual(next);
  });

  it('rejects a failed read instead of initializing or overwriting existing grammar progress', async () => {
    const grammar = grammarFixture();
    const vocabulary = vocabularyFixture();
    await saveGrammarState(grammar, null);
    await saveState(vocabulary, null);
    const writes = vi.spyOn(IDBObjectStore.prototype, 'put');
    const read = vi.spyOn(IDBObjectStore.prototype, 'get').mockImplementationOnce(() => {
      throw new DOMException('Simulated storage read failure', 'UnknownError');
    });
    await expect(loadGrammarState()).rejects.toThrow('Simulated storage read failure');
    expect(writes).not.toHaveBeenCalled();
    read.mockRestore();
    expect(await loadGrammarState()).toEqual(grammar);
    expect(await loadState()).toEqual(vocabulary);
  });
});

describe('grammar backup boundaries', () => {
  it('round-trips the separate grammar format without writing until explicitly saved', async () => {
    const grammar = grammarFixture();
    const vocabulary = vocabularyFixture();
    await saveState(vocabulary, null);
    const json = exportGrammarBackup(grammar);
    expect(JSON.parse(json)).toMatchObject({ format: 'kotoba-n3-grammar-backup', version: 1 });
    const restored = parseGrammarBackup(json, questionIds);
    expect(restored).toEqual(grammar);
    expect(await loadGrammarState()).toBeNull();
    await saveGrammarState(restored, null);
    expect(await loadGrammarState()).toEqual(grammar);
    expect(await loadState()).toEqual(vocabulary);
  });

  it('rejects vocabulary backups as grammar and grammar backups as vocabulary even with matching IDs', () => {
    const grammar = grammarFixture();
    expect(() => parseGrammarBackup(exportBackup(grammar), questionIds)).toThrow();
    expect(() => parseBackup(exportGrammarBackup(grammar), questionIds)).toThrow();
  });

  it.each([
    ['unsupported envelope version', (backup: any) => { backup.version = 2; }],
    ['unsupported state schema', (backup: any) => { backup.state.schemaVersion = 2; }],
    ['unknown question', (backup: any) => {
      backup.state.progress.unknown = { ...backup.state.progress[questionIds[0]], wordId: 'unknown' };
    }],
    ['invalid date', (backup: any) => { backup.state.progress[questionIds[0]].dueAt = '2026-02-30T04:00:00.000Z'; }],
    ['invalid answer counters', (backup: any) => { backup.state.progress[questionIds[0]].correctCount = 50; }],
    ['invalid rating', (backup: any) => { backup.state.reviews[0].rating = 'perfect'; }],
    ['prototype-shaped question ID', (backup: any) => {
      Object.defineProperty(backup.state.progress, '__proto__', {
        value: { ...backup.state.progress[questionIds[0]], wordId: '__proto__' }, enumerable: true,
      });
    }],
  ])('rejects %s without replacing saved progress', async (_name, mutate) => {
    const grammar = grammarFixture();
    const vocabulary = vocabularyFixture();
    await saveGrammarState(grammar, null);
    await saveState(vocabulary, null);
    const backup = JSON.parse(exportGrammarBackup(grammar));
    mutate(backup);
    expect(() => parseGrammarBackup(JSON.stringify(backup), [...questionIds, '__proto__'])).toThrow();
    expect(await loadGrammarState()).toEqual(grammar);
    expect(await loadState()).toEqual(vocabulary);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('rejects malformed JSON and oversized input before touching saved grammar', async () => {
    const grammar = grammarFixture();
    await saveGrammarState(grammar, null);
    expect(() => parseGrammarBackup('{bad-json}', questionIds)).toThrow();
    expect(() => parseGrammarBackup(' '.repeat(20 * 1024 * 1024 + 1), questionIds)).toThrow();
    expect(await loadGrammarState()).toEqual(grammar);
  });
});
