export type FuriganaPart =
  | { kind: 'text'; text: string }
  | { kind: 'ruby'; text: string; reading: string }
  | { kind: 'blank' };

/** Parse original, curated [漢字|かんじ] annotations without interpreting HTML. */
export function parseFurigana(annotation: string): FuriganaPart[] {
  const parts: FuriganaPart[] = [];
  const pattern = /\[([^\[\]|]+)\|([ぁ-ゖー]+)\]/g;
  let offset = 0;
  for (const match of annotation.matchAll(pattern)) {
    const before = annotation.slice(offset, match.index);
    if (before) parts.push({ kind: 'text', text: before });
    parts.push({ kind: 'ruby', text: match[1], reading: match[2] });
    offset = match.index + match[0].length;
  }
  if (offset < annotation.length) parts.push({ kind: 'text', text: annotation.slice(offset) });
  if (parts.some((part) => part.kind !== 'blank' && /[\[\]|]/.test(part.text))) {
    throw new Error('例句假名標註格式不正確。');
  }
  return parts;
}

export function plainSentence(parts: readonly FuriganaPart[]): string {
  return parts.map((part) => part.kind === 'blank' ? '？' : part.text).join('');
}

/** Mask the whole answer, including readings, even across annotation boundaries.
 * A partially overlapping ruby is rendered as plain text: splitting its reading
 * would invent a kanji-to-kana alignment and could disclose the answer. */
export function maskFurigana(parts: readonly FuriganaPart[], answer: string): FuriganaPart[] {
  if (!answer) return [...parts];
  const sentence = plainSentence(parts);
  const start = sentence.indexOf(answer);
  if (start < 0) return [...parts];
  const end = start + answer.length;
  const result: FuriganaPart[] = [];
  let offset = 0;
  let inserted = false;
  for (const part of parts) {
    if (part.kind === 'blank') { result.push(part); offset += 1; continue; }
    const partEnd = offset + part.text.length;
    if (partEnd <= start || offset >= end) result.push(part);
    else {
      if (offset < start) result.push({ kind: 'text', text: part.text.slice(0, start - offset) });
      if (!inserted) { result.push({ kind: 'blank' }); inserted = true; }
      if (partEnd > end) result.push({ kind: 'text', text: part.text.slice(end - offset) });
    }
    offset = partEnd;
  }
  return result;
}
