import { grammarPoints, grammarQuestions } from '../data/grammar';
import { createInitialState, getStats, getStudyPlan, isFamiliar, type AppState } from './learning';

const questionIds = grammarQuestions.map((question) => question.id);

/** A separate question-based schedule keeps grammar and vocabulary independent.
 * Six new questions introduce at most two complete three-question lessons in
 * the recommended order. Opening an explanation never records an attempt. */
export function createGrammarState(now = new Date()): AppState {
  return {
    ...createInitialState(now),
    settings: { dailyNewLimit: 6, dailyMinutes: 5 },
  };
}

/** Keep a short session manageable; remaining due reviews can start another round.
 * Individual lesson practice is also available outside this recommended queue. */
export function getGrammarPractice(state: AppState, now = new Date()): string[] {
  return getStudyPlan(state, questionIds, now).queue.slice(0, 6);
}

export function grammarStats(state: AppState, now = new Date()) {
  const stats = getStats(state, questionIds, now);
  return {
    totalPoints: grammarPoints.length,
    practicedPoints: grammarPoints.filter((point) => point.questions.some((question) => Boolean(state.progress[question.id]))).length,
    familiarPoints: grammarPoints.filter((point) => point.questions.every((question) => isFamiliar(state.progress[question.id]))).length,
    dueQuestions: stats.dueCount,
    todayAnswers: stats.todayReviews,
  };
}
