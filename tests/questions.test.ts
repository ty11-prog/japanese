import { describe, expect, it } from 'vitest';
import { vocabulary } from '../src/data/vocabulary';
import { quizExclusionGroups } from '../src/data/quiz-exclusions';
import { canBeDistractor } from '../src/lib/questions';

const byId = new Map(vocabulary.map((word) => [word.id, word]));
const byWord = new Map(vocabulary.map((word) => [word.word, word]));

describe('unambiguous vocabulary distractors', () => {
  it('uses real IDs and excludes reviewed near synonyms in both directions', () => {
    for (const group of quizExclusionGroups) {
      expect(new Set(group).size).toBe(group.length);
      expect(group.length).toBeGreaterThan(1);
      for (const left of group) {
        expect(byId.has(left), left).toBe(true);
        for (const right of group) {
          expect(byId.has(right), right).toBe(true);
          for (const mode of ['meaning', 'context'] as const) {
            expect(canBeDistractor(byId.get(left)!, byId.get(right)!, mode), `${left}/${right}/${mode}`).toBe(false);
          }
        }
      }
    }
  });

  it('does not mark shared displayed senses or common alternate answers wrong', () => {
    for (const [left, right] of [
      ['支度', '準備'], ['確認', '確かめる'], ['修理', '直す'], ['地域', '地方'],
      ['調査', '調べる'], ['苦しい', 'つらい'], ['釣り銭', '小銭'],
    ]) {
      for (const mode of ['meaning', 'context'] as const) {
        expect(canBeDistractor(byWord.get(left)!, byWord.get(right)!, mode), `${left}/${right}/${mode}`).toBe(false);
      }
    }
    expect(canBeDistractor(byWord.get('家賃')!, byWord.get('給料')!, 'meaning')).toBe(true);
  });

  it('still has at least three distinct wrong options for every word and exercise mode', () => {
    for (const word of vocabulary) {
      for (const mode of ['meaning', 'context', 'listening'] as const) {
        const pool = vocabulary.filter((candidate) => canBeDistractor(word, candidate, mode));
        const labels = new Set(pool.map((candidate) => mode === 'meaning' ? candidate.meaning : candidate.word));
        expect(labels.size, `${word.id}/${mode}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('does not offer the target or a different spelling of the same sound as a listening distractor', () => {
    const target = byWord.get('確認')!;
    expect(canBeDistractor(target, target, 'listening')).toBe(false);
    expect(canBeDistractor(target, { ...target, id: 'same-sound', word: 'かくにん' }, 'listening')).toBe(false);
    expect(canBeDistractor(byWord.get('支度')!, byWord.get('準備')!, 'listening')).toBe(true);
  });
});
