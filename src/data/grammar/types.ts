export const grammarCategories = [
  '時間與進程', '原因與判斷', '條件與建議',
  '目的與變化', '立場與對象', '比較與程度',
] as const;

export type GrammarCategory = typeof grammarCategories[number];

export interface GrammarQuestion {
  id: string;
  kind: 'meaning' | 'connection' | 'usage';
  instruction: string;
  /** Japanese source with curated [漢字|ひらがな] readings. */
  japanese: string;
  translation?: string;
  optionLanguage: 'ja' | 'zh-TW';
  options: { id: string; text: string; explanation: string }[];
  answerId: string;
  explanation: string;
}

export interface GrammarPoint {
  id: string;
  pattern: string;
  category: GrammarCategory;
  meaning: string;
  connection: string[];
  explanation: string;
  caution: string;
  examples: { japanese: string; translation: string }[];
  questions: GrammarQuestion[];
}
