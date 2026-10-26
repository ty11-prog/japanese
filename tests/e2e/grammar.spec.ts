import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { grammarCategories, grammarPoints, type GrammarPoint, type GrammarQuestion } from '../../src/data/grammar';
import { parseFurigana, plainSentence } from '../../src/lib/furigana';
import type { AppState } from '../../src/lib/learning';
import legacyBackup from '../fixtures/legacy-backup.json' with { type: 'json' };

const firstPoint = grammarPoints[0];
const firstQuestion = firstPoint.questions[0];
const plain = (source: string) => plainSentence(parseFurigana(source));

async function navigate(page: Page, info: TestInfo, name = '文法練習') {
  const label = info.project.name.includes('mobile') ? '手機導覽' : '主要導覽';
  await page.getByRole('navigation', { name: label }).getByRole('button', { name, exact: true }).click();
}

async function stored(page: Page): Promise<{ vocabulary: AppState | null; grammar: AppState | null }> {
  return page.evaluate(async () => new Promise((resolve, reject) => {
    const request = indexedDB.open('kotoba-n3', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('app', 'readonly');
      const vocabulary = transaction.objectStore('app').get('state');
      const grammar = transaction.objectStore('app').get('grammar-state');
      transaction.oncomplete = () => { resolve({ vocabulary: vocabulary.result ?? null, grammar: grammar.result ?? null }); db.close(); };
      transaction.onerror = () => { reject(transaction.error); db.close(); };
    };
  }));
}

async function seedVocabulary(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  await page.evaluate(async (state) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('kotoba-n3', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('app', 'readwrite');
      transaction.objectStore('app').put(state, 'state');
      transaction.oncomplete = () => { resolve(); db.close(); };
      transaction.onerror = () => { reject(transaction.error); db.close(); };
    };
  }), legacyBackup.state);
  await page.reload();
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
}

async function openLesson(page: Page, point: GrammarPoint = firstPoint) {
  await page.locator(`.grammar-card[data-grammar-id="${point.id}"]`).click();
  await expect(page.getByRole('dialog', { name: '文法說明', exact: true })).toBeVisible();
}

async function startLesson(page: Page, point: GrammarPoint = firstPoint) {
  await openLesson(page, point);
  await page.getByRole('button', { name: '練習這個文法', exact: true }).click();
  await expect(page.locator('.grammar-question-instruction')).toHaveText(point.questions[0].instruction);
}

async function answer(page: Page, question: GrammarQuestion, correct = true) {
  await expect(page.locator('.grammar-question-instruction')).toHaveText(question.instruction);
  await page.getByRole('button', { name: '想好了，看看文法選項', exact: true }).click();
  const selected = question.options.find((option) => (option.id === question.answerId) === correct)!;
  // Ruby readings are separate presentation text. Select by the actual base
  // wording, rather than assuming the randomized option order or hiding ruby.
  const labels = await page.locator('.grammar-option > span:nth-child(2)').evaluateAll((elements) => elements.map((element) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('rt, rp').forEach((node) => node.remove());
    return clone.textContent ?? '';
  }));
  const label = question.optionLanguage === 'ja' ? plain(selected.text) : selected.text;
  const index = labels.indexOf(label);
  expect(index, `${question.id}: ${label}`).toBeGreaterThanOrEqual(0);
  await page.locator('.grammar-option').nth(index).click();
  await expect(page.getByRole('region', { name: '文法作答解說' })).toBeVisible();
  await expect(page.locator('.grammar-question-instruction')).toHaveText(correct ? '答對了，理解又清楚了一點。' : '看看這個句子想表達什麼。');
  return selected;
}

async function finishEarly(page: Page) {
  await page.getByRole('button', { name: '結束文法練習', exact: true }).click();
  await expect(page.locator('.grammar-card')).toHaveCount(30);
}

test('grammar notebook filters all lessons and explains annotated examples without awarding progress', async ({ page }, info) => {
  await seedVocabulary(page);
  await navigate(page, info);
  await expect(page.locator('.grammar-library-count')).toHaveText('30個文法・90 題練習');
  await expect(page.locator('.grammar-card')).toHaveCount(30);
  for (const category of grammarCategories) {
    await page.getByRole('group', { name: '文法分類' }).getByRole('button', { name: category, exact: true }).click();
    await expect(page.locator('.grammar-card')).toHaveCount(5);
  }
  await page.getByRole('group', { name: '文法分類' }).getByRole('button', { name: '全部', exact: true }).click();
  await page.getByRole('textbox', { name: '搜尋文法' }).fill(firstPoint.pattern);
  await expect(page.locator('.grammar-card')).toHaveCount(1);
  const trigger = page.locator(`.grammar-card[data-grammar-id="${firstPoint.id}"]`);
  await openLesson(page);
  const dialog = page.getByRole('dialog', { name: '文法說明', exact: true });
  await expect(dialog.getByRole('heading', { name: '怎麼接續' })).toBeVisible();
  await expect(dialog.getByText(firstPoint.explanation, { exact: true })).toBeVisible();
  await expect(dialog.getByText(firstPoint.caution, { exact: true })).toBeVisible();
  await expect(dialog.locator('.grammar-example')).toHaveCount(2);
  for (let index = 0; index < firstPoint.examples.length; index += 1) {
    const example = dialog.locator('.grammar-example').nth(index);
    await expect(example.locator('ruby').first()).toBeVisible();
    const rendered = await example.locator('p').evaluate((element) => {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('rt, rp').forEach((node) => node.remove());
      return clone.textContent;
    });
    expect(rendered).toBe(plain(firstPoint.examples[index].japanese));
    await expect(example).toContainText(firstPoint.examples[index].translation);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect((await stored(page)).grammar).toBeNull();
  expect((await stored(page)).vocabulary).toEqual(legacyBackup.state);
  await page.getByRole('textbox', { name: '搜尋文法' }).fill('並不存在的文法xyz');
  await expect(page.getByRole('heading', { name: '還沒有找到這個文法' })).toBeVisible();
  await page.getByRole('button', { name: '顯示全部文法', exact: true }).click();
  await expect(page.locator('.grammar-card')).toHaveCount(30);
});

test('active recall saves one grammar answer, explanation and schedule without changing vocabulary', async ({ page }, info) => {
  await seedVocabulary(page);
  await navigate(page, info);
  await page.getByRole('button', { name: '開始文法練習', exact: true }).click();
  await expect(page.getByRole('group', { name: '文法題目選項' })).toHaveCount(0);
  expect((await stored(page)).grammar).toBeNull();
  const selected = await answer(page, firstQuestion);
  await expect.poll(async () => (await stored(page)).grammar?.reviews.length).toBe(1);
  await expect(page.getByRole('region', { name: '文法作答解說' })).toContainText(firstQuestion.explanation);
  await expect(page.getByRole('region', { name: '文法作答解說' })).toContainText(selected.explanation);
  await expect(page.locator('.grammar-option')).toHaveCount(4);
  await expect(page.locator('.grammar-option.correct')).toHaveCount(1);
  await expect(page.locator('.grammar-option:disabled')).toHaveCount(4);
  const state = (await stored(page)).grammar!;
  expect(state.progress[firstQuestion.id]).toMatchObject({ attempts: 1, correctCount: 1, correctStreak: 1, intervalDays: 1 });
  expect(state.progress[firstPoint.questions[1].id]).toBeUndefined();
  expect(new Date(state.progress[firstQuestion.id].dueAt).getTime() - new Date(state.progress[firstQuestion.id].lastReviewedAt).getTime()).toBe(86_400_000);
  await finishEarly(page);
  await page.reload();
  await navigate(page, info);
  expect((await stored(page)).grammar).toEqual(state);
  expect((await stored(page)).vocabulary).toEqual(legacyBackup.state);
  await expect(page.getByRole('region', { name: '文法學習進度' })).toContainText('1 / 30');
  await expect(page.getByRole('region', { name: '文法學習進度' })).toContainText('0 個');
});

test('a missed question retries once while the other question schedules stay separate', async ({ page }, info) => {
  await page.goto('/');
  await navigate(page, info);
  await startLesson(page);
  const wrong = await answer(page, firstQuestion, false);
  await expect(page.getByRole('region', { name: '文法作答解說' })).toContainText(wrong.explanation);
  await expect(page.getByRole('progressbar', { name: '文法本輪進度' })).toHaveAttribute('aria-valuemax', '4');
  for (const question of firstPoint.questions.slice(1)) {
    await page.getByRole('button', { name: '下一題文法', exact: true }).click();
    await answer(page, question);
  }
  await page.getByRole('button', { name: '下一題文法', exact: true }).click();
  await answer(page, firstQuestion, false);
  await expect(page.getByRole('progressbar', { name: '文法本輪進度' })).toHaveAttribute('aria-valuemax', '4');
  await expect.poll(async () => (await stored(page)).grammar?.reviews.length).toBe(4);
  const state = (await stored(page)).grammar!;
  expect(state.progress[firstQuestion.id]).toMatchObject({ attempts: 2, lapses: 2, correctCount: 0, correctStreak: 0, intervalDays: 0 });
  expect(new Date(state.progress[firstQuestion.id].dueAt).getTime() - new Date(state.progress[firstQuestion.id].lastReviewedAt).getTime()).toBe(600_000);
  for (const question of firstPoint.questions.slice(1)) expect(state.progress[question.id]).toMatchObject({ attempts: 1, correctCount: 1, intervalDays: 1 });
  await page.getByRole('button', { name: '完成這輪文法', exact: true }).click();
  await expect(page.locator('.grammar-summary')).toContainText('完成 4 題，答對 2 題');
  await expect(page.getByRole('button', { name: '再練這輪錯題', exact: true })).toBeVisible();
});

test('grammar backups require confirmation and reject vocabulary backups without replacing either progress record', async ({ page }, info) => {
  await seedVocabulary(page);
  await navigate(page, info);
  await startLesson(page);
  await answer(page, firstQuestion);
  await expect.poll(async () => (await stored(page)).grammar?.reviews.length).toBe(1);
  await finishEarly(page);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出文法備份', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^kotoba-grammar-backup-.*\.json$/);
  const backup = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(backup).toMatchObject({ format: 'kotoba-n3-grammar-backup', version: 1 });
  const oldState = backup.state;
  await startLesson(page);
  await answer(page, firstQuestion);
  await expect.poll(async () => (await stored(page)).grammar?.progress[firstQuestion.id]?.attempts).toBe(2);
  await finishEarly(page);
  const newerState = (await stored(page)).grammar;
  const input = page.getByLabel('選擇文法備份檔');
  await input.setInputFiles({ name: 'grammar-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByRole('dialog', { name: '匯入文法備份前，先確認' })).toBeVisible();
  expect((await stored(page)).grammar).toEqual(newerState);
  await page.keyboard.press('Escape');
  expect((await stored(page)).grammar).toEqual(newerState);
  await input.setInputFiles({ name: 'vocabulary-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacyBackup)) });
  await expect(page.locator('.grammar-backup-error')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await stored(page)).grammar).toEqual(newerState);
  await input.setInputFiles({ name: 'grammar-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.getByRole('button', { name: '確認取代文法進度', exact: true }).click();
  await expect.poll(async () => (await stored(page)).grammar).toEqual(oldState);
  expect((await stored(page)).vocabulary).toEqual(legacyBackup.state);
  await page.reload();
  await navigate(page, info);
  expect((await stored(page)).grammar).toEqual(oldState);
});

test('grammar lessons, ruby and new answers remain available after a real offline reload', async ({ page, context }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await navigate(page, info);
  await expect(page.locator('.grammar-card')).toHaveCount(30);
  const point = grammarPoints.find((item) => item.category === '目的與變化')!;
  await openLesson(page, point);
  await expect(page.locator('.grammar-example')).toHaveCount(2);
  await expect(page.locator('.grammar-example ruby').first()).toBeVisible();
  await page.getByRole('button', { name: '練習這個文法', exact: true }).click();
  await answer(page, point.questions[0]);
  await expect.poll(async () => (await stored(page)).grammar?.progress[point.questions[0].id]?.attempts).toBe(1);
  const state = (await stored(page)).grammar;
  await page.reload();
  await navigate(page, info);
  expect((await stored(page)).grammar).toEqual(state);
  await expect(page.locator('.grammar-card')).toHaveCount(30);
  expect(errors).toEqual([]);
  await context.setOffline(false);
});

test('a stale grammar tab cannot replace answers saved by another tab', async ({ page, context }, info) => {
  await page.goto('/');
  await navigate(page, info);
  await startLesson(page);
  await answer(page, firstQuestion);
  await expect.poll(async () => (await stored(page)).grammar?.reviews.length).toBe(1);
  const staleTab = await context.newPage();
  await staleTab.goto('/');
  await navigate(staleTab, info);
  await staleTab.getByRole('button', { name: '開始文法練習', exact: true }).click();
  const next = firstPoint.questions[1];
  await expect(staleTab.locator('.grammar-question-instruction')).toHaveText(next.instruction);
  await page.getByRole('button', { name: '下一題文法', exact: true }).click();
  await answer(page, next);
  await expect.poll(async () => (await stored(page)).grammar?.reviews.length).toBe(2);
  const latest = (await stored(page)).grammar;
  await answer(staleTab, next, false);
  await expect(staleTab.locator('.grammar-storage-alert')).toContainText('另一個分頁已更新文法進度');
  expect((await stored(page)).grammar).toEqual(latest);
  await staleTab.close();
});

test('an initial grammar read failure leaves existing data intact during memory-only practice', async ({ page }, info) => {
  await seedVocabulary(page);
  await navigate(page, info);
  await startLesson(page);
  await answer(page, firstQuestion);
  await expect.poll(async () => (await stored(page)).grammar?.reviews.length).toBe(1);
  const snapshot = await stored(page);
  await page.addInitScript(() => {
    const get = IDBObjectStore.prototype.get;
    let failOnce = true;
    IDBObjectStore.prototype.get = function (query: IDBValidKey | IDBKeyRange) {
      if (query === 'grammar-state' && failOnce) { failOnce = false; throw new DOMException('Simulated grammar read failure', 'UnknownError'); }
      return get.call(this, query);
    };
  });
  await page.reload();
  await navigate(page, info);
  await expect(page.locator('.grammar-storage-alert')).toContainText('已暫停自動儲存');
  await page.getByRole('button', { name: '開始文法練習', exact: true }).click();
  await answer(page, firstQuestion);
  await expect(page.locator('.grammar-practice-heading')).toContainText('目前只暫存在記憶體');
  expect(await stored(page)).toEqual(snapshot);
});

test('grammar shares furigana and voice preferences and sends only plain Japanese to speech', async ({ page }, info) => {
  await page.addInitScript(() => {
    const testWindow = window as unknown as { grammarSpeechCalls: { text: string; rate: number }[] };
    testWindow.grammarSpeechCalls = [];
    const voice = { name: 'Japanese device', lang: 'ja-JP', voiceURI: 'grammar-local-ja', localService: true, default: false };
    class Utterance { constructor(public text: string) {} rate = 1; }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: Utterance });
    Object.defineProperty(window.speechSynthesis, 'getVoices', { configurable: true, value: () => [voice] });
    Object.defineProperty(window.speechSynthesis, 'cancel', { configurable: true, value: () => {} });
    Object.defineProperty(window.speechSynthesis, 'speak', { configurable: true, value: (utterance: Utterance) => { testWindow.grammarSpeechCalls.push({ text: utterance.text, rate: utterance.rate }); } });
  });
  await page.goto('/');
  await navigate(page, info);
  await openLesson(page);
  await page.getByRole('button', { name: '播放例句：文法例句 1', exact: true }).click();
  await page.getByRole('button', { name: '慢速播放文法例句 1', exact: true }).click();
  const calls = await page.evaluate(() => (window as unknown as { grammarSpeechCalls: { text: string; rate: number }[] }).grammarSpeechCalls);
  expect(calls).toEqual([{ text: plain(firstPoint.examples[0].japanese), rate: 1 }, { text: plain(firstPoint.examples[0].japanese), rate: 0.8 }]);
  await page.getByRole('button', { name: '顯示文法假名', exact: true }).click();
  await expect(page.locator('.grammar-example rt')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('kotoba-furigana'))).toBe('false');
  await page.getByRole('button', { name: '關閉文法視窗', exact: true }).click();
  await navigate(page, info, '學習設定');
  await expect(page.getByRole('switch', { name: '顯示例句假名' })).toHaveAttribute('aria-checked', 'false');
  await page.reload();
  await navigate(page, info);
  await openLesson(page);
  await expect(page.locator('.grammar-example rt')).toHaveCount(0);
  expect((await stored(page)).grammar).toBeNull();
});

test('grammar overview, lesson and feedback fit a narrow viewport and pass WCAG A and AA', async ({ page }, info) => {
  if (info.project.name.includes('mobile')) await page.setViewportSize({ width: 360, height: 800 });
  const reports: { screen: string; violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'] }[] = [];
  async function audit(screen: string) {
    await page.evaluate(async () => {
      await Promise.all(document.getAnimations().filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity).map((animation) => animation.finished.catch(() => {})));
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), screen).toBe(true);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    reports.push({ screen, violations: result.violations });
  }
  await page.goto('/');
  await navigate(page, info);
  await expect(page.locator('.grammar-card')).toHaveCount(30);
  await audit('grammar-overview');
  await openLesson(page);
  await audit('grammar-lesson');
  await page.getByRole('button', { name: '練習這個文法', exact: true }).click();
  await answer(page, firstQuestion, false);
  await audit('grammar-feedback');
  await mkdir('artifacts', { recursive: true });
  await writeFile(`artifacts/grammar-a11y-${info.project.name}.json`, JSON.stringify(reports, null, 2));
  await info.attach('grammar-accessibility-report', { body: JSON.stringify(reports, null, 2), contentType: 'application/json' });
  const failures = reports.flatMap(({ screen, violations }) => violations.map((violation) => ({ screen, rule: violation.id, impact: violation.impact, affected: violation.nodes.length })));
  expect(failures).toEqual([]);
});
