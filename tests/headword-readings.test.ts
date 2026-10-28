import { describe, expect, it } from 'vitest';
import { vocabulary } from '../src/data/vocabulary';
import { annotatedHeadwords, headwordFurigana } from '../src/data/headword-readings';
import { plainSentence } from '../src/lib/furigana';

describe('headword ruby alignment', () => {
  it('covers all 300 dictionary forms and preserves their complete readings, including okurigana', () => {
    expect(annotatedHeadwords).toHaveLength(vocabulary.length);
    expect(Object.keys(headwordFurigana).sort()).toEqual(vocabulary.map((word) => word.word).sort());
    for (const word of vocabulary) {
      const parts = headwordFurigana[word.word];
      expect(plainSentence(parts), word.id).toBe(word.word);
      expect(parts.map((part) => part.kind === 'ruby' ? part.reading : part.kind === 'text' ? part.text : '？').join(''), word.id).toBe(word.reading);
      for (const part of parts) {
        if (part.kind === 'text') expect(part.text, word.id).not.toMatch(/[\p{Script=Han}々]/u);
        if (part.kind === 'ruby') expect(part.reading, word.id).toMatch(/^[ぁ-ゖー]+$/);
      }
    }
  });

  it('aligns unequal-length readings to the corresponding character instead of dividing kana evenly', () => {
    expect(headwordFurigana['節約']).toEqual([{ kind: 'ruby', text: '節', reading: 'せつ' }, { kind: 'ruby', text: '約', reading: 'やく' }]);
    expect(headwordFurigana['準備']).toEqual([{ kind: 'ruby', text: '準', reading: 'じゅん' }, { kind: 'ruby', text: '備', reading: 'び' }]);
    expect(headwordFurigana['予算']).toEqual([{ kind: 'ruby', text: '予', reading: 'よ' }, { kind: 'ruby', text: '算', reading: 'さん' }]);
  });

  it('keeps irregular readings intact and does not annotate existing kana twice', () => {
    expect(headwordFurigana['真面目']).toEqual([{ kind: 'ruby', text: '真面目', reading: 'まじめ' }]);
    expect(headwordFurigana['取り替える']).toEqual([
      { kind: 'ruby', text: '取', reading: 'と' }, { kind: 'text', text: 'り' },
      { kind: 'ruby', text: '替', reading: 'か' }, { kind: 'text', text: 'える' },
    ]);
    expect(headwordFurigana['つらい']).toEqual([{ kind: 'text', text: 'つらい' }]);
  });
});
