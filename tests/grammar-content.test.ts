import { describe, expect, it } from 'vitest';
import { grammarPoints, grammarQuestions, grammarPointMap, grammarQuestionMap } from '../src/data/grammar';
import { vocabulary } from '../src/data/vocabulary';
import { parseFurigana, plainSentence } from '../src/lib/furigana';

const stablePointIds = [
  'grammar-uchini', 'grammar-tabini', 'grammar-saichuuni', 'grammar-tokoroni', 'grammar-tsuideni',
  'grammar-okagede', 'grammar-seide', 'grammar-hazuda', 'grammar-wakedewanai', 'grammar-wakeganai',
  'grammar-tatoetemo', 'grammar-saeba', 'grammar-naikagiri', 'grammar-toshitara', 'grammar-kotowanai',
  'grammar-younisuru', 'grammar-youninaru', 'grammar-kotonisuru', 'grammar-kotoninaru', 'grammar-tameni',
  'grammar-nitotte', 'grammar-toshite', 'grammar-niyotte', 'grammar-nitaishite', 'grammar-nitsuite',
  'grammar-bahodo', 'grammar-hodonai', 'grammar-dakedena', 'grammar-kawarini', 'grammar-toiuyori',
];

function checkedJapanese(annotation: string, context: string) {
  const parts = parseFurigana(annotation);
  const original = plainSentence(parts);
  expect(original.trim().length, context).toBeGreaterThan(0);
  expect(original, context).not.toMatch(/[\[\]|]/);
  for (const part of parts) {
    if (part.kind === 'text') expect(part.text, context).not.toMatch(/[\p{Script=Han}々]/u);
    if (part.kind === 'ruby') {
      expect(part.text, context).toMatch(/[\p{Script=Han}々]/u);
      expect(part.reading, context).toMatch(/^[ぁ-ゖー]+$/);
    }
  }
  return original;
}

describe('offline N3 grammar content', () => {
  it('ships 30 stable grammar identities and 90 individually scheduled questions, separate from vocabulary IDs', () => {
    expect(grammarPoints.map((point) => point.id)).toEqual(stablePointIds);
    expect(grammarPoints).toHaveLength(30);
    expect(grammarQuestions).toHaveLength(90);
    expect(new Set(grammarPoints.map((point) => point.id)).size).toBe(30);
    expect(new Set(grammarQuestions.map((question) => question.id)).size).toBe(90);
    const vocabularyIds = new Set(vocabulary.map((word) => word.id));
    for (const point of grammarPoints) {
      expect(point.id).toMatch(/^grammar-[a-z0-9-]+$/);
      expect(grammarPointMap.get(point.id)).toBe(point);
      for (const question of point.questions) {
        expect(question.id).toMatch(new RegExp(`^${point.id}-q[123]$`));
        expect(vocabularyIds.has(question.id), question.id).toBe(false);
        expect(grammarQuestionMap.get(question.id)).toBe(question);
      }
    }
  });

  it('provides complete explanations and two fully annotated original examples across six balanced categories', () => {
    const categories = ['時間與進程', '原因與判斷', '條件與建議', '目的與變化', '立場與對象', '比較與程度'];
    expect([...new Set(grammarPoints.map((point) => point.category))].sort()).toEqual([...categories].sort());
    for (const category of categories) expect(grammarPoints.filter((point) => point.category === category)).toHaveLength(5);
    for (const point of grammarPoints) {
      for (const field of ['pattern', 'meaning', 'explanation', 'caution'] as const) {
        expect(point[field].trim().length, `${point.id}.${field}`).toBeGreaterThan(0);
      }
      expect(point.connection.length, point.id).toBeGreaterThan(0);
      for (const connection of point.connection) expect(connection.trim().length, point.id).toBeGreaterThan(0);
      expect(point.examples, point.id).toHaveLength(2);
      for (const example of point.examples) {
        const original = checkedJapanese(example.japanese, `${point.id}.example`);
        expect(original, point.id).toMatch(/[。！？]$/);
        expect(example.translation.trim().length, point.id).toBeGreaterThan(4);
      }
      expect(new Set(point.examples.map((example) => plainSentence(parseFurigana(example.japanese)))).size, point.id).toBe(2);
    }
  });

  it('includes meaning, connection and usage retrieval with four distinct options, one declared answer and feedback for every option', () => {
    for (const point of grammarPoints) {
      expect(point.questions, point.id).toHaveLength(3);
      expect(point.questions.map((question) => question.kind).sort(), point.id).toEqual(['connection', 'meaning', 'usage']);
      for (const question of point.questions) {
        expect(question.instruction.trim().length, question.id).toBeGreaterThan(4);
        expect(question.explanation.trim().length, question.id).toBeGreaterThan(4);
        const original = checkedJapanese(question.japanese, `${question.id}.japanese`);
        if (question.kind === 'connection') expect(original.split('（　）'), question.id).toHaveLength(2);
        if (question.kind === 'meaning') expect(original, question.id).not.toContain('（　）');
        expect(question.options, question.id).toHaveLength(4);
        expect(new Set(question.options.map((option) => option.id)).size, question.id).toBe(4);
        expect(question.options.filter((option) => option.id === question.answerId), question.id).toHaveLength(1);
        expect(['ja', 'zh-TW'], question.id).toContain(question.optionLanguage);
        const labels = question.options.map((option) => {
          expect(option.explanation.trim().length, `${question.id}/${option.id}`).toBeGreaterThan(4);
          return question.optionLanguage === 'ja'
            ? checkedJapanese(option.text, `${question.id}/${option.id}`)
            : option.text.trim();
        });
        expect(labels.every((label) => label.length > 0), question.id).toBe(true);
        expect(new Set(labels).size, question.id).toBe(4);
      }
    }
  });
});
