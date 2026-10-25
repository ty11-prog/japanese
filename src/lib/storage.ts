import { type AppState, type Rating, type ReviewRecord, type WordProgress } from './learning';

const DATABASE = 'kotoba-n3';
const STORE = 'app';
const KEY = 'state';
const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
const MAX_REVIEWS = 100_000;
const MAX_WORDS = 10_000;
const RATINGS: Rating[] = ['again', 'hard', 'good', 'easy'];
const IDENTIFIER = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const FORBIDDEN_IDS = new Set(['__proto__', 'constructor', 'prototype']);

function invalid(): never { throw new Error('備份格式或資料內容不正確，原有進度未變更。'); }
function object(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function integer(value: unknown, min = 0, max = 1_000_000): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}
function iso(value: unknown): value is string {
  if (typeof value !== 'string' || !/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}
function safeId(value: unknown): value is string {
  return typeof value === 'string' && IDENTIFIER.test(value) && !FORBIDDEN_IDS.has(value);
}

/** Rebuild the object from validated primitive fields, dropping all unknown
 * fields. Neither malformed backups nor a prototype-bearing payload is trusted. */
function validateState(input: unknown, knownWordIds?: readonly string[]): AppState {
  if (!object(input) || input.schemaVersion !== 1 || !object(input.progress)
      || !Array.isArray(input.reviews) || input.reviews.length > MAX_REVIEWS
      || !object(input.settings) || !iso(input.updatedAt)) invalid();
  const settings = input.settings;
  if (!integer(settings.dailyNewLimit, 1, 30) || !integer(settings.dailyMinutes, 5, 60)) invalid();
  const entries = Object.entries(input.progress).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length > MAX_WORDS) invalid();
  const known = knownWordIds ? new Set(knownWordIds) : undefined;
  const progress: Record<string, WordProgress> = {};
  for (const [id, value] of entries) {
    if (!safeId(id) || (known && !known.has(id)) || !object(value) || value.wordId !== id
        || !iso(value.introducedAt) || !iso(value.lastReviewedAt) || !iso(value.dueAt)
        || !integer(value.intervalDays, 0, 365) || !integer(value.attempts, 1)
        || !integer(value.correctCount) || value.correctCount > value.attempts
        || !integer(value.correctStreak) || value.correctStreak > value.correctCount
        || !integer(value.lapses) || value.lapses > value.attempts
        || value.introducedAt > value.lastReviewedAt) invalid();
    progress[id] = {
      wordId: id,
      introducedAt: value.introducedAt,
      lastReviewedAt: value.lastReviewedAt,
      dueAt: value.dueAt,
      intervalDays: value.intervalDays,
      attempts: value.attempts,
      correctCount: value.correctCount,
      correctStreak: value.correctStreak,
      lapses: value.lapses,
    };
  }
  const reviews: ReviewRecord[] = input.reviews.map((value: unknown) => {
    if (!object(value) || typeof value.id !== 'string' || value.id.length < 1 || value.id.length > 160
        || !safeId(value.wordId) || !Object.hasOwn(progress, value.wordId)
        || (known && !known.has(value.wordId)) || !iso(value.reviewedAt)
        || typeof value.correct !== 'boolean' || !RATINGS.includes(value.rating as Rating)
        || !integer(value.intervalDays, 0, 365)) invalid();
    return {
      id: value.id,
      wordId: value.wordId,
      reviewedAt: value.reviewedAt,
      correct: value.correct,
      rating: value.rating as Rating,
      intervalDays: value.intervalDays,
    };
  });
  return {
    schemaVersion: 1,
    progress,
    reviews,
    settings: { dailyNewLimit: settings.dailyNewLimit, dailyMinutes: settings.dailyMinutes },
    updatedAt: input.updatedAt,
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('此瀏覽器無法使用本機資料庫；請改用一般模式的 Chrome。'));
      return;
    }
    let blocked = false;
    let request: IDBOpenDBRequest;
    try { request = indexedDB.open(DATABASE, 1); }
    catch { reject(new Error('無法開啟本機資料庫，請檢查瀏覽器儲存權限。')); return; }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onerror = () => reject(new Error('無法開啟本機資料庫，請檢查瀏覽器儲存權限。'));
    request.onblocked = () => {
      blocked = true;
      reject(new Error('其他分頁正在使用資料庫，請關閉其他分頁後重試。'));
    };
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

/** Missing state is distinct from an unreadable database. Never silently replace
 * a failed read with an empty state and overwrite the user's saved progress. */
export async function loadState(): Promise<AppState | null> {
  const database = await openDatabase();
  try {
    const value = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readonly');
      const request = transaction.objectStore(STORE).get(KEY);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(new Error('讀取進度失敗，請重新整理再試。'));
      transaction.onabort = () => reject(new Error('讀取進度中斷，原有資料未變更。'));
    });
    return value === undefined ? null : validateState(value);
  } finally { database.close(); }
}

/** A stale tab must reload before saving, rather than silently replace another
 * tab's newer history. Callers can distinguish this from storage/space errors. */
export class StorageConflictError extends Error {
  constructor() {
    super('其他分頁已更新學習進度。請重新整理，載入最新進度後再繼續。');
    this.name = 'StorageConflictError';
  }
}

/** Commit only if the stored snapshot still matches expectedState. The read,
 * comparison and write share a single readwrite transaction, making this atomic
 * across tabs. Undefined explicitly permits an unconditional write; null means
 * that no previous state should exist. Compare all validated canonical fields,
 * not just updatedAt, since two writes can share a millisecond timestamp. */
export async function saveState(state: AppState, expectedState?: AppState | null): Promise<void> {
  const validated = validateState(state);
  const expected = expectedState === undefined ? undefined
    : expectedState === null ? null : JSON.stringify(validateState(expectedState));
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite');
      const store = transaction.objectStore(STORE);
      let failure: Error | null = null;
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(failure ?? new Error('進度未能儲存，請檢查可用空間並匯出備份。'));
      transaction.onabort = () => reject(failure ?? new Error('儲存進度中斷，請匯出備份後重試。'));
      const request = store.get(KEY);
      request.onsuccess = () => {
        try {
          if (expected !== undefined) {
            const current = request.result === undefined ? null : JSON.stringify(validateState(request.result));
            if (current !== expected) {
              failure = new StorageConflictError();
              transaction.abort();
              return;
            }
          }
          store.put(validated, KEY);
        } catch (error) {
          failure = error instanceof Error ? error : new Error('儲存進度失敗，原有進度未變更。');
          transaction.abort();
        }
      };
    });
  } finally { database.close(); }
}

export async function resetState(): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).delete(KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('清除進度失敗，請稍後再試。'));
      transaction.onabort = () => reject(new Error('清除進度中斷，請稍後再試。'));
    });
  } finally { database.close(); }
}

export function exportBackup(state: AppState): string {
  return JSON.stringify({ format: 'kotoba-n3-backup', version: 1, state: validateState(state) }, null, 2);
}

/** Parse and validate only. Import must be explicitly confirmed in the UI, then
 * committed with saveState; this function never touches existing progress. */
export function parseBackup(json: string, knownWordIds: readonly string[]): AppState {
  if (typeof json !== 'string' || json.length > MAX_BACKUP_BYTES
      || new TextEncoder().encode(json).byteLength > MAX_BACKUP_BYTES) invalid();
  let parsed: unknown;
  try { parsed = JSON.parse(json); } catch { invalid(); }
  if (!object(parsed) || parsed.format !== 'kotoba-n3-backup' || parsed.version !== 1) invalid();
  return validateState(parsed.state, knownWordIds);
}
