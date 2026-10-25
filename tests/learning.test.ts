import { describe, expect, it } from 'vitest';
import {
  createInitialState, getStats, getStudyPlan, isFamiliar, localDateKey,
  recordReview, updateSettings,
} from '../src/lib/learning';

const now = new Date('2026-10-25T04:00:00.000Z');
const ids = ['yakusoku', 'junbi', 'kakunin', 'shippai', 'seikou', 'renshuu', 'setsumei', 'keiken', 'yotei', 'renraku'];
const later = (days: number) => new Date(now.getTime() + days * 86_400_000);

describe('retrieval-based spaced repetition', () => {
  it('starts with eight unseen words, no review history, and no false mastery', () => {
    const state = createInitialState(now);
    expect(getStudyPlan(state, ids, now).queue).toEqual(ids.slice(0, 8));
    expect(getStats(state, ids, now)).toMatchObject({ total: 10, seen: 0, mastered: 0, accuracy: 0, todayReviews: 0 });
    expect(state.reviews).toHaveLength(0);
  });

  it('uses 1, 3 and 7 days for successive successful recalls and only then marks familiar', () => {
    let state = createInitialState(now);
    state = recordReview(state, ids[0], true, 'good', now);
    expect(state.progress[ids[0]].intervalDays).toBe(1);
    expect(isFamiliar(state.progress[ids[0]])).toBe(false);
    state = recordReview(state, ids[0], true, 'good', later(1));
    expect(state.progress[ids[0]].intervalDays).toBe(3);
    state = recordReview(state, ids[0], true, 'good', later(4));
    expect(state.progress[ids[0]].intervalDays).toBe(7);
    expect(isFamiliar(state.progress[ids[0]])).toBe(true);
    expect(state.progress[ids[0]].attempts).toBe(3);
  });

  it('records same-day practice without advancing the spaced-recall stage or pushing the due date', () => {
    const start = new Date(2026, 9, 25, 8);
    let state = recordReview(createInitialState(start), ids[0], true, 'good', start);
    const scheduledDue = state.progress[ids[0]].dueAt;
    for (let hour = 9; hour <= 20; hour += 1) {
      state = recordReview(state, ids[0], true, 'easy', new Date(2026, 9, 25, hour));
    }
    expect(state.progress[ids[0]]).toMatchObject({
      attempts: 13, correctCount: 13, correctStreak: 1, intervalDays: 1, dueAt: scheduledDue,
    });
    expect(isFamiliar(state.progress[ids[0]])).toBe(false);
    expect(state.reviews).toHaveLength(13);
  });

  it('does not advance on the next local day before due, even with repeated easy ratings', () => {
    const start = new Date(2026, 9, 25, 8);
    let state = recordReview(createInitialState(start), ids[0], true, 'easy', start);
    const scheduledDue = state.progress[ids[0]].dueAt;
    expect(state.progress[ids[0]].intervalDays).toBe(2);
    state = recordReview(state, ids[0], true, 'easy', new Date(2026, 9, 26, 8));
    state = recordReview(state, ids[0], true, 'hard', new Date(2026, 9, 26, 20));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 1, intervalDays: 2, dueAt: scheduledDue });
    expect(isFamiliar(state.progress[ids[0]])).toBe(false);
    state = recordReview(state, ids[0], true, 'good', new Date(scheduledDue));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 2, intervalDays: 3 });
  });

  it('requires both a later local day and the due instant before growing to familiar', () => {
    const start = new Date(2026, 9, 25, 23, 59);
    let state = recordReview(createInitialState(start), ids[0], true, 'good', start);
    state = recordReview(state, ids[0], true, 'good', new Date(2026, 9, 26, 0, 1));
    expect(state.progress[ids[0]].correctStreak).toBe(1);
    state = recordReview(state, ids[0], true, 'good', new Date(2026, 9, 27, 0, 1));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 2, intervalDays: 3 });
    expect(isFamiliar(state.progress[ids[0]])).toBe(false);
    const due = state.progress[ids[0]].dueAt;
    state = recordReview(state, ids[0], true, 'easy', new Date(2026, 9, 28, 12));
    expect(state.progress[ids[0]].correctStreak).toBe(2);
    state = recordReview(state, ids[0], true, 'good', new Date(due));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 3, intervalDays: 7 });
    expect(isFamiliar(state.progress[ids[0]])).toBe(true);
  });

  it('allows a due review to advance after an early practice on that same local day', () => {
    const start = new Date(2026, 9, 25, 10);
    let state = recordReview(createInitialState(start), ids[0], true, 'good', start);
    const due = state.progress[ids[0]].dueAt;
    state = recordReview(state, ids[0], true, 'easy', new Date(2026, 9, 26, 9));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 1, intervalDays: 1, dueAt: due });
    state = recordReview(state, ids[0], true, 'good', new Date(due));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 2, intervalDays: 3 });
    expect(new Date(state.progress[ids[0]].dueAt).getTime()).toBe(new Date(due).getTime() + 3 * 86_400_000);
  });

  it('restores only the first stage after a short-term retry and cannot farm familiarity', () => {
    const start = new Date(2026, 9, 25, 8);
    let state = recordReview(createInitialState(start), ids[0], false, 'again', start);
    state = recordReview(state, ids[0], true, 'good', new Date(2026, 9, 25, 8, 10));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 1, intervalDays: 1, lapses: 1 });
    state = recordReview(state, ids[0], true, 'easy', new Date(2026, 9, 25, 8, 20));
    state = recordReview(state, ids[0], true, 'easy', new Date(2026, 9, 25, 8, 30));
    expect(state.progress[ids[0]]).toMatchObject({ correctStreak: 1, intervalDays: 1, attempts: 4, correctCount: 3 });
    expect(isFamiliar(state.progress[ids[0]])).toBe(false);
  });

  it('ignores an easy rating after a wrong answer and schedules a ten-minute retry', () => {
    let state = recordReview(createInitialState(now), ids[0], true, 'easy', now);
    state = recordReview(state, ids[0], false, 'easy', later(2));
    const progress = state.progress[ids[0]];
    expect(progress).toMatchObject({ intervalDays: 0, correctStreak: 0, lapses: 1, correctCount: 1 });
    expect(new Date(progress.dueAt).getTime() - later(2).getTime()).toBe(600_000);
    expect(state.reviews[1].rating).toBe('again');
    expect(getStudyPlan(state, [ids[0]], later(2)).due).toEqual([]);
    expect(getStudyPlan(state, [ids[0]], new Date(later(2).getTime() + 600_000)).due).toEqual([ids[0]]);
  });

  it('does not mark one confident answer as familiar or mutate the previous state', () => {
    const original = createInitialState(now);
    const state = recordReview(original, ids[0], true, 'easy', now);
    expect(isFamiliar(state.progress[ids[0]])).toBe(false);
    expect(original.progress).toEqual({});
    expect(original.reviews).toEqual([]);
  });

  it('places overdue reviews first and only allocates the remaining daily new quota', () => {
    let state = updateSettings(createInitialState(now), { dailyNewLimit: 2 }, now);
    state = recordReview(state, ids[0], true, 'good', now);
    state = recordReview(state, ids[1], true, 'good', now);
    expect(getStudyPlan(state, ids, now)).toMatchObject({ newWords: [], introducedToday: 2, remainingNew: 0 });
    expect(getStudyPlan(state, ids, later(1)).queue).toEqual([ids[0], ids[1], ids[2], ids[3]]);
    expect(getStudyPlan(state, ids, later(1)).newWords).toHaveLength(2);
  });

  it('counts repeated attempts as reviews but not as more introduced words', () => {
    let state = recordReview(createInitialState(now), ids[0], false, 'again', now);
    state = recordReview(state, ids[0], true, 'good', new Date(now.getTime() + 600_000));
    expect(getStudyPlan(state, ids, now).introducedToday).toBe(1);
    expect(getStats(state, ids, now)).toMatchObject({ todayReviews: 2, todayCorrect: 1, accuracy: 50, streak: 1 });
  });

  it('measures streaks using local calendar days and preserves yesterday until a missed day', () => {
    const dayOne = new Date(2026, 9, 23, 23, 59);
    const dayTwo = new Date(2026, 9, 24, 0, 1);
    let state = recordReview(createInitialState(dayOne), ids[0], true, 'good', dayOne);
    state = recordReview(state, ids[0], true, 'good', dayTwo);
    expect(getStats(state, ids, new Date(2026, 9, 24, 12)).streak).toBe(2);
    expect(getStats(state, ids, new Date(2026, 9, 25, 12)).streak).toBe(2);
    expect(getStats(state, ids, new Date(2026, 9, 26, 12)).streak).toBe(0);
    expect(localDateKey(dayOne)).toBe('2026-10-23');
  });

  it('rejects invalid goals and unsafe word IDs', () => {
    const state = createInitialState(now);
    expect(() => updateSettings(state, { dailyNewLimit: 0 })).toThrow();
    expect(() => updateSettings(state, { dailyMinutes: 500 })).toThrow();
    expect(() => recordReview(state, '__proto__', true, 'good', now)).toThrow();
    expect(() => recordReview(state, 'constructor', true, 'good', now)).toThrow();
  });
});
