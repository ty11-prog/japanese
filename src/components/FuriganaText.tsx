import { maskFurigana, type FuriganaPart } from '../lib/furigana';

export default function FuriganaText({ parts, show = true, answer }: {
  parts: readonly FuriganaPart[];
  show?: boolean;
  answer?: string;
}) {
  const visible = answer ? maskFurigana(parts, answer) : parts;
  return <>{visible.map((part, index) => {
    if (part.kind === 'blank') return <span className="sentence-blank" key={index}>？</span>;
    if (part.kind === 'text' || !show) return <span key={index}>{part.text}</span>;
    return <ruby key={index}>{part.text}<rp aria-hidden="true">（</rp><rt aria-hidden="true">{part.reading}</rt><rp aria-hidden="true">）</rp></ruby>;
  })}</>;
}
