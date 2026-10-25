import { describe, expect, it } from 'vitest';
import { vocabulary } from '../src/data/vocabulary';

describe('the bundled offline vocabulary', () => {
  it('ships 100 distinct, stable word identities across five complete topics', () => {
    expect(vocabulary).toHaveLength(100);
    expect(new Set(vocabulary.map((word) => word.id)).size).toBe(100);
    expect(new Set(vocabulary.map((word) => word.word)).size).toBe(100);
    for (const category of ['日常生活', '工作學習', '情緒人際', '社會資訊', '動作表達']) {
      expect(vocabulary.filter((word) => word.category === category)).toHaveLength(20);
    }
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
