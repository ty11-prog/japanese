import { describe, expect, it } from 'vitest';
import { grammarPoints, grammarQuestions } from '../src/data/grammar';
import { createGrammarState, getGrammarPractice, grammarStats } from '../src/lib/grammar';
import { recordReview } from '../src/lib/learning';

const now = new Date('2026-10-25T04:00:00.000Z');
const later = (days: number) => new Date(now.getTime() + days * 86_400_000);
const firstPoint = grammarPoints[0];
const questionIds = grammarQuestions.map((question) => question.id);

describe('question-level grammar review scheduling', () => {
  it('starts with six unseen questions, a five-minute suggestion and no progress awarded for opening a lesson', () => {
    const state = createGrammarState(now);
    const original = structuredClone(state);
    expect(state.settings).toEqual({ dailyNewLimit: 6, dailyMinutes: 5 });
    expect(getGrammarPractice(state, now)).toEqual(questionIds.slice(0, 6));
    expect(grammarStats(state, now)).toEqual({ totalPoints: 30, practicedPoints: 0, familiarPoints: 0, dueQuestions: 0, todayAnswers: 0 });
    expect(state).toEqual(original);
  });

  it('counts a partly practised point once while preserving separate evidence for its other question types', () => {
    let state = recordReview(createGrammarState(now), firstPoint.questions[0].id, true, 'good', now);
    expect(grammarStats(state, now)).toMatchObject({ practicedPoints: 1, familiarPoints: 0, todayAnswers: 1 });
    state = recordReview(state, firstPoint.questions[1].id, true, 'good', now);
    expect(grammarStats(state, now)).toMatchObject({ practicedPoints: 1, familiarPoints: 0, todayAnswers: 2 });
    expect(state.progress[firstPoint.questions[2].id]).toBeUndefined();
  });

  it('requires successful spaced recall in every question type before a grammar point is familiar', () => {
    let state = createGrammarState(now);
    for (const question of firstPoint.questions) {
      state = recordReview(state, question.id, true, 'good', now);
      state = recordReview(state, question.id, true, 'good', later(1));
    }
    for (const question of firstPoint.questions.slice(0, 2)) state = recordReview(state, question.id, true, 'good', later(4));
    expect(grammarStats(state, later(4))).toMatchObject({ practicedPoints: 1, familiarPoints: 0 });
    state = recordReview(state, firstPoint.questions[2].id, true, 'good', later(4));
    expect(grammarStats(state, later(4))).toMatchObject({ practicedPoints: 1, familiarPoints: 1 });
    // A forgotten usage question removes the point's familiar label.
    state = recordReview(state, firstPoint.questions[2].id, false, 'again', later(11));
    expect(grammarStats(state, later(11)).familiarPoints).toBe(0);
  });

  it('does not turn repeated same-day correct answers into familiar grammar', () => {
    let state = createGrammarState(now);
    for (let minute = 0; minute < 10; minute += 1) {
      for (const question of firstPoint.questions) state = recordReview(state, question.id, true, 'good', new Date(now.getTime() + minute * 60_000));
    }
    expect(grammarStats(state, now)).toMatchObject({ practicedPoints: 1, familiarPoints: 0, todayAnswers: 30 });
    expect(getGrammarPractice(state, now)).toEqual(questionIds.slice(3, 6));
  });

  it('caps a round at six questions and places overdue reviews ahead of new questions', () => {
    let state = createGrammarState(now);
    for (const id of questionIds.slice(0, 6)) state = recordReview(state, id, true, 'good', now);
    expect(getGrammarPractice(state, now)).toEqual([]);
    expect(getGrammarPractice(state, later(1))).toEqual(questionIds.slice(0, 6));
    expect(grammarStats(state, later(1)).dueQuestions).toBe(6);
    for (const id of questionIds.slice(0, 2)) state = recordReview(state, id, true, 'good', later(1));
    expect(getGrammarPractice(state, later(1))).toEqual([...questionIds.slice(2, 6), ...questionIds.slice(6, 8)]);
  });

  it('schedules only the incorrect question after ten minutes, keeping the point’s other attempts intact', () => {
    let state = recordReview(createGrammarState(now), firstPoint.questions[1].id, true, 'good', now);
    state = recordReview(state, firstPoint.questions[0].id, false, 'again', now);
    const retry = new Date(now.getTime() + 600_000);
    expect(state.progress[firstPoint.questions[0].id]).toMatchObject({ intervalDays: 0, correctStreak: 0, lapses: 1 });
    expect(state.progress[firstPoint.questions[0].id].dueAt).toBe(retry.toISOString());
    expect(state.progress[firstPoint.questions[1].id]).toMatchObject({ correctCount: 1, intervalDays: 1 });
    expect(getGrammarPractice(state, retry)[0]).toBe(firstPoint.questions[0].id);
    expect(grammarStats(state, retry).dueQuestions).toBe(1);
  });

  it('ignores vocabulary IDs when planning grammar or calculating grammar progress', () => {
    const state = recordReview(createGrammarState(now), 'shitaku', true, 'good', now);
    expect(getGrammarPractice(state, now)).toEqual(questionIds.slice(0, 6));
    expect(grammarStats(state, now)).toEqual({ totalPoints: 30, practicedPoints: 0, familiarPoints: 0, dueQuestions: 0, todayAnswers: 0 });
  });
});
