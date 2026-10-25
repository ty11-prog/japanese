import { furiganaFirst } from './furigana-first';
import { furiganaSecond } from './furigana-second';
import { parseFurigana } from '../lib/furigana';

/** Curated readings for the existing examples. They do not change word IDs,
 * progress, or the original Japanese strings sent to the speech engine. */
export const annotatedExamples = { ...furiganaFirst, ...furiganaSecond };
export const exampleFurigana = Object.fromEntries(
  Object.entries(annotatedExamples).map(([id, annotation]) => [id, parseFurigana(annotation)]),
);
