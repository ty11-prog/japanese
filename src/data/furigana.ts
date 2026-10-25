import { furiganaFirst } from './furigana-first';
import { furiganaSecond } from './furigana-second';
import { expandedVocabulary } from './expanded-vocabulary';
import { parseFurigana } from '../lib/furigana';

/** Curated readings for all examples. They do not change word IDs,
 * progress, or the original Japanese strings sent to the speech engine. */
export const annotatedExamples: Record<string, string> = {
  ...furiganaFirst,
  ...furiganaSecond,
  ...Object.fromEntries(expandedVocabulary.map((word) => [word.id, word.annotation])),
};
export const exampleFurigana = Object.fromEntries(
  Object.entries(annotatedExamples).map(([id, annotation]) => [id, parseFurigana(annotation)]),
);
