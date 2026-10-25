import { describe, expect, it } from 'vitest';
import { vocabulary } from '../src/data/vocabulary';
import { annotatedExamples, exampleFurigana } from '../src/data/furigana';
import { maskFurigana, parseFurigana, plainSentence } from '../src/lib/furigana';

describe('curated example readings', () => {
  it('covers every bundled example without changing any original text', () => {
    expect(Object.keys(annotatedExamples).sort()).toEqual(vocabulary.map((word) => word.id).sort());
    for (const word of vocabulary) {
      const parts = exampleFurigana[word.id];
      expect(plainSentence(parts), word.id).toBe(word.example);
      expect(parts.some((part) => part.kind === 'ruby'), word.id).toBe(true);
      for (const part of parts) {
        if (part.kind === 'text') expect(part.text, word.id).not.toMatch(/[\p{Script=Han}々]/u);
        if (part.kind === 'ruby') expect(part.reading, word.id).toMatch(/^[ぁ-ゖー]+$/);
      }
    }
  });

  it('masks every context answer without leaving the original answer or its ruby behind', () => {
    for (const word of vocabulary.filter((item) => item.example.includes(item.word))) {
      const masked = maskFurigana(exampleFurigana[word.id], word.word);
      expect(plainSentence(masked), word.id).toBe(word.example.replace(word.word, '？'));
      expect(masked.filter((part) => part.kind === 'blank'), word.id).toHaveLength(1);
    }
  });

  it('masks an answer spanning multiple ruby and plain segments', () => {
    const parts = parseFurigana('[出|で]かける[支度|したく]をします。');
    const masked = maskFurigana(parts, '出かける');
    expect(masked).toEqual([{ kind: 'blank' }, { kind: 'ruby', text: '支度', reading: 'したく' }, { kind: 'text', text: 'をします。' }]);
    expect(JSON.stringify(masked)).not.toContain('で');
  });

  it('does not guess a reading for a partially masked compound', () => {
    const masked = maskFurigana(parseFurigana('[日本語|にほんご]を[勉強|べんきょう]します。'), '本語');
    expect(plainSentence(masked)).toBe('日？を勉強します。');
    expect(masked[0]).toEqual({ kind: 'text', text: '日' });
    expect(JSON.stringify(masked)).not.toContain('にほんご');
  });

  it('handles absent answers and rejects malformed static annotations', () => {
    const parts = parseFurigana('[今日|きょう]は[雨|あめ]です。');
    expect(maskFurigana(parts, '学校')).toEqual(parts);
    expect(maskFurigana(parts, '')).toEqual(parts);
    expect(() => parseFurigana('[今日|wrong]です。')).toThrow();
    expect(() => parseFurigana('[今日|きょう')).toThrow();
  });
});
