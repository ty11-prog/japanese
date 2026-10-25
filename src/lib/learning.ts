/** A small, deterministic spaced-repetition model. All dates are stored as UTC ISO
 * strings, while daily goals and streaks follow the device's local calendar. */
export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface WordProgress {
  wordId: string;
  introducedAt: string;
  lastReviewedAt: string;
  dueAt: string;
  intervalDays: number;
  attempts: number;
  correctCount: number;
  correctStreak: number;
  lapses: number;
}

export interface ReviewRecord {
  id: string;
  wordId: string;
  reviewedAt: string;
  correct: boolean;
  rating: Rating;
  intervalDays: number;
}

export interface AppSettings {
  dailyNewLimit: number;
  dailyMinutes: number;
}

export interface AppState {
  schemaVersion: 1;
  progress: Record<string, WordProgress>;
  reviews: ReviewRecord[];
  settings: AppSettings;
  updatedAt: string;
}

export interface StudyPlan {
  due: string[];
  newWords: string[];
  queue: string[];
  introducedToday: number;
  remainingNew: number;
}

export const DEFAULT_SETTINGS: AppSettings = { dailyNewLimit: 8, dailyMinutes: 15 };
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 90, 180] as const;
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const VALID_ID = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function createInitialState(now: Date = new Date()): AppState {
  return {
    schemaVersion: 1,
    progress: {},
    reviews: [],
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: now.toISOString(),
  };
}

/** Record a completed retrieval attempt, never a mere card flip. A wrong answer
 * always retries after 10 minutes, even if an optimistic rating was supplied.
 * A successful spaced recall grows the interval only after its previous due
 * time and on a later local calendar day. Early practice is still recorded,
 * but cannot advance the stage or push its due date further into the future.
 * Confidence adjusts the new interval only at a genuine scheduling event.
 * A later session may requeue a missed word, but this function never loops it. */
export function recordReview(
  state: AppState,
  wordId: string,
  correct: boolean,
  rating: Rating,
  now: Date = new Date(),
): AppState {
  if (!VALID_ID.test(wordId) || wordId === '__proto__' || wordId === 'constructor' || wordId === 'prototype') {
    throw new Error('單字識別碼無效。');
  }
  if (typeof correct !== 'boolean' || !['again', 'hard', 'good', 'easy'].includes(rating)) {
    throw new Error('作答紀錄無效。');
  }
  const timestamp = now.toISOString();
  const previous = state.progress[wordId];
  const recalled = correct && rating !== 'again';
  const effectiveRating: Rating = correct ? rating : 'again';
  // Early practice updates lastReviewedAt for the activity log, but must not
  // move the scheduling anchor. Recover the last real scheduling instant from
  // the due date and its interval, so a morning warm-up cannot block a review
  // that genuinely becomes due later that same day.
  const scheduledAt = previous && previous.intervalDays > 0
    ? new Date(new Date(previous.dueAt).getTime() - previous.intervalDays * DAY)
    : previous ? new Date(previous.lastReviewedAt) : now;
  const canAdvance = !previous || previous.correctStreak === 0
    || (now.getTime() >= new Date(previous.dueAt).getTime()
      && localDateKey(now) !== localDateKey(scheduledAt));
  const correctStreak = !recalled ? 0
    : canAdvance ? (previous?.correctStreak ?? 0) + 1 : previous!.correctStreak;
  const baseInterval = REVIEW_INTERVALS[Math.min(correctStreak - 1, REVIEW_INTERVALS.length - 1)] ?? 0;
  const intervalDays = recalled && !canAdvance && previous
    ? previous.intervalDays
    : !recalled
    ? 0
    : effectiveRating === 'hard'
      ? Math.max(1, Math.round(baseInterval * 0.5))
      : effectiveRating === 'easy'
        ? Math.min(365, Math.round(baseInterval * 1.5))
        : baseInterval;
  const progress: WordProgress = {
    wordId,
    introducedAt: previous?.introducedAt ?? timestamp,
    lastReviewedAt: timestamp,
    dueAt: recalled && !canAdvance && previous
      ? previous.dueAt
      : new Date(now.getTime() + (recalled ? intervalDays * DAY : 10 * MINUTE)).toISOString(),
    intervalDays,
    attempts: (previous?.attempts ?? 0) + 1,
    correctCount: (previous?.correctCount ?? 0) + (correct ? 1 : 0),
    correctStreak,
    lapses: (previous?.lapses ?? 0) + (recalled ? 0 : 1),
  };
  const review: ReviewRecord = {
    id: `${now.getTime()}-${state.reviews.length}-${wordId}`,
    wordId,
    reviewedAt: timestamp,
    correct,
    rating: effectiveRating,
    intervalDays,
  };
  return {
    ...state,
    progress: { ...state.progress, [wordId]: progress },
    reviews: [...state.reviews, review],
    updatedAt: timestamp,
  };
}

/** Due reviews always precede unseen words. Only the daily remaining allowance
 * is added; new-word quota is consumed by the first completed attempt. */
export function getStudyPlan(state: AppState, wordIds: string[], now: Date = new Date()): StudyPlan {
  const ids = [...new Set(wordIds)];
  const today = localDateKey(now);
  const introducedToday = ids.filter((id) => {
    const progress = state.progress[id];
    return progress && localDateKey(new Date(progress.introducedAt)) === today;
  }).length;
  const remainingNew = Math.max(0, state.settings.dailyNewLimit - introducedToday);
  const due = ids.filter((id) => {
    const progress = state.progress[id];
    return progress && new Date(progress.dueAt).getTime() <= now.getTime();
  }).sort((a, b) => state.progress[a].dueAt.localeCompare(state.progress[b].dueAt));
  const newWords = ids.filter((id) => !state.progress[id]).slice(0, remainingNew);
  return { due, newWords, queue: [...due, ...newWords], introducedToday, remainingNew };
}

export function isFamiliar(progress: WordProgress | undefined): boolean {
  return Boolean(progress && progress.intervalDays >= 7 && progress.correctStreak >= 3);
}

/** Accuracy is an integer percentage (0–100); an empty history is 0, not 100. */
export function getStats(state: AppState, wordIds: string[], now: Date = new Date()) {
  const ids = new Set(wordIds);
  const progress = Object.values(state.progress).filter((item) => ids.has(item.wordId));
  const reviews = state.reviews.filter((item) => ids.has(item.wordId));
  const today = localDateKey(now);
  const todayReviews = reviews.filter((review) => localDateKey(new Date(review.reviewedAt)) === today);
  const activeDays = new Set(reviews.map((review) => localDateKey(new Date(review.reviewedAt))));
  const cursor = new Date(now);
  // Yesterday's streak remains visible until there is an actual missed day.
  if (!activeDays.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (activeDays.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    total: ids.size,
    seen: progress.length,
    mastered: progress.filter(isFamiliar).length,
    dueCount: getStudyPlan(state, [...ids], now).due.length,
    todayReviews: todayReviews.length,
    todayCorrect: todayReviews.filter((review) => review.correct).length,
    streak,
    accuracy: reviews.length ? Math.round(reviews.filter((review) => review.correct).length / reviews.length * 100) : 0,
  };
}

export function updateSettings(state: AppState, settings: Partial<AppSettings>, now: Date = new Date()): AppState {
  const next = { ...state.settings, ...settings };
  if (!Number.isInteger(next.dailyNewLimit) || next.dailyNewLimit < 1 || next.dailyNewLimit > 30
      || !Number.isInteger(next.dailyMinutes) || next.dailyMinutes < 5 || next.dailyMinutes > 60) {
    throw new Error('每日新詞需為 1–30 個，學習時間需為 5–60 分鐘。');
  }
  return { ...state, settings: next, updatedAt: now.toISOString() };
}
