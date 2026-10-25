import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, recordReview, updateSettings } from '../src/lib/learning';
import { exportBackup, loadState, parseBackup, resetState, saveState, StorageConflictError } from '../src/lib/storage';

const now = new Date('2026-10-25T04:00:00.000Z');
function fixture() {
  return updateSettings(recordReview(createInitialState(now), 'yakusoku', true, 'good', now), { dailyNewLimit: 5 }, now);
}

beforeEach(async () => { await resetState(); });

describe('IndexedDB durability', () => {
  it('returns null only for an empty store', async () => {
    expect(await loadState()).toBeNull();
  });

  it('commits and reads back progress, settings and review history across database connections', async () => {
    const state = fixture();
    await saveState(state);
    expect(await loadState()).toEqual(state);
    const next = recordReview((await loadState())!, 'yakusoku', false, 'again', new Date('2026-10-26T04:00:00.000Z'));
    await saveState(next);
    expect(await loadState()).toEqual(next);
    expect((await loadState())?.reviews).toHaveLength(2);
  });

  it('deletes state only through an explicit reset', async () => {
    await saveState(fixture());
    await resetState();
    expect(await loadState()).toBeNull();
  });
});

describe('atomic cross-tab snapshot checks', () => {
  it('rejects a stale tab without changing the stored progress, then accepts the latest snapshot', async () => {
    await saveState(fixture(), null);
    const tabA = (await loadState())!;
    const tabB = (await loadState())!;
    const nextA = recordReview(tabA, 'junbi', true, 'good', new Date('2026-10-26T04:00:00.000Z'));
    const nextB = recordReview(tabB, 'kakunin', true, 'good', new Date('2026-10-26T04:01:00.000Z'));
    await saveState(nextA, tabA);
    await expect(saveState(nextB, tabB)).rejects.toBeInstanceOf(StorageConflictError);
    expect(await loadState()).toEqual(nextA);
    const latest = (await loadState())!;
    const next = recordReview(latest, 'kakunin', true, 'good', new Date('2026-10-26T04:02:00.000Z'));
    await saveState(next, latest);
    expect(await loadState()).toEqual(next);
    expect((await loadState())?.reviews).toHaveLength(3);
  });

  it('detects different content even if both snapshots have the same updatedAt', async () => {
    const original = fixture();
    await saveState(original, null);
    const next = updateSettings(original, { dailyNewLimit: 6 }, now);
    expect(next.updatedAt).toBe(original.updatedAt);
    await saveState(next, original);
    await expect(saveState(updateSettings(original, { dailyNewLimit: 7 }, now), original))
      .rejects.toBeInstanceOf(StorageConflictError);
    expect(await loadState()).toEqual(next);
  });

  it('allows only one of two truly concurrent initial writes expecting an empty database', async () => {
    const first = fixture();
    const second = updateSettings(fixture(), { dailyNewLimit: 9 }, now);
    const outcomes = await Promise.allSettled([saveState(first, null), saveState(second, null)]);
    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    const failed = outcomes.find((outcome) => outcome.status === 'rejected');
    expect(failed?.status === 'rejected' && failed.reason).toBeInstanceOf(StorageConflictError);
    const stored = await loadState();
    expect([first.settings.dailyNewLimit, second.settings.dailyNewLimit]).toContain(stored?.settings.dailyNewLimit);
    expect(stored?.reviews).toEqual(first.reviews);
  });

  it('canonicalizes progress key order without treating equivalent data as a conflict', async () => {
    const state = recordReview(fixture(), 'junbi', true, 'good', now);
    await saveState(state, null);
    const equivalent = { ...state, progress: Object.fromEntries(Object.entries(state.progress).reverse()) };
    const next = updateSettings(equivalent, { dailyMinutes: 20 }, now);
    await saveState(next, equivalent);
    expect(await loadState()).toEqual(next);
  });

  it('rejects missing expected data but retains an explicit unconditional-write escape hatch', async () => {
    await expect(saveState(fixture(), fixture())).rejects.toBeInstanceOf(StorageConflictError);
    expect(await loadState()).toBeNull();
    await saveState(fixture(), null);
    const forced = updateSettings(fixture(), { dailyMinutes: 25 }, now);
    await saveState(forced);
    expect(await loadState()).toEqual(forced);
  });
});

describe('backup import boundaries', () => {
  it('round-trips a versioned export without writing until saveState is called', async () => {
    const original = fixture();
    const restored = parseBackup(exportBackup(original), ['yakusoku']);
    expect(restored).toEqual(original);
    expect(await loadState()).toBeNull();
    await saveState(restored);
    expect(await loadState()).toEqual(original);
  });

  it('preserves the stored progress when malformed or unknown-word backup import fails', async () => {
    await saveState(fixture());
    expect(() => parseBackup('{not-json}', ['yakusoku'])).toThrow();
    expect(() => parseBackup(exportBackup(fixture()), ['other'])).toThrow();
    expect(await loadState()).toEqual(fixture());
  });

  it.each([
    ['unsupported schema', (backup: any) => { backup.state.schemaVersion = 999; }],
    ['invalid day limit', (backup: any) => { backup.state.settings.dailyNewLimit = -2; }],
    ['invalid timestamp', (backup: any) => { backup.state.progress.yakusoku.dueAt = 'tomorrow'; }],
    ['impossible date', (backup: any) => { backup.state.progress.yakusoku.dueAt = '2026-02-30T04:00:00.000Z'; }],
    ['negative counter', (backup: any) => { backup.state.progress.yakusoku.attempts = -1; }],
    ['inconsistent counter', (backup: any) => { backup.state.progress.yakusoku.correctCount = 8; }],
    ['incorrect rating', (backup: any) => { backup.state.reviews[0].rating = 'perfect'; }],
    ['unknown history word', (backup: any) => { backup.state.reviews[0].wordId = 'other'; }],
    ['too much history', (backup: any) => { backup.state.reviews = Array(100_001).fill(backup.state.reviews[0]); }],
  ])('rejects %s', (_name, mutate) => {
    const backup = JSON.parse(exportBackup(fixture()));
    mutate(backup);
    expect(() => parseBackup(JSON.stringify(backup), ['yakusoku'])).toThrow();
  });

  it('rejects prototype-shaped progress keys and oversized input', () => {
    const backup = JSON.parse(exportBackup(fixture()));
    Object.defineProperty(backup.state.progress, '__proto__', { value: { ...backup.state.progress.yakusoku, wordId: '__proto__' }, enumerable: true });
    expect(() => parseBackup(JSON.stringify(backup), ['yakusoku', '__proto__'])).toThrow();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(() => parseBackup(' '.repeat(20 * 1024 * 1024 + 1), ['yakusoku'])).toThrow();
  });
});
