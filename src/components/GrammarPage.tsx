import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpFromLine, BookOpen, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, Flower2, Lightbulb, RefreshCw, Search, ShieldCheck, Sparkles, Volume2, X } from 'lucide-react';
import { grammarCategories, grammarPoints, grammarQuestions, grammarQuestionMap, type GrammarPoint, type GrammarQuestion } from '../data/grammar';
import { createGrammarState, getGrammarPractice, grammarStats } from '../lib/grammar';
import { exportGrammarBackup, loadGrammarState, parseGrammarBackup, saveGrammarState } from '../lib/grammar-storage';
import { isFamiliar, recordReview, type AppState } from '../lib/learning';
import { StorageConflictError } from '../lib/storage';
import { parseFurigana, plainSentence } from '../lib/furigana';
import FuriganaText from './FuriganaText';

type Props = {
  showFurigana: boolean;
  toggleFurigana: () => void;
  speak: (text: string, rate?: number) => void;
  onStorageStatus: (status: { pending: boolean; blocked: boolean }) => void;
};
type Practice = {
  ids: string[];
  index: number;
  phase: 'recall' | 'choose' | 'feedback';
  answerId: string | null;
  results: boolean[];
  mistakes: string[];
  repeated: string[];
  seed: number;
};
type Summary = { total: number; correct: number; mistakes: string[] };
const questionIds = grammarQuestions.map((question) => question.id);
const pointByQuestion = new Map(grammarPoints.flatMap((point) => point.questions.map((question) => [question.id, point] as const)));
const kinds = { meaning: '理解句意', connection: '掌握接續', usage: '放進情境' };

function localDate() { return new Date().toLocaleDateString('sv-SE'); }
function patternMarkup(pattern: string) {
  return pattern.replace(/最中/g, '[最中|さいちゅう]').replace(/限/g, '[限|かぎ]').replace(/対/g, '[対|たい]');
}
function Japanese({ source, show }: { source: string; show: boolean }) {
  return <FuriganaText parts={parseFurigana(source)} show={show} />;
}
function shuffledOptions(question: GrammarQuestion, seed: number): GrammarQuestion['options'] {
  const options = [...question.options];
  let value = seed >>> 0;
  for (let index = options.length - 1; index > 0; index -= 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const position = value % (index + 1);
    [options[index], options[position]] = [options[position], options[index]];
  }
  return options;
}
function GrammarDialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={dialog} className={`grammar-dialog ${className}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}><div className="grammar-dialog-content"><div className="grammar-dialog-top"><h2 id={titleId}>{title}</h2><button type="button" className="grammar-icon-button" onClick={onClose} aria-label="關閉文法視窗"><X size={21} /></button></div>{children}</div></dialog>;
}

export default function GrammarPage({ showFurigana, toggleFurigana, speak, onStorageStatus }: Props) {
  const [state, setState] = useState<AppState | null>(null);
  const [storageError, setStorageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [backupError, setBackupError] = useState('');
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [category, setCategory] = useState('全部');
  const [search, setSearch] = useState('');
  const [practice, setPractice] = useState<Practice | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [now, setNow] = useState(new Date());
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const optionsGroup = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AppState | null>(null);
  const persisted = useRef<AppState | null | undefined>(undefined);
  const readBlocked = useRef(false);
  const saveFailed = useRef(false);
  const pending = useRef(0);
  const loading = useRef(true);
  const mounted = useRef(true);
  const saveChain = useRef(Promise.resolve());
  const importInProgress = useRef(false);
  const persistenceRequested = useRef(false);
  const storageCallback = useRef(onStorageStatus);
  storageCallback.current = onStorageStatus;

  function reportStorage() {
    if (mounted.current) setSaving(pending.current > 0);
    storageCallback.current({ pending: loading.current || pending.current > 0, blocked: readBlocked.current || saveFailed.current });
  }
  function showStorageFailure(error: unknown) {
    saveFailed.current = true;
    if (error instanceof StorageConflictError) {
      readBlocked.current = true;
      if (mounted.current) setStorageError('另一個分頁已更新文法進度，已停止覆寫。請先匯出這頁的文法備份，再重新整理載入最新資料。');
    } else if (mounted.current) setStorageError('文法進度尚未成功儲存。你仍可練習，請先匯出文法備份，避免關閉頁面後遺失暫存進度。');
  }
  useEffect(() => {
    let active = true;
    mounted.current = true;
    loading.current = true;
    reportStorage();
    loadGrammarState().then((stored) => {
      if (!active) return;
      const validated = stored ? parseGrammarBackup(exportGrammarBackup(stored), questionIds) : null;
      persisted.current = validated;
      const initial = validated ?? createGrammarState();
      stateRef.current = initial;
      setState(initial);
    }).catch(() => {
      if (!active) return;
      readBlocked.current = true;
      saveFailed.current = true;
      persisted.current = undefined;
      const initial = createGrammarState();
      stateRef.current = initial;
      setState(initial);
      setStorageError('無法讀取原有文法進度，已暫停自動儲存以保護資料。請重新整理，或確認後匯入文法備份；暫時練習只保留在記憶體。');
    }).finally(() => {
      if (!active) return;
      loading.current = false;
      reportStorage();
    });
    const refresh = () => setNow(new Date());
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => { active = false; mounted.current = false; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  useEffect(() => {
    if (!practice) return;
    if (practice.phase === 'choose') optionsGroup.current?.querySelector('button')?.focus();
    else heading.current?.focus();
  }, [practice?.index, practice?.phase]);

  function commit(next: AppState) {
    stateRef.current = next;
    setState(next);
    if (readBlocked.current || saveFailed.current) { reportStorage(); return; }
    if (!persistenceRequested.current && navigator.storage?.persist) {
      persistenceRequested.current = true;
      void navigator.storage.persist().catch(() => {});
    }
    pending.current += 1;
    reportStorage();
    saveChain.current = saveChain.current.catch(() => {}).then(async () => {
      if (readBlocked.current || saveFailed.current) return;
      await saveGrammarState(next, persisted.current);
      persisted.current = next;
      if (mounted.current) setStorageError('');
    }).catch(showStorageFailure).finally(() => { pending.current -= 1; reportStorage(); });
  }
  function startPractice(ids?: string[]) {
    if (importInProgress.current) { setNotice('文法備份正在儲存，完成後即可練習。'); return; }
    if (!stateRef.current) return;
    const queue = ids ?? getGrammarPractice(stateRef.current, new Date());
    if (!queue.length) { setNotice('今天安排的文法題目已完成。可以查看解說自由練習，或稍後回來複習。'); return; }
    setPractice({ ids: [...queue], index: 0, phase: 'recall', answerId: null, results: [], mistakes: [], repeated: [], seed: crypto.getRandomValues(new Uint32Array(1))[0] });
    setSelectedPoint(null);
    setSummary(null);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function selectAnswer(answerId: string) {
    if (importInProgress.current) return;
    if (!practice || practice.phase !== 'choose' || practice.answerId !== null || !stateRef.current) return;
    const question = grammarQuestionMap.get(practice.ids[practice.index])!;
    const correct = question.answerId === answerId;
    const repeat = !correct && !practice.repeated.includes(question.id);
    commit(recordReview(stateRef.current, question.id, correct, correct ? 'good' : 'again', new Date()));
    setPractice({
      ...practice, answerId, phase: 'feedback', results: [...practice.results, correct],
      ids: repeat ? [...practice.ids, question.id] : practice.ids,
      repeated: repeat ? [...practice.repeated, question.id] : practice.repeated,
      mistakes: !correct && !practice.mistakes.includes(question.id) ? [...practice.mistakes, question.id] : practice.mistakes,
    });
  }
  function finishPractice() {
    if (!practice) return;
    setSummary({ total: practice.results.length, correct: practice.results.filter(Boolean).length, mistakes: practice.mistakes });
    setPractice(null);
    setNow(new Date());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function nextQuestion() {
    if (!practice || practice.phase !== 'feedback') return;
    if (practice.index + 1 >= practice.ids.length) { finishPractice(); return; }
    setPractice({ ...practice, index: practice.index + 1, phase: 'recall', answerId: null });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function downloadBackup() {
    if (!stateRef.current) return;
    const url = URL.createObjectURL(new Blob([exportGrammarBackup(stateRef.current)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kotoba-grammar-backup-${localDate()}.json`;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('文法備份已交給瀏覽器下載，請妥善保存。');
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    if (importInProgress.current) { event.target.value = ''; setNotice('文法備份正在儲存，請完成後再匯入。'); return; }
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('文法備份檔過大，請選擇小於 20 MB 的 JSON 檔。');
      const imported = parseGrammarBackup(await file.text(), questionIds);
      setPendingImport(imported);
      setBackupError('');
    } catch (error) { setBackupError(error instanceof Error ? error.message : '無法讀取文法備份。'); }
  }
  function confirmImport(imported: AppState) {
    if (importInProgress.current) return;
    importInProgress.current = true;
    setPractice(null);
    setPendingImport(null);
    stateRef.current = imported;
    setState(imported);
    setSummary(null);
    pending.current += 1;
    reportStorage();
    const allowFailedReadReplacement = readBlocked.current && persisted.current === undefined;
    saveChain.current = saveChain.current.catch(() => {}).then(async () => {
      // Explicit import can recover a failed initial read. Otherwise read a fresh
      // snapshot and still use CAS, so another tab cannot race the replacement.
      let expected: AppState | null | undefined;
      try { expected = await loadGrammarState(); }
      catch (error) { if (!allowFailedReadReplacement) throw error; }
      await saveGrammarState(imported, expected);
      persisted.current = imported;
      readBlocked.current = false;
      saveFailed.current = false;
      if (mounted.current) { setStorageError(''); setNotice('文法備份已匯入並儲存在這台裝置。'); }
    }).catch(showStorageFailure).finally(() => { importInProgress.current = false; pending.current -= 1; reportStorage(); });
  }

  if (!state) return <section className="grammar-page grammar-loading" aria-busy="true"><Flower2 size={28} /><p>正在打開你的文法手帖…</p></section>;
  const stats = grammarStats(state, now);
  const queue = getGrammarPractice(state, now);
  const filtered = grammarPoints.filter((point) => (category === '全部' || point.category === category) && (!search.trim() || `${point.pattern} ${plainSentence(parseFurigana(patternMarkup(point.pattern)))} ${point.meaning} ${point.category}`.includes(search.trim())));
  const current = practice ? grammarQuestionMap.get(practice.ids[practice.index])! : null;
  const point = current ? pointByQuestion.get(current.id)! : null;
  const options = current && practice ? shuffledOptions(current, practice.seed + practice.index + current.id.split('').reduce((sum, letter) => sum + letter.charCodeAt(0), 0)) : [];
  const selected = current?.options.find((option) => option.id === practice?.answerId);
  const correctOption = current?.options.find((option) => option.id === current.answerId);
  const correct = practice?.answerId === current?.answerId;
  const storageSafe = !storageError && !readBlocked.current && !saveFailed.current;

  return <section className="grammar-page" aria-label="文法練習內容">
    {storageError && <div className="grammar-storage-alert" role="alert"><ShieldCheck size={20} /><div><strong>文法進度需要留意</strong><p>{storageError}</p><button type="button" onClick={downloadBackup}>匯出目前文法備份<ArrowDownToLine size={15} /></button></div></div>}
    {notice && <div className="grammar-notice" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button type="button" className="grammar-icon-button" onClick={() => setNotice('')} aria-label="關閉文法通知"><X size={16} /></button></div>}

    {practice && current && point ? <div className="grammar-practice">
      <div className="grammar-practice-top"><button type="button" className="grammar-text-button" onClick={finishPractice}><ArrowLeft size={17} />結束文法練習</button><span>第 {practice.index + 1}／{practice.ids.length} 題</span></div>
      <div className="grammar-practice-progress" role="progressbar" aria-label="文法本輪進度" aria-valuenow={practice.index} aria-valuemin={0} aria-valuemax={practice.ids.length}><span style={{ width: `${practice.index / practice.ids.length * 100}%` }} /></div>
      <div className="grammar-practice-heading"><span className="grammar-eyebrow">PUT YOUR GRAMMAR INTO CONTEXT</span><h1>讀懂句子，也讀懂語氣。</h1><p><ShieldCheck size={14} />{storageSafe ? saving ? '正在儲存文法作答…' : '每次作答後，自動儲存文法進度' : '目前只暫存在記憶體，請先匯出文法備份'}</p></div>
      <article className="grammar-question-card">
        <div className="grammar-question-top"><span className="grammar-kind">{kinds[current.kind]}</span><button type="button" className="grammar-furigana" aria-label="顯示文法假名" aria-pressed={showFurigana} onClick={toggleFurigana}>{showFurigana && <Check size={14} />}假名</button></div>
        <h2 ref={heading} tabIndex={-1} className="grammar-question-instruction">{practice.phase === 'feedback' ? correct ? '答對了，理解又清楚了一點。' : '看看這個句子想表達什麼。' : current.instruction}</h2>
        <div className="grammar-question-context"><p lang="ja"><Japanese source={current.japanese} show={showFurigana} /></p>{current.translation && <span>{current.translation}</span>}</div>
        {practice.phase === 'recall' && <div className="grammar-recall"><Lightbulb size={18} /><p>先試著回想句意與接續，再看選項。</p><button type="button" className="grammar-button primary" onClick={() => setPractice({ ...practice, phase: 'choose' })}>想好了，看看文法選項<ArrowRight size={18} /></button></div>}
        {practice.phase !== 'recall' && <div ref={optionsGroup} className="grammar-options" role="group" aria-label="文法題目選項">{options.map((option, index) => {
          const isAnswer = option.id === current.answerId;
          const wasSelected = option.id === practice.answerId;
          return <button type="button" key={option.id} className={`grammar-option ${practice.phase === 'feedback' ? isAnswer ? 'correct' : wasSelected ? 'incorrect' : 'unselected' : ''}`} disabled={practice.phase === 'feedback'} onClick={() => selectAnswer(option.id)}><span className="grammar-option-marker" aria-hidden="true">{practice.phase === 'feedback' && isAnswer ? <Check size={17} /> : practice.phase === 'feedback' && wasSelected ? <X size={17} /> : index + 1}</span><span lang={current.optionLanguage}>{current.optionLanguage === 'ja' ? <Japanese source={option.text} show={showFurigana} /> : option.text}</span>{practice.phase === 'feedback' && (isAnswer || wasSelected) && <span className="grammar-option-result">{isAnswer ? '正確答案' : '你的選擇'}</span>}</button>;
        })}</div>}
        {practice.phase === 'feedback' && <section className="grammar-feedback" aria-label="文法作答解說"><div className="grammar-feedback-label"><BookOpen size={17} /><strong lang="ja"><Japanese source={patternMarkup(point.pattern)} show={showFurigana} /></strong><span>{point.meaning}</span></div><p>{current.explanation}</p>{!correct && selected && <div className="grammar-option-reason"><strong>你的選項</strong><p>{selected.explanation}</p></div>}{correctOption && <div className="grammar-option-reason"><strong>{correct ? '為什麼適合這裡' : '正確選項'}</strong><p>{correctOption.explanation}</p></div>}<p className="grammar-review-hint">{correct ? '這次理解已記錄；跨日、到期後再答對，才會逐步延長複習間隔。' : practice.ids.slice(practice.index + 1).includes(current.id) ? '這題已排入本輪加練；每題最多加練一次，也會保留待複習紀錄。' : '這題會保留待複習紀錄，稍後再回來看看。'}</p><button type="button" className="grammar-button primary" onClick={nextQuestion}>{practice.index + 1 >= practice.ids.length ? '完成這輪文法' : '下一題文法'}<ArrowRight size={18} /></button></section>}
      </article>
      <p className="grammar-session-note">選項順序會變換。錯題在本輪最多再練一次；提前結束也會保留已完成的作答。</p>
    </div> : <>
      <header className="grammar-intro"><div><span className="grammar-eyebrow">A LITTLE GRAMMAR, A CLEARER WORLD</span><h1>文法練習<span>。</span></h1><p>不只記住接續，也聽懂一句話背後的意思。</p></div><div className="grammar-library-count"><strong>{grammarPoints.length}</strong><span>個文法・{grammarQuestions.length} 題練習</span></div></header>
      {summary && <section className="grammar-summary" role="status"><CheckCircle2 size={25} /><div><h2>{summary.total ? '這一輪，又多理解了一點。' : '隨時都能從這裡繼續。'}</h2><p>完成 {summary.total} 題，答對 {summary.correct} 題。{storageSafe ? saving ? '進度正在儲存。' : '已完成的作答已保留。' : '進度暫存於記憶體，請先匯出備份。'}</p>{summary.mistakes.length > 0 && <button type="button" className="grammar-text-button" onClick={() => startPractice(summary.mistakes)}>再練這輪錯題<RefreshCw size={15} /></button>}</div><button type="button" className="grammar-icon-button" onClick={() => setSummary(null)} aria-label="關閉文法練習摘要"><X size={18} /></button></section>}
      <div className="grammar-top-grid"><section className="grammar-today-card"><div className="grammar-today-label"><Sparkles size={17} /><span>文法，每天留一點時間</span><span className="grammar-time"><Clock3 size={14} />約 5 分鐘</span></div><h2>把知道的文法，<br />練成讀得懂的句子。</h2><p>先安排最多 6 題，先複習，再接觸新題。<br />答錯的題目會在這輪加練一次。</p><button type="button" className="grammar-button primary" onClick={() => startPractice()}>開始文法練習<ArrowRight size={18} /></button><span className="grammar-today-foot">{queue.length ? `目前安排 ${queue.length} 題` : '今日安排已完成，也可以自由選一課練習'} · 不增加單字的新詞份量</span></section><section className="grammar-progress-card" aria-label="文法學習進度"><h2><Flower2 size={20} />理解，也需要慢慢累積</h2><div className="grammar-metrics"><div><strong>{stats.practicedPoints}<small> / {stats.totalPoints}</small></strong><span>已練習文法</span></div><div><strong>{stats.dueQuestions}<small> 題</small></strong><span>待複習題目</span></div><div><strong>{stats.familiarPoints}<small> 個</small></strong><span>較熟悉文法</span></div><div><strong>{stats.todayAnswers}<small> 次</small></strong><span>今日文法作答</span></div></div><p>一課中至少作答一題，就列為「已練習」；三種題目都經過跨日複習，才會逐步變得熟悉。</p></section></div>
      <div className="grammar-library-heading"><div><span className="grammar-eyebrow">YOUR GRAMMAR NOTEBOOK</span><h2>從一句話，找到理解的線索</h2></div><span>{filtered.length} 個文法</span></div>
      <label className="grammar-search"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="搜尋文法" placeholder="搜尋文法、中文意思或分類" />{search && <button type="button" className="grammar-icon-button" aria-label="清除文法搜尋" onClick={() => setSearch('')}><X size={16} /></button>}</label>
      <div className="grammar-filters" role="group" aria-label="文法分類">{['全部', ...grammarCategories].map((item) => <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {filtered.length ? <div className="grammar-card-grid">{filtered.map((item) => {
        const attempted = item.questions.filter((question) => Boolean(state.progress[question.id])).length;
        const familiar = item.questions.every((question) => isFamiliar(state.progress[question.id]));
        return <button type="button" className="grammar-card" key={item.id} data-grammar-id={item.id} onClick={() => setSelectedPoint(item)}><span className="grammar-card-category">{item.category}</span><h3 lang="ja"><Japanese source={patternMarkup(item.pattern)} show={showFurigana} /></h3><p>{item.meaning}</p><div className="grammar-card-bottom"><span className={familiar ? 'familiar' : ''}>{familiar ? '較熟悉' : attempted ? `已練習 ${attempted} / 3 題` : '還沒開始'}</span><ChevronRight size={17} /></div></button>;
      })}</div> : <div className="grammar-empty"><Search size={25} /><h3>還沒有找到這個文法</h3><p>試試其他字詞，或回到完整的文法手帖。</p><button type="button" className="grammar-text-button" onClick={() => { setSearch(''); setCategory('全部'); }}>顯示全部文法<ArrowRight size={16} /></button></div>}
      <section className="grammar-backup" aria-label="文法進度備份"><div><h2><ShieldCheck size={20} />文法進度備份</h2><p>文法與單字分別記錄。這裡備份文法作答與複習排程，單字備份仍在「學習設定」。</p><span className={`grammar-save-status ${storageError ? 'needs-attention' : ''}`}><span />{storageError ? '文法儲存需要留意' : saving ? '正在儲存文法進度…' : '文法進度使用本機儲存'}</span></div><div className="grammar-backup-actions"><button type="button" className="grammar-button secondary" onClick={downloadBackup}><ArrowDownToLine size={17} />匯出文法備份</button><button type="button" className="grammar-button secondary" onClick={() => input.current?.click()}><ArrowUpFromLine size={17} />匯入文法備份</button></div><input ref={input} type="file" className="visually-hidden" accept="application/json,.json" aria-label="選擇文法備份檔" onChange={(event) => { void importBackup(event); }} />{backupError && <p className="grammar-backup-error" role="alert">{backupError}</p>}<p className="grammar-backup-footnote"><CircleHelp size={16} />進度只在目前瀏覽器，不會自動同步。清除網站資料前，請分別保存文法與單字備份。</p></section>
      <p className="grammar-content-note">N3 是學習目標，部分內容用於銜接 N4。例句與題目為本專案編寫，已交叉檢查，尚未經日語教師全面審訂。<a href="https://github.com/ty11-prog/japanese/blob/main/docs/grammar-content.md" target="_blank" rel="noreferrer">內容與學習方式</a></p>
    </>}

    {selectedPoint && <GrammarDialog title="文法說明" onClose={() => setSelectedPoint(null)}><article className="grammar-detail"><span className="grammar-card-category">{selectedPoint.category}</span><h3 lang="ja"><Japanese source={patternMarkup(selectedPoint.pattern)} show={showFurigana} /></h3><p className="grammar-detail-meaning">{selectedPoint.meaning}</p><section className="grammar-detail-section"><h4>怎麼接續</h4><ul>{selectedPoint.connection.map((connection) => <li key={connection}>{connection}</li>)}</ul></section><section className="grammar-detail-section"><h4>什麼時候用</h4><p>{selectedPoint.explanation}</p></section><div className="grammar-examples-heading"><h4>放進句子裡</h4><button type="button" className="grammar-furigana" aria-label="顯示文法假名" aria-pressed={showFurigana} onClick={toggleFurigana}>{showFurigana && <Check size={14} />}假名</button></div><div className="grammar-examples">{selectedPoint.examples.map((example, index) => <section className="grammar-example" key={example.japanese} aria-label={`文法例句 ${index + 1}`}><p lang="ja"><Japanese source={example.japanese} show={showFurigana} /></p><span>{example.translation}</span><div><button type="button" className="grammar-text-button" aria-label={`播放例句：文法例句 ${index + 1}`} onClick={() => speak(plainSentence(parseFurigana(example.japanese)))}><Volume2 size={16} />播放例句</button><button type="button" className="grammar-text-button" aria-label={`慢速播放文法例句 ${index + 1}`} onClick={() => speak(plainSentence(parseFurigana(example.japanese)), 0.8)}>慢速播放</button></div></section>)}</div><aside className="grammar-caution"><Lightbulb size={18} /><div><h4>容易混淆的地方</h4><p>{selectedPoint.caution}</p></div></aside><button type="button" className="grammar-button primary" onClick={() => startPractice(selectedPoint.questions.map((question) => question.id))}>練習這個文法<ArrowRight size={18} /></button><p className="grammar-detail-footnote">3 種題目，分別練習句意、接續與語境。自由練習的新題也會計入今日的新題數。</p></article></GrammarDialog>}
    {pendingImport && <GrammarDialog title="匯入文法備份前，先確認" onClose={() => setPendingImport(null)}><div className="grammar-import-preview"><ArrowUpFromLine size={28} /><h3>這份備份包含 {Object.keys(pendingImport.progress).length} 個已作答題目</h3><p>{pendingImport.reviews.length} 次文法作答 · 更新於 {new Date(pendingImport.updatedAt).toLocaleString('zh-TW')}</p></div><p className="grammar-import-warning">匯入會取代這台裝置目前的文法進度與排程，無法自動合併。單字進度不會被取代。建議先匯出目前的文法備份。</p><div className="grammar-import-actions"><button type="button" className="grammar-button secondary" onClick={downloadBackup}>先匯出目前文法進度</button><button type="button" className="grammar-button primary" onClick={() => confirmImport(pendingImport)}>確認取代文法進度</button></div></GrammarDialog>}
  </section>;
}
