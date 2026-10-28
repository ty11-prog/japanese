import type { Word } from '../data/vocabulary';
import { headwordFurigana } from '../data/headword-readings';
import FuriganaText from './FuriganaText';

export default function HeadwordText({ word, show = true }: { word: Word; show?: boolean }) {
  return <FuriganaText parts={headwordFurigana[word.word]} show={show} />;
}
