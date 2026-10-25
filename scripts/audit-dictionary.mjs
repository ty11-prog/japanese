/**
 * Read-only JMdict headword/reading/POS evidence for the bundled vocabulary.
 * Usage: node scripts/audit-dictionary.mjs /path/to/jmdict-eng.json [report.json]
 * Supply the full, English jmdict-simplified JSON; data is never bundled into
 * the app. Exact pair checks honor JMdict reading/sense restrictions.
 * This cannot validate translations, sentence naturalness, or JLPT levels.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dictionaryPath = process.argv[2];
if (!dictionaryPath) {
  console.error('Usage: node scripts/audit-dictionary.mjs /path/to/jmdict-eng.json [report.json]');
  process.exit(2);
}

// Load the project's trusted, static TypeScript data without introducing a
// runtime dependency or requiring emitted files in the source tree.
const modules = new Map();
function loadData(filename) {
  const fullPath = path.resolve(filename);
  if (modules.has(fullPath)) return modules.get(fullPath).exports;
  if (!fullPath.startsWith(path.join(root, 'src') + path.sep)) throw new Error('Only src data imports are allowed.');
  const source = readFileSync(fullPath, 'utf8');
  const output = ts.transpileModule(source, {
    fileName: fullPath,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  modules.set(fullPath, module);
  const requireData = (specifier) => {
    if (!specifier.startsWith('.')) throw new Error(`Unexpected data dependency: ${specifier}`);
    return loadData(path.resolve(path.dirname(fullPath), specifier + (path.extname(specifier) ? '' : '.ts')));
  };
  const run = vm.runInThisContext(`(function(exports, require, module) {\n${output}\n})`, { filename: fullPath });
  run(module.exports, requireData, module);
  return module.exports;
}

const { vocabulary } = loadData(path.join(root, 'src/data/vocabulary.ts'));
const { exampleFurigana } = loadData(path.join(root, 'src/data/furigana.ts'));
const bytes = readFileSync(dictionaryPath);
const dictionary = JSON.parse(bytes.toString('utf8'));
if (!Array.isArray(dictionary.words) || !dictionary.tags) throw new Error('Expected full jmdict-simplified JSON.');
const bySurface = new Map();
for (const entry of dictionary.words) {
  const forms = new Set([...entry.kanji, ...entry.kana].map((form) => form.text));
  for (const surface of forms) {
    if (!bySurface.has(surface)) bySurface.set(surface, []);
    bySurface.get(surface).push(entry);
  }
}
function applies(restriction, value) { return restriction?.includes('*') || restriction?.includes(value); }
function pairEntries(surface, reading) {
  return (bySurface.get(surface) ?? []).filter((entry) => entry.kana.some((kana) => (
    kana.text === reading && (
      // A kana-written headword must be the same kana as its reading. Kanji
      // spellings must explicitly be allowed by appliesToKanji.
      (surface === reading) || (entry.kanji.some((kanji) => kanji.text === surface) && applies(kana.appliesToKanji, surface))
    )
  )));
}
function partOfSpeech(entries, surface, reading) {
  return [...new Set(entries.flatMap((entry) => entry.sense
    .filter((sense) => applies(sense.appliesToKanji, surface) && applies(sense.appliesToKana, reading))
    .flatMap((sense) => sense.partOfSpeech)))].sort();
}
const headwords = vocabulary.map((word) => {
  const entries = pairEntries(word.word, word.reading);
  const tags = partOfSpeech(entries, word.word, word.reading);
  return {
    id: word.id, word: word.word, reading: word.reading, appPartOfSpeech: word.partOfSpeech,
    matched: entries.length > 0, entryIds: entries.map((entry) => entry.id),
    dictionaryPartOfSpeech: tags,
  };
});
const ruby = { checked: 0, matched: 0, notStandaloneEntry: 0, needsContextReview: [] };
for (const word of vocabulary) {
  for (const part of exampleFurigana[word.id] ?? []) {
    if (part.kind !== 'ruby') continue;
    ruby.checked += 1;
    if (pairEntries(part.text, part.reading).length) ruby.matched += 1;
    else if (!bySurface.has(part.text)) ruby.notStandaloneEntry += 1;
    else ruby.needsContextReview.push({ id: word.id, text: part.text, reading: part.reading });
  }
}
const report = {
  dictionary: {
    formatVersion: dictionary.version, dictDate: dictionary.dictDate,
    languages: dictionary.languages, commonOnly: dictionary.commonOnly,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  },
  summary: {
    total: vocabulary.length, matched: headwords.filter((word) => word.matched).length,
    unmatched: headwords.filter((word) => !word.matched).length,
  },
  headwords,
  ruby,
  limitations: [
    'Matching a written headword and allowed reading is not a semantic or JLPT-level certification.',
    'POS tags are evidence for review, not an automatic equivalence to the app taxonomy.',
    'Ruby fragments can be inflected stems or counters; unmatched standalone pairs need contextual review.',
    'No external dictionary definitions or examples are copied into the app by this script.',
  ],
};
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ dictionary: report.dictionary, summary: report.summary, unmatched: headwords.filter((word) => !word.matched), ruby: { ...ruby, needsContextReviewCount: ruby.needsContextReview.length, needsContextReview: ruby.needsContextReview.slice(0, 30) }, report: process.argv[3] ?? null }, null, 2));
if (report.summary.unmatched) process.exitCode = 1;
