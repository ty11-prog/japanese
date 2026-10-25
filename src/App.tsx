import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpFromLine, AudioLines,
  BookOpen, BriefcaseBusiness, Check, CheckCircle2, ChevronRight, CircleHelp,
  CloudOff, Download, Flame, Flower2, Headphones, Heart,
  House, Leaf, Lightbulb, MoreHorizontal, RefreshCw, Search,
  Settings2, ShieldCheck, Sparkles, Sprout, TrendingUp, Volume2, WifiOff, X,
} from 'lucide-react';
import { vocabulary, type Word } from './data/vocabulary';
import { createInitialState, getStats, getStudyPlan, recordReview, updateSettings, type AppState, type Rating } from './lib/learning';
import { exportBackup, loadState, parseBackup, saveState, StorageConflictError } from './lib/storage';

type Tab = 'home' | 'words' | 'progress' | 'settings';
type Mode = 'mixed' | 'listening';
type Session = { ids: string[]; index: number; mode: Mode; results: boolean[]; repeated: string[]; seed: number };
const wordIds = vocabulary.map((word) => word.id);
const wordMap = new Map(vocabulary.map((word) => [word.id, word]));
const categories = ['日常生活', '工作學習', '情緒人際', '社會資訊', '動作表達'] as const;
const categoryIcons = [House, BriefcaseBusiness, Heart, BookOpen, AudioLines];
const categoryDescriptions = ['把日子過成日文', '每一次進步，都算數', '說出心裡的那句話', '看懂更大的世界', '讓表達更自然'];
const tabs: { id: Tab; label: string; icon: typeof House }[] = [
  { id: 'home', label: '今日學習', icon: House },
  { id: 'words', label: '單字手帖', icon: BookOpen },
  { id: 'progress', label: '學習足跡', icon: TrendingUp },
  { id: 'settings', label: '學習設定', icon: Settings2 },
];

function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function readableDate(value: string) {
  return new Date(value).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
}
function dayLabel(date: Date) {
  return date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' });
}
function isFamiliar(state: AppState, id: string) {
  const item = state.progress[id];
  return Boolean(item && item.intervalDays >= 7 && item.correctStreak >= 3);
}
function wordStatus(state: AppState, id: string) {
  const item = state.progress[id];
  if (!item) return '未開始';
  if (isFamiliar(state, id)) return '較熟悉';
  return '學習中';
}
function nextInterval(state: AppState, id: string, correct: boolean, rating: Rating, now: Date) {
  const next = recordReview(state, id, correct, rating, now).progress[id];
  const minutes = Math.round((new Date(next.dueAt).getTime() - now.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} 分鐘後`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} 小時後`;
  return `${Math.round(minutes / 1440)} 天後`;
}

function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', update); window.speechSynthesis.cancel(); };
  }, []);
  const japaneseVoices = voices.filter((item) => /^ja(?:-|_)/i.test(item.lang));
  const voice = japaneseVoices.find((item) => item.localService) ?? japaneseVoices[0];
  const available = Boolean(voice);
  function speak(text: string, onError?: () => void) {
    if (!voice) { onError?.(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); onError?.(); };
    window.speechSynthesis.speak(utterance);
  }
  return { available, speaking, speak, localVoice: Boolean(voice?.localService) };
}

function Ring({ value, total, size = 126, children }: { value: number; total: number; size?: number; children: ReactNode }) {
  const radius = 49;
  const length = 2 * Math.PI * radius;
  return <div className="ring" style={{ width: size, height: size }}>
    <svg viewBox="0 0 112 112" aria-hidden="true"><circle className="ring-track" cx="56" cy="56" r={radius} /><circle className="ring-value" cx="56" cy="56" r={radius} strokeDasharray={length} strokeDashoffset={length * (1 - Math.min(1, value / Math.max(1, total)))} /></svg>
    <div className="ring-content">{children}</div>
  </div>;
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [storageError, setStorageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [now, setNow] = useState(new Date());
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<{ total: number; correct: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [category, setCategory] = useState('全部');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [installPrompt, setInstallPrompt] = useState<(Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [backupError, setBackupError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const saveChain = useRef(Promise.resolve());
  const readBlocked = useRef(false);
  const pendingSaves = useRef(0);
  const lastPersistedState = useRef<AppState | null | undefined>(null);
  const saveFailed = useRef(false);
  const persistRequested = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const speech = useSpeech();
  const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError() { setToast('離線功能尚未準備好；你仍可在線上學習。'); },
  });

  useEffect(() => {
    let active = true;
    loadState().then((stored) => { if (active) { const validated = stored ? parseBackup(exportBackup(stored), wordIds) : null; lastPersistedState.current = validated; setState(validated ?? createInitialState()); } }).catch(() => {
      if (active) { readBlocked.current = true; saveFailed.current = true; lastPersistedState.current = undefined; setStorageError('無法讀取原有資料，已暫停自動儲存以保護進度。請重新整理，或明確匯入備份；暫時練習的資料只留在記憶體。'); setState(createInitialState()); }
    });
    const refresh = () => { setNow(new Date()); setOnline(navigator.onLine); };
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as typeof installPrompt); };
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    const timer = window.setInterval(refresh, 30000);
    return () => { active = false; clearInterval(timer); window.removeEventListener('online', refresh); window.removeEventListener('offline', refresh); window.removeEventListener('focus', refresh); window.removeEventListener('beforeinstallprompt', beforeInstall); };
  }, []);

  useEffect(() => {
    if (!selectedWord && !pendingImport && !showInstallHelp && !showSources) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSelectedWord(null); setPendingImport(null); setShowInstallHelp(false); setShowSources(false); }
      if (event.key === 'Tab') {
        const dialog = document.querySelector('[role="dialog"]');
        const focusable = dialog?.querySelectorAll<HTMLElement>('button, a[href], input, select, [tabindex="0"]');
        if (!focusable?.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const focusTimer = window.setTimeout(() => document.querySelector<HTMLElement>('[role="dialog"] button')?.focus(), 0);
    document.addEventListener('keydown', onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(focusTimer); document.removeEventListener('keydown', onKey); document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, [selectedWord, pendingImport, showInstallHelp, showSources]);

  function notify(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4500);
  }
  function commit(next: AppState) {
    setState(next);
    if (readBlocked.current) return;
    if (!persistRequested.current && navigator.storage?.persist) {
      persistRequested.current = true;
      void navigator.storage.persist().catch(() => {});
    }
    pendingSaves.current += 1;
    setSaving(true);
    saveChain.current = saveChain.current.catch(() => {}).then(async () => {
      if (readBlocked.current) return;
      await saveState(next, lastPersistedState.current);
      lastPersistedState.current = next;
      saveFailed.current = false;
      setStorageError('');
    }).catch((error: unknown) => {
      saveFailed.current = true;
      if (error instanceof StorageConflictError) {
        readBlocked.current = true;
        setStorageError('另一個分頁已更新進度，已停止覆寫。請先匯出這頁的暫存備份，再重新整理讀取最新資料。');
      } else setStorageError('進度尚未成功寫入這台裝置。請先匯出備份，避免關閉頁面後遺失。');
    }).finally(() => { pendingSaves.current -= 1; setSaving(pendingSaves.current > 0); });
  }
  function navigate(next: Tab) { setTab(next); setSummary(null); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function startSession(mode: Mode = 'mixed', customIds?: string[]) {
    if (!state) return;
    if (mode === 'listening' && !speech.available) { notify('這台裝置尚未提供日文語音。請在 Chrome／系統的文字轉語音設定安裝日文語音。'); return; }
    const queue = customIds ?? getStudyPlan(state, wordIds, new Date()).queue;
    if (!queue.length) { notify('今天的安排已完成！可以逛逛單字手帖，或稍後回來複習。'); return; }
    setSession({ ids: queue, index: 0, mode, results: [], repeated: [], seed: crypto.getRandomValues(new Uint32Array(1))[0] });
    setSummary(null); setSelectedWord(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function finishSession(results: boolean[]) {
    setSession(null); setSummary({ total: results.length, correct: results.filter(Boolean).length }); setTab('home'); setNow(new Date());
  }
  function downloadBackup() {
    if (!state) return;
    const blob = new Blob([exportBackup(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `kotoba-backup-${localDay()}.json`;
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('備份檔已交給瀏覽器下載，請妥善保存。');
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('備份檔過大，請選擇小於 20 MB 的 JSON 檔。');
      const imported = parseBackup(await file.text(), wordIds);
      setPendingImport(imported); setBackupError('');
    } catch (error) { setBackupError(error instanceof Error ? error.message : '無法讀取備份檔。'); }
  }
  function speakWord(text: string) { speech.speak(text, () => notify('目前無法播放日文發音；請確認系統已安裝日文語音，並檢查網路。')); }
  async function install() {
    if (!installPrompt) { setShowInstallHelp(true); return; }
    try { await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); } catch { setShowInstallHelp(true); }
  }

  if (!state) return <div className="loading-screen"><div className="brand-mark"><Sprout size={28} /></div><p>正在打開你的單字手帖…</p></div>;
  const stats = getStats(state, wordIds, now);
  const plan = getStudyPlan(state, wordIds, now);
  const studiedToday = new Set(state.reviews.filter((review) => localDay(new Date(review.reviewedAt)) === localDay(now)).map((review) => review.wordId)).size;
  const todayTarget = Math.max(studiedToday, studiedToday + plan.queue.length, 1);
  const todayDone = plan.queue.length === 0;
  const nextTodayReview = Object.values(state.progress).filter((item) => new Date(item.dueAt) > now && localDay(new Date(item.dueAt)) === localDay(now)).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
  const featured = vocabulary.find((word) => word.word === '続ける') ?? vocabulary[0];
  const filteredWords = vocabulary.filter((word) => (category === '全部' || word.category === category) && (statusFilter === '全部' || wordStatus(state, word.id) === statusFilter) && (!search || `${word.word} ${word.reading} ${word.meaning} ${word.collocation}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())));

  return <>
    <a className="skip-link" href="#main-content">跳到主要內容</a>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={() => { if (session) finishSession(session.results); navigate('home'); }} aria-label="言葉の庭 KOTOBA NO NIWA，回到今日學習">
        <span className="brand-mark"><Sprout size={24} strokeWidth={1.6} /></span><span className="brand-wordmark" lang="ja">言葉<span className="brand-no">の</span>庭<small>KOTOBA NO NIWA</small></span>
      </button>
      <nav className="desktop-nav" aria-label="主要導覽">{tabs.map(({ id, label }) => <button key={id} className={tab === id && !session ? 'active' : ''} onClick={() => { if (session) finishSession(session.results); navigate(id); }} aria-current={tab === id && !session ? 'page' : undefined}>{label}</button>)}</nav>
      <div className="header-meta"><span className="level-badge">JLPT N3</span><span className="avatar" role="img" aria-label="個人學習空間"><Flower2 size={21} strokeWidth={1.5} /></span></div>
    </div></header>

    <main id="main-content" className={`main-container ${session ? 'session-container' : ''}`}>
      {storageError && <div className="alert warning" role="alert"><ShieldCheck size={19} /><span>{storageError}</span><button onClick={downloadBackup}>匯出備份</button></div>}
      {!online && <div className="offline-indicator"><WifiOff size={14} />離線學習中 · 進度會儲存在這台裝置</div>}
      {needRefresh && !session && <div className="alert"><RefreshCw size={18} /><span>{storageError ? '新版本已準備好。請先處理儲存問題並匯出備份，再更新。' : '新版本已準備好，儲存完成後即可更新。'}</span><button disabled={Boolean(storageError) || saving} onClick={() => { void saveChain.current.then(() => { if (readBlocked.current || saveFailed.current) { notify('目前有未寫入的進度，請先匯出備份。'); return; } void updateServiceWorker(true); }); }}>更新網站</button></div>}

      {session ? <StudySession key={`${session.mode}-${session.ids[0]}`} session={session} state={state} commit={commit} onChange={setSession} onFinish={finishSession} speak={speakWord} speechAvailable={speech.available} storageSafe={!storageError} /> : <>
        {tab === 'home' && <>
          <div className="page-eyebrow"><span className="little-dot" />給自己的 15 分鐘<span className="date-label">{dayLabel(now)}</span></div>
          <section className="home-hero">
            <div className="hero-copy"><div className="eyebrow">A LITTLE EVERY DAY, A LITTLE CLOSER.</div><h1>讓日文，<br />慢慢成為<span className="title-emphasis">你的日常<svg viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3 8 Q112 -1 237 6" /></svg></span>。</h1><p>不用一次記住所有。<br className="mobile-break" />從今天的幾個單字，累積真正記得的日文。</p><div className="hero-tags"><span><Sprout size={15} />間隔複習</span><span><Lightbulb size={15} />主動回想</span><span><BookOpen size={15} />情境學習</span></div></div>
            <div className="hero-art" aria-hidden="true"><div className="art-circle" /><span className="art-kana" lang="ja">こつこつ、<br />少しずつ。</span><div className="floating-card"><div className="floating-card-top"><span>今日のひとこと</span><Leaf size={18} /></div><span className="floating-reading" lang="ja">{featured.reading}</span><strong lang="ja">{featured.word}</strong><div className="floating-line" /><span className="floating-meaning">{featured.meaning}</span><span className="floating-example" lang="ja">小さな一歩を、毎日。</span></div><span className="art-spark one">✳</span><span className="art-spark two">＋</span><div className="art-caption">小小的累積，也是一種前進。</div></div>
          </section>

          {summary && <section className="session-summary" role="status"><div className="summary-icon"><CheckCircle2 size={26} /></div><div><h2>{summary.total ? '今天又往前了一點。' : '休息一下，隨時都能接著學。'}</h2><p>{summary.total ? `這輪完成 ${summary.total} 次練習，答對 ${summary.correct} 次。進度已排入下次複習。` : '已完成作答的進度會保留在這台裝置。'}</p></div><button className="icon-button" onClick={() => setSummary(null)} aria-label="關閉練習摘要"><X size={18} /></button></section>}

          <div className="section-heading"><h2>今天，從這裡開始</h2><span className="subtle-note">按自己的步調就好</span></div>
          <section className="today-grid" aria-label="今日學習安排">
            <div className="today-card"><div className="card-topline"><span className="section-kicker"><span className="tiny-flower">✳</span> 今日學習計畫</span><span className="pill neutral">約 {state.settings.dailyMinutes} 分鐘</span></div>
              <div className="today-main"><div><h3>{todayDone ? '今天的份，完成了！' : stats.seen ? '歡迎回來，接著累積。' : '你的日文小習慣，從今天開始。'}</h3><p>{todayDone ? nextTodayReview ? `先休息一下，${new Date(nextTodayReview.dueAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 再來複習。` : '目前沒有到期的單字，給記憶一點時間。' : '先喚醒記憶，再認識新單字。'}</p><div className="plan-metrics"><div><strong>{plan.due.length}<span>詞</span></strong><span><span className="metric-dot amber" />待複習</span></div><span className="metric-divider" /><div><strong>{plan.newWords.length}<span>詞</span></strong><span><span className="metric-dot green" />新單字</span></div></div></div><Ring value={studiedToday} total={todayTarget}><strong>{studiedToday}<span> / {todayTarget}</span></strong><small>今日已練習</small></Ring></div>
              <button className="button primary start-button" onClick={() => todayDone ? navigate('words') : startSession()}>{todayDone ? '逛逛單字手帖' : stats.seen ? '繼續今日學習' : '開始今日學習'}<ArrowRight size={18} /></button>
              <div className="card-footnote"><ShieldCheck size={13} />{saving ? '正在儲存進度…' : storageError ? '請留意上方儲存提示' : '免登入 · 進度儲存在這台裝置'}</div>
            </div>
            <div className="learning-side"><div className="mini-stats"><div><span className="stat-icon orange"><Flame size={19} /></span><div><strong>{stats.streak}<small> 天</small></strong><span>連續學習</span></div></div><span className="mini-divider" /><div><span className="stat-icon sage"><Sprout size={19} /></span><div><strong>{stats.seen}<small> / 100</small></strong><span>已接觸單字</span></div></div></div>
              <div className="listening-card"><div className="listening-icon"><Headphones size={25} strokeWidth={1.6} /></div><span className="section-kicker">換個方式，記得更牢</span><h3>用耳朵，認識單字。</h3><p>聽見日文，再找出對應的單字。<br />讓記憶多一條回家的路。</p><button className="text-button" onClick={() => startSession('listening')}>開始聽音練習<ArrowRight size={16} /></button><small>{speech.available ? speech.localVoice ? '使用裝置日文語音，可離線發音' : '使用系統日文語音，可能需要連線' : '需裝置提供日文文字轉語音'}</small></div>
            </div>
          </section>

          <section className="topics-section"><div className="section-heading"><h2>把單字，放進生活裡</h2><button className="text-button muted" onClick={() => { setCategory('全部'); navigate('words'); }}>全部 100 詞<ArrowRight size={15} /></button></div><div className="topic-grid">{categories.map((item, index) => {
            const Icon = categoryIcons[index]; const words = vocabulary.filter((word) => word.category === item); const learned = words.filter((word) => state.progress[word.id]).length;
            return <button className={`topic-card topic-${index}`} key={item} onClick={() => { setCategory(item); navigate('words'); }}><span className="topic-icon"><Icon size={22} strokeWidth={1.5} /></span><h3>{item}</h3><p>{categoryDescriptions[index]}</p><div className="topic-progress"><span style={{ width: `${learned / words.length * 100}%` }} /></div><div className="topic-bottom"><span>{learned} / {words.length} 詞已接觸</span><ArrowRight size={15} /></div></button>;
          })}</div></section>
          <div className="learning-tip"><span className="tip-icon"><Lightbulb size={20} /></span><p><strong>記不住，也是學習的一部分。</strong>先試著回想，再看答案，比反覆閱讀更能幫助記憶。</p><span className="tip-ja" lang="ja">焦らず、一歩ずつ。</span></div>
        </>}

        {tab === 'words' && <>
          <PageIntro eyebrow="YOUR POCKET VOCABULARY" title="單字手帖" description="在生活的語境裡，認識每一個單字。" right={<span className="count-badge">100 <small>個代表性 N3 詞彙</small></span>} />
          <div className="vocabulary-toolbar"><label className="search-field"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜尋日文、假名或中文意思" aria-label="搜尋單字" />{search && <button className="icon-button" onClick={() => setSearch('')} aria-label="清除搜尋"><X size={16} /></button>}</label><label className="status-select"><span>學習狀態</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="篩選學習狀態">{['全部', '未開始', '學習中', '較熟悉'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
          <div className="filter-chips" aria-label="詞彙分類">{['全部', ...categories].map((item) => <button key={item} className={category === item ? 'chip active' : 'chip'} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div>
          <div className="word-list-meta"><span>共 {filteredWords.length} 個單字</span><span>點選單字，看看它怎麼用</span></div>
          <div className="word-list">{filteredWords.map((word) => <button className="word-row" key={word.id} onClick={() => setSelectedWord(word)}><span className="word-main"><strong lang="ja">{word.word}</strong><span lang="ja">{word.reading}</span></span><span className="word-definition"><span className="part-of-speech">{word.partOfSpeech}</span>{word.meaning}</span><span className={`word-status ${wordStatus(state, word.id) === '較熟悉' ? 'familiar' : state.progress[word.id] ? 'learning' : ''}`}>{wordStatus(state, word.id)}</span><ChevronRight className="row-chevron" size={18} /></button>)}</div>
          {!filteredWords.length && <div className="empty-state"><Search size={32} /><h3>還沒有找到這個單字</h3><p>試試另一種寫法，或切換分類。</p><button className="button secondary" onClick={() => { setSearch(''); setCategory('全部'); setStatusFilter('全部'); }}>顯示全部單字</button></div>}
          <p className="content-note">N3 程度為選詞參考，並非官方完整詞表。<button className="inline-link" onClick={() => setShowSources(true)}>關於詞彙內容</button></p>
        </>}

        {tab === 'progress' && <>
          <PageIntro eyebrow="SMALL STEPS, REAL PROGRESS" title="學習足跡" description="每一次想起來，都是記憶扎根的時候。" />
          <div className="progress-stats">{[{ icon: BookOpen, value: stats.seen, label: '已接觸的單字', suffix: ' / 100' }, { icon: Sprout, value: stats.mastered, label: '較熟悉的單字', suffix: ' 詞' }, { icon: Flame, value: stats.streak, label: '連續學習', suffix: ' 天' }, { icon: CheckCircle2, value: stats.todayReviews, label: '今日練習次數', suffix: ' 次' }].map(({ icon: Icon, value, label, suffix }) => <div className="progress-stat" key={label}><Icon size={21} /><strong>{value}<small>{suffix}</small></strong><span>{label}</span></div>)}</div>
          <div className="progress-grid"><section className="surface weekly-card"><div className="section-heading"><h2>這一週的累積</h2><span className="subtle-note">練習次數</span></div><div className="weekly-chart" aria-label="最近七天的練習次數">{Array.from({ length: 7 }, (_, index) => {
            const date = new Date(now); date.setDate(date.getDate() - 6 + index); const count = state.reviews.filter((review) => localDay(new Date(review.reviewedAt)) === localDay(date)).length; const max = Math.max(8, ...Array.from({ length: 7 }, (_, d) => { const day = new Date(now); day.setDate(day.getDate() - d); return state.reviews.filter((r) => localDay(new Date(r.reviewedAt)) === localDay(day)).length; }));
            return <div className={`chart-column ${index === 6 ? 'today' : ''}`} key={index} aria-label={`${readableDate(date.toISOString())} ${count} 次`}><span className="chart-count">{count}</span><div className="bar-track"><div className="bar-fill" style={{ height: `${count / max * 100}%`, minHeight: count ? 7 : 3 }} /></div><span>{index === 6 ? '今天' : date.toLocaleDateString('zh-TW', { weekday: 'short' }).replace('週', '')}</span></div>;
          })}</div></section><section className="surface memory-card"><span className="section-kicker">記憶需要時間，也需要重逢</span><h2>慢慢熟悉，<br />不急著全部記住。</h2><div className="memory-legend"><span><i className="legend-dot indigo" />較熟悉<strong>{stats.mastered}</strong></span><span><i className="legend-dot sage" />學習中<strong>{stats.seen - stats.mastered}</strong></span><span><i className="legend-dot beige" />未開始<strong>{100 - stats.seen}</strong></span></div><div className="memory-bar"><span style={{ width: `${stats.mastered}%` }} /><span style={{ width: `${stats.seen - stats.mastered}%` }} /></div><p>至少連續答對 3 次，且複習間隔達 7 天，才標記為較熟悉；仍會安排後續複習。</p></section></div>
          <section className="surface review-section"><div className="section-heading"><h2>值得再見一次的單字</h2><span className="subtle-note">答錯或想再練的詞</span></div>{vocabulary.filter((word) => state.progress[word.id]?.lapses > 0).length ? <div className="review-word-grid">{vocabulary.filter((word) => state.progress[word.id]?.lapses > 0).slice(0, 12).map((word) => <button className="review-word" key={word.id} onClick={() => setSelectedWord(word)}><span lang="ja">{word.word}</span><small>{word.meaning}</small><ChevronRight size={16} /></button>)}</div> : <div className="gentle-empty"><Flower2 size={31} /><p>{stats.seen ? '這裡會收集曾經答錯的詞，陪你慢慢熟悉。' : '開始第一輪練習，讓你的足跡從這裡長出來。'}</p><button className="text-button" onClick={() => startSession()}>開始今日學習<ArrowRight size={16} /></button></div>}</section>
        </>}

        {tab === 'settings' && <>
          <PageIntro eyebrow="MAKE ROOM FOR A LITTLE JAPANESE" title="學習設定" description="找到適合你的節奏，讓學習走得更久。" />
          <div className="settings-grid"><section className="surface settings-card"><div className="settings-title"><Settings2 size={20} /><h2>每天的學習份量</h2></div><p>每天先複習，再認識新詞。待複習較多時，可以減少新詞。</p><label className="field-label" htmlFor="daily-limit">每日新單字上限</label><div className="goal-options" id="daily-limit" role="group" aria-label="每日新單字上限">{[4, 8, 12].map((value) => <button key={value} className={state.settings.dailyNewLimit === value ? 'goal-option active' : 'goal-option'} aria-pressed={state.settings.dailyNewLimit === value} onClick={() => { commit(updateSettings(state, { dailyNewLimit: value })); notify(`每日新詞上限已設為 ${value} 詞。`); }}><strong>{value}<small> 詞</small></strong><span>{value === 4 ? '輕鬆開始' : value === 8 ? '穩穩累積' : '多一點挑戰'}</span>{state.settings.dailyNewLimit === value && <CheckCircle2 size={15} />}</button>)}</div><div className="settings-note"><Lightbulb size={17} /><span>以每天約 15 分鐘為起點；複習次數和花費時間會因記憶狀況而不同。</span></div></section>
          <section className="surface settings-card backup-card"><div className="settings-title"><ShieldCheck size={20} /><h2>這台裝置，就是你的手帖</h2></div><p>進度使用 IndexedDB 自動儲存在目前瀏覽器，不需要帳號。關閉網頁後仍會保留。</p><div className="save-status"><span className={`little-dot ${storageError ? 'error' : ''}`} />{storageError ? '儲存需要留意，請先備份' : saving ? '正在儲存…' : '本機儲存可用'}<span>沒有雲端同步</span></div><div className="backup-buttons"><button className="button secondary" onClick={downloadBackup}><ArrowDownToLine size={17} />匯出進度備份</button><button className="button secondary" onClick={() => fileInput.current?.click()}><ArrowUpFromLine size={17} />匯入備份</button></div><input ref={fileInput} type="file" accept="application/json,.json" onChange={(event) => { void importBackup(event); }} className="visually-hidden" aria-label="選擇進度備份檔" />{backupError && <p className="error-message" role="alert">{backupError}</p>}<div className="settings-note"><CircleHelp size={17} /><span>清除網站資料、無痕瀏覽、換瀏覽器或更換網址，可能無法保留原進度。建議定期匯出 JSON，放在手機或個人雲端空間。</span></div></section>
          <section className="surface settings-card"><div className="settings-title"><Download size={20} /><h2>讓學習更順手</h2></div><p>把言葉の庭加入手機主畫面。首次載入並完成快取後，主要學習功能可離線使用。</p><button className="button secondary" onClick={() => { void install(); }}><Download size={17} />安裝／加入主畫面</button><div className="settings-note"><CloudOff size={17} /><span>{offlineReady || navigator.serviceWorker?.controller ? '網站資源已可離線使用。發音仍取決於裝置的日文語音。' : '離線資源會在正式版本首次連線載入時下載。'} 安裝功能需要 HTTPS。</span></div></section>
          <section className="surface settings-card"><div className="settings-title"><Headphones size={20} /><h2>日文發音</h2></div><p>使用裝置內建的日文文字轉語音，播放速度稍慢，方便聽清楚每個音。</p><button className="button secondary" onClick={() => speakWord('毎日、少しずつ日本語を勉強します。')}><Volume2 size={17} />測試日文發音</button><div className="settings-note"><CircleHelp size={17} /><span>{speech.available ? speech.localVoice ? '已找到裝置上的日文語音，可離線發音。' : '已找到日文語音；播放可能需要網路。' : '尚未找到日文語音。Android 可在「文字轉語音輸出」安裝日文語音；iPhone 請檢查系統語音設定。'} 此功能是合成語音，並非真人錄音。</span></div></section></div>
          <p className="content-note">首版 · 100 詞 · 不追蹤、不要求登入。<button className="inline-link" onClick={() => setShowSources(true)}>內容與學習方法說明</button></p>
        </>}
      </>}

      {!session && <footer className="site-footer"><span lang="ja">言葉の庭<span className="footer-divider">/</span>毎日、少しずつ。</span><span>用一點時間，種下一點日文。</span></footer>}
    </main>

    {!session && <nav className="bottom-nav" aria-label="手機導覽">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => navigate(id)} aria-current={tab === id ? 'page' : undefined}><Icon size={21} strokeWidth={tab === id ? 2 : 1.6} /><span>{label}</span></button>)}</nav>}
    {toast && <div className="toast" role="status"><CheckCircle2 size={18} /><span>{toast}</span><button className="icon-button" onClick={() => setToast('')} aria-label="關閉通知"><X size={15} /></button></div>}

    {selectedWord && <Modal title="單字手帖" onClose={() => setSelectedWord(null)}><WordDetail word={selectedWord} speak={speakWord} /><div className="detail-status"><span className={`word-status ${state.progress[selectedWord.id] ? 'learning' : ''}`}>{wordStatus(state, selectedWord.id)}</span><span>{state.progress[selectedWord.id] ? `下次複習：${readableDate(state.progress[selectedWord.id].dueAt)}` : '尚未開始練習'}</span></div><button className="button primary full-width" onClick={() => startSession('mixed', [selectedWord.id])}>練習這個單字<ArrowRight size={17} /></button><p className="modal-footnote">單獨練習新詞也會計入今日新詞數量。</p></Modal>}
    {pendingImport && <Modal title="匯入前，先確認一下" onClose={() => setPendingImport(null)}><div className="import-preview"><ArrowUpFromLine size={30} /><h3>這份備份包含 {Object.keys(pendingImport.progress).length} 個已學單字</h3><p>{pendingImport.reviews.length} 次練習紀錄 · 備份更新於 {new Date(pendingImport.updatedAt).toLocaleString('zh-TW')}</p></div><p className="import-warning">匯入會取代目前裝置上的進度與設定，無法自動合併。建議先匯出目前的資料。</p><div className="modal-actions"><button className="button secondary" onClick={downloadBackup}>先匯出目前進度</button><button className="button primary" onClick={() => { readBlocked.current = false; commit(pendingImport); setPendingImport(null); notify('備份已載入，正在儲存到這台裝置。'); }}>確認取代並匯入</button></div></Modal>}
    {showInstallHelp && <Modal title="把日文，放在主畫面" onClose={() => setShowInstallHelp(false)}><div className="install-illustration"><div className="brand-mark"><Sprout size={38} /></div><span>言葉の庭</span></div><p>在 Android Chrome 開啟右上角的 <MoreHorizontal size={17} className="inline-icon" /> 選單，選擇「加入主畫面」或「安裝應用程式」。</p><p>若沒有安裝選項，請確認使用正式 HTTPS 網址並重新整理。iPhone Chrome 可在分享選單中尋找「加入主畫面」；若未提供，請用 Safari 開啟相同網址。</p><div className="settings-note"><ShieldCheck size={18} /><span>安裝後請從相同網址開啟，並定期匯出備份；不同瀏覽器的進度不會自動同步。</span></div></Modal>}
    {showSources && <Modal title="關於這本單字手帖" onClose={() => setShowSources(false)}><div className="prose"><h3>100 個詞，一個練習起點</h3><p>本詞庫為本專案整理的代表性中級詞彙，N3 為參考分類，不是官方完整詞表，也不保證每詞只屬於 N3。例句與繁體中文翻譯為本專案原創編寫，尚未經日文母語者全面審訂。</p><h3>先回想，再看答案</h3><p>先嘗試回想意思，再透過辨義或情境題檢查理解。作答後依結果與自評調整間隔：答錯短時間後再練，答對則逐步拉長。同日或尚未到期的額外練習不會提升熟悉階段。這是可解釋的簡化排程，沒有宣稱能保證考試成績。</p><h3>發音與隱私</h3><p>發音由裝置的文字轉語音提供，部分語音可能連線到系統供應商。學習資料儲存在本機，沒有登入、分析追蹤或雲端上傳功能。</p><p>完整來源與限制請見專案 docs/content-sources.md。</p></div></Modal>}
    {offlineReady && !session && <div className="offline-ready" role="status"><CheckCircle2 size={16} /><span>手帖已準備好，可以離線學習了。</span><button className="icon-button" onClick={() => setOfflineReady(false)} aria-label="關閉離線準備通知"><X size={15} /></button></div>}
  </>;
}

function PageIntro({ eyebrow, title, description, right }: { eyebrow: string; title: string; description: string; right?: ReactNode }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}<span className="title-dot">。</span></h1><p>{description}</p></div>{right}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="關閉視窗"><X size={21} /></button></div>{children}</section></div>;
}

function WordDetail({ word, speak, compact = false }: { word: Word; speak: (text: string) => void; compact?: boolean }) {
  return <div className={`word-detail ${compact ? 'compact' : ''}`}><div className="detail-word-line"><div><span className="detail-reading" lang="ja">{word.reading}</span><h3 lang="ja">{word.word}</h3></div><button className="audio-button" onClick={() => speak(word.word)} aria-label={`播放${word.word}的日文發音`}><Volume2 size={22} /></button></div><div className="detail-meaning"><span className="part-of-speech">{word.partOfSpeech}</span><strong>{word.meaning}</strong></div><div className="example-block"><span className="mini-label">放進句子裡</span><p lang="ja">{word.example}</p><span>{word.translation}</span><button className="example-audio" onClick={() => speak(word.example)} aria-label="播放例句發音"><Volume2 size={17} /></button></div><div className="collocation"><span className="mini-label">常見搭配</span><span lang="ja">{word.collocation}</span></div>{word.note && <div className="word-note"><Lightbulb size={16} /><p>{word.note}</p></div>}</div>;
}

function StudySession({ session, state, commit, onChange, onFinish, speak, speechAvailable, storageSafe }: { session: Session; state: AppState; commit: (state: AppState) => void; onChange: (session: Session) => void; onFinish: (results: boolean[]) => void; speak: (text: string) => void; speechAvailable: boolean; storageSafe: boolean }) {
  const [phase, setPhase] = useState<'think' | 'choose' | 'feedback'>('think');
  const [answer, setAnswer] = useState<string | null>(null);
  const [showReading, setShowReading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const baseState = useRef(state);
  const reviewTime = useRef(new Date());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const word = wordMap.get(session.ids[session.index])!;
  const mode = session.mode === 'listening' ? 'listening' : session.index % 2 === 1 && word.example.includes(word.word) ? 'context' : 'meaning';
  const correct = answer === word.id;
  const displayOption = (option: Word) => mode === 'meaning' ? option.meaning : option.word;
  const distractors = vocabulary.filter((item) => item.id !== word.id && displayOption(item) !== displayOption(word) && (mode !== 'listening' || item.reading !== word.reading));
  const preferred = distractors.filter((item) => item.partOfSpeech === word.partOfSpeech);
  const pool = [...preferred, ...distractors.filter((item) => !preferred.includes(item))];
  const seed = word.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) + session.index + session.seed;
  const offsets = [seed % pool.length, (seed + 13) % pool.length, (seed + 31) % pool.length];
  const wrongOptions: Word[] = [];
  for (let index = 0; wrongOptions.length < 3 && index < pool.length; index++) {
    const item = pool[offsets[index] ?? ((seed + index) % pool.length)];
    if (!wrongOptions.some((existing) => existing.id === item.id || displayOption(existing) === displayOption(item))) wrongOptions.push(item);
  }
  const options = [...wrongOptions]; options.splice(seed % 4, 0, word);
  const context = word.example.split(word.word);

  useEffect(() => { headingRef.current?.focus(); }, [session.index]);
  function selectAnswer(id: string) {
    if (answer !== null) return;
    setAnswer(id); setPhase('feedback');
    baseState.current = state; reviewTime.current = new Date();
    commit(recordReview(state, word.id, id === word.id, id === word.id ? 'good' : 'again', reviewTime.current));
  }
  function rate(rating: Rating) {
    if (transitioning) return;
    setTransitioning(true);
    commit(recordReview(baseState.current, word.id, correct, rating, reviewTime.current));
    const results = [...session.results, correct];
    const ids = [...session.ids]; const repeated = [...session.repeated];
    if ((!correct || rating === 'again') && !repeated.includes(word.id)) { ids.push(word.id); repeated.push(word.id); }
    if (session.index + 1 >= ids.length) { onFinish(results); return; }
    onChange({ ...session, ids, repeated, index: session.index + 1, results });
    setPhase('think'); setAnswer(null); setShowReading(false); setTransitioning(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function leave() { onFinish(answer === null ? session.results : [...session.results, correct]); }

  return <section className="study-page"><div className="study-topbar"><button className="text-button muted" onClick={leave}><ArrowLeft size={17} />結束這輪</button><span>{session.mode === 'listening' ? '聽音練習' : '今日學習'}<span className="study-counter">{session.index + 1} / {session.ids.length}</span></span><span className="study-autosave"><ShieldCheck size={14} />{storageSafe ? '作答後自動儲存' : '暫存於記憶體，請先備份'}</span></div><div className="session-progress" role="progressbar" aria-label="本輪學習進度" aria-valuenow={session.index} aria-valuemin={0} aria-valuemax={session.ids.length}><span style={{ width: `${session.index / session.ids.length * 100}%` }} /></div>
    <div className="study-intro"><span className="eyebrow">{phase === 'feedback' ? 'A LITTLE MORE FAMILIAR.' : mode === 'listening' ? 'LISTEN. RECALL. CONNECT.' : mode === 'context' ? 'WORDS LIVE IN CONTEXT.' : 'PAUSE. RECALL. REMEMBER.'}</span><h1 ref={headingRef} tabIndex={-1}>{phase === 'feedback' ? correct ? '想起來了，很好。' : '沒關係，讓它再熟悉一點。' : mode === 'listening' ? '聽聽看，是哪個單字？' : mode === 'context' ? '放進這句話，該用哪個詞？' : '先想一想，這個詞是什麼意思？'}</h1><p>{phase === 'feedback' ? '看看例句，再依剛才回想的難易度安排下一次。' : '先在心裡回想，準備好再看選項。'}</p></div>
    <div className={`study-card ${phase === 'feedback' ? 'feedback-card' : ''}`}>
      {phase === 'feedback' ? <><div className={`answer-feedback ${correct ? 'correct' : 'incorrect'}`} role="status">{correct ? <CheckCircle2 size={18} /> : <RefreshCw size={18} />}<span>{correct ? '答對了' : `這次選了「${displayOption(wordMap.get(answer!)!)}」，正確答案如下`}</span></div><WordDetail word={word} speak={speak} compact /><div className="rating-section"><span className="mini-label">剛才回想起來，感覺如何？</span><div className={`rating-buttons ${!correct ? 'two-options' : ''}`}>{([{ id: 'again', label: '再練一次', icon: RefreshCw }, { id: 'hard', label: '有點模糊', icon: MoreHorizontal }, ...(correct ? [{ id: 'good', label: '記得了', icon: Check }, { id: 'easy', label: '很熟悉', icon: Sparkles }] : [])] as { id: Rating; label: string; icon: typeof Check }[]).map(({ id, label, icon: Icon }) => <button key={id} className={`rating-button ${id}`} onClick={() => rate(id)} disabled={transitioning}><Icon size={17} /><strong>{label}</strong><span>{nextInterval(baseState.current, word.id, correct, id, reviewTime.current)}</span></button>)}</div><small>{storageSafe ? '已保存本題作答；選擇上方評估可調整複習時間並繼續。' : '本題暫存於記憶體；請留意儲存提示並匯出備份。'}</small></div></> : <>
        <div className="study-card-meta"><span className="pill neutral">{state.progress[word.id] ? '再次遇見' : '新單字'}</span><span>{word.category}</span></div>
        {mode === 'listening' ? <div className="listening-question"><button className="big-audio" onClick={() => speak(word.word)} aria-label="播放題目日文發音"><Volume2 size={42} strokeWidth={1.5} /></button><p>點一下聽發音，可以重複播放。</p>{!speechAvailable && <p className="error-message">日文語音目前不可用，請先結束這輪並確認語音設定。</p>}</div> : mode === 'context' ? <div className="context-question"><span className="mini-label">依照中文意思，選出合適的單字</span><p lang="ja">{context.map((part, index) => <span key={index}>{index > 0 && <span className="sentence-blank">？</span>}{part}</span>)}</p><div className="context-translation">{word.translation}</div><small>結合句意與中文提示，試著回想。</small></div> : <div className="meaning-question"><span className={`question-reading ${showReading ? '' : 'hidden-reading'}`} lang="ja">{showReading ? word.reading : '先試著自己讀讀看'}</span><h2 lang="ja">{word.word}</h2><div className="question-tools"><button onClick={() => setShowReading(!showReading)}>{showReading ? '隱藏假名' : '看看假名'}</button><span /><button onClick={() => speak(word.word)}><Volume2 size={16} />聽發音</button></div></div>}
        {phase === 'think' ? <div className="recall-action"><p><Lightbulb size={16} />多給記憶幾秒鐘，試著說出你的答案。</p><button className="button primary" onClick={() => setPhase('choose')}>想好了，看看選項<ArrowRight size={17} /></button></div> : <div className="answer-options" aria-label="作答選項">{options.map((option, index) => <button key={option.id} className="answer-option" onClick={() => selectAnswer(option.id)}><span className="option-number">{index + 1}</span><span lang={mode === 'meaning' ? 'zh-Hant' : 'ja'}>{displayOption(option)}</span><ChevronRight size={16} /></button>)}</div>}
      </>}
    </div><div className="study-bottom-note"><Leaf size={15} />{phase === 'feedback' ? '答錯的詞會在這輪稍後再出現一次。' : '只看答案不會算作學會；每一次主動回想都很有意義。'}</div>
  </section>;
}
