import { quizExclusionGroups } from '../data/quiz-exclusions';
import type { Word } from '../data/vocabulary';

/** Near synonyms are poor wrong answers when either meaning is defensible. */
const exclusions = new Map<string, Set<string>>();
for (const group of quizExclusionGroups) {
  for (const id of group) {
    const neighbors = exclusions.get(id) ?? new Set<string>();
    for (const other of group) neighbors.add(other);
    exclusions.set(id, neighbors);
  }
}

function glosses(meaning: string) {
  return meaning.split(/[；;、，,（）()]/).map((gloss) => gloss.trim().replace(/的$/, '')).filter((gloss) => gloss.length >= 2);
}

export function canBeDistractor(target: Word, candidate: Word, mode: 'meaning' | 'context' | 'listening'): boolean {
  if (target.id === candidate.id || target.word === candidate.word) return false;
  if (mode === 'listening') return target.reading !== candidate.reading;
  if (target.meaning === candidate.meaning || exclusions.get(target.id)?.has(candidate.id)) return false;
  // Also exclude overlapping displayed senses, even if their other senses differ.
  return !glosses(target.meaning).some((left) => glosses(candidate.meaning).some((right) => left.includes(right) || right.includes(left)));
}
