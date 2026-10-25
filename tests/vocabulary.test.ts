import { describe, expect, it } from 'vitest';
import { vocabulary } from '../src/data/vocabulary';
import originalWordIds from './fixtures/original-word-ids.json';
import { createInitialState, getStudyPlan, recordReview } from '../src/lib/learning';
import { exportBackup, parseBackup } from '../src/lib/storage';

describe('the bundled offline vocabulary', () => {
  it('ships 300 distinct, stable word identities across five complete topics', () => {
    expect(vocabulary).toHaveLength(300);
    expect(new Set(vocabulary.map((word) => word.id)).size).toBe(300);
    expect(new Set(vocabulary.map((word) => word.word)).size).toBe(300);
    for (const category of ['日常生活', '工作學習', '情緒人際', '社會資訊', '動作表達']) {
      expect(vocabulary.filter((word) => word.category === category)).toHaveLength(60);
    }
  });

  it('preserves the original word identities and order so existing progress keeps its meaning', () => {
    expect(vocabulary.slice(0, originalWordIds.length).map((word) => word.id)).toEqual(originalWordIds);
  });

  it('imports a 100-word edition backup and schedules newly added words after due reviews', () => {
    const now = new Date('2026-10-20T04:00:00Z');
    let oldState = createInitialState(now);
    for (const id of originalWordIds) oldState = recordReview(oldState, id, true, 'good', now);
    const restored = parseBackup(exportBackup(oldState), vocabulary.map((word) => word.id));
    expect(restored).toEqual(oldState);
    const plan = getStudyPlan(restored, vocabulary.map((word) => word.id), new Date('2026-10-22T04:00:00Z'));
    expect(plan.due).toEqual(originalWordIds);
    expect(plan.newWords).toHaveLength(8);
    expect(plan.newWords.every((id) => !originalWordIds.includes(id))).toBe(true);
    expect(plan.queue.slice(0, 100)).toEqual(originalWordIds);
  });

  it('has the reading, meaning, original example, translation and collocation needed for every offline card', () => {
    for (const word of vocabulary) {
      expect(word.id, word.word).toMatch(/^[a-z0-9][a-z0-9_-]{0,63}$/);
      expect(word.reading, word.word).toMatch(/^[\u3041-\u3096ー]+$/);
      for (const field of ['word', 'meaning', 'partOfSpeech', 'example', 'translation', 'collocation'] as const) {
        expect(word[field].trim().length, `${word.id}.${field}`).toBeGreaterThan(0);
      }
      expect(word.example, word.id).toMatch(/[。！？]$/);
    }
  });

  it('only blanks complete dictionary forms that occur exactly once, with a Chinese disambiguation cue', () => {
    const contextual = vocabulary.filter((word) => word.example.includes(word.word));
    expect(contextual.length).toBeGreaterThan(50);
    for (const word of contextual) {
      expect(word.example.split(word.word), word.id).toHaveLength(2);
      expect(word.translation.trim().length, word.id).toBeGreaterThan(5);
    }
  });
});
