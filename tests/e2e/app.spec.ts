import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { vocabulary } from '../../src/data/vocabulary';
import type { AppState } from '../../src/lib/learning';

const firstWord = vocabulary[0];

async function navigate(page: Page, testInfo: TestInfo, name: string) {
  const label = testInfo.project.name.includes('mobile') ? '手機導覽' : '主要導覽';
  await page.getByRole('navigation', { name: label }).getByRole('button', { name, exact: true }).click();
}

async function storedState(page: Page): Promise<AppState | null> {
  return page.evaluate(async () => new Promise<AppState | null>((resolve, reject) => {
    const request = indexedDB.open('kotoba-n3', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('app', 'readonly');
      const get = transaction.objectStore('app').get('state');
      transaction.oncomplete = () => { resolve(get.result ?? null); db.close(); };
      transaction.onerror = () => { reject(transaction.error); db.close(); };
    };
  }));
}

async function completeOneWord(page: Page) {
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await expect(page.getByRole('heading', { name: '先想一想，這個詞是什麼意思？' })).toBeVisible();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await expect(page.getByText('答對了', { exact: true })).toBeVisible();
  await page.locator('.rating-button.good').click();
  await page.getByRole('button', { name: '結束這輪' }).click();
  await expect.poll(async () => (await storedState(page))?.reviews.length).toBe(1);
}

test('active recall records exactly one answer and progress survives reload', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await expect(page.getByRole('heading', { name: '先想一想，這個詞是什麼意思？' })).toBeVisible();
  expect((await storedState(page))?.reviews ?? []).toHaveLength(0);
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  expect((await storedState(page))?.reviews ?? []).toHaveLength(0);
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await expect(page.getByText('答對了', { exact: true })).toBeVisible();
  await expect.poll(async () => (await storedState(page))?.reviews.length).toBe(1);
  await page.locator('.rating-button.good').click();
  await page.getByRole('button', { name: '結束這輪' }).click();
  await expect.poll(async () => (await storedState(page))?.progress[firstWord.id]?.attempts).toBe(1);
  await page.reload();
  await navigate(page, testInfo, '學習足跡');
  const touched = page.locator('.progress-stat').filter({ hasText: '已接觸的單字' });
  await expect(touched.locator('strong')).toHaveText(`1 / ${vocabulary.length}`);
  const state = await storedState(page);
  expect(state?.reviews).toHaveLength(1);
  expect(state?.progress[firstWord.id]).toMatchObject({ attempts: 1, correctCount: 1, intervalDays: 1 });
  expect(errors).toEqual([]);
});

test('an incorrect answer is saved immediately and cannot be marked familiar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasNotText: firstWord.meaning }).first().click();
  await expect(page.getByRole('heading', { name: '沒關係，讓它再熟悉一點。' })).toBeVisible();
  await expect(page.locator('.rating-button.easy')).toHaveCount(0);
  await expect(page.locator('.rating-button.good')).toHaveCount(0);
  await page.getByRole('button', { name: '結束這輪' }).click();
  await expect.poll(async () => (await storedState(page))?.progress[firstWord.id]?.lapses).toBe(1);
  const state = await storedState(page);
  expect(state?.progress[firstWord.id]).toMatchObject({ correctCount: 0, correctStreak: 0, intervalDays: 0 });
  expect(state?.reviews).toHaveLength(1);
});

test('all bundled words can be filtered, searched by kana, and opened with keyboard dismissal', async ({ page }, testInfo) => {
  await page.goto('/');
  await navigate(page, testInfo, '單字手帖');
  await expect(page.locator('.word-row')).toHaveCount(vocabulary.length);
  await page.getByRole('button', { name: '工作學習', exact: true }).click();
  await expect(page.locator('.word-row')).toHaveCount(vocabulary.filter((word) => word.category === '工作學習').length);
  const target = vocabulary.find((word) => word.category === '工作學習')!;
  await page.getByRole('textbox', { name: '搜尋單字' }).fill(target.reading);
  const row = page.locator('.word-row').filter({ has: page.getByText(target.word, { exact: true }) });
  await expect(row).toHaveCount(1);
  await row.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: target.word, exact: true })).toBeVisible();
  await expect(dialog.getByText(target.collocation, { exact: true })).toBeVisible();
  await expect(dialog.getByText(target.translation, { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(row).toBeFocused();
  await page.getByRole('textbox', { name: '搜尋單字' }).fill('並不存在的單字xyz');
  await expect(page.getByRole('heading', { name: '還沒有找到這個單字' })).toBeVisible();
  await page.getByRole('button', { name: '顯示全部單字' }).click();
  await expect(page.locator('.word-row')).toHaveCount(vocabulary.length);
});

test('backup round-trip requires confirmation and rejects invalid files without overwriting progress', async ({ page }, testInfo) => {
  await page.goto('/');
  await completeOneWord(page);
  await navigate(page, testInfo, '學習設定');
  await page.locator('.goal-option').filter({ hasText: '輕鬆開始' }).click();
  await expect.poll(async () => (await storedState(page))?.settings.dailyNewLimit).toBe(4);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出進度備份', exact: true }).click();
  const download = await downloadEvent;
  const backupPath = await download.path();
  const backup = JSON.parse(await readFile(backupPath!, 'utf8'));
  expect(backup.format).toBe('kotoba-n3-backup');
  expect(backup.state.reviews).toHaveLength(1);
  expect(backup.state.settings.dailyNewLimit).toBe(4);

  await page.locator('.goal-option').filter({ hasText: '多一點挑戰' }).click();
  await expect.poll(async () => (await storedState(page))?.settings.dailyNewLimit).toBe(12);
  await page.getByLabel('選擇進度備份檔').setInputFiles(backupPath!);
  await expect(page.getByRole('dialog', { name: '匯入前，先確認一下' })).toBeVisible();
  expect((await storedState(page))?.settings.dailyNewLimit).toBe(12);
  await page.getByRole('button', { name: '確認取代並匯入' }).click();
  await expect.poll(async () => (await storedState(page))?.settings.dailyNewLimit).toBe(4);
  await expect(page.locator('.goal-option.active')).toContainText('輕鬆開始');

  await page.getByLabel('選擇進度備份檔').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"kotoba-n3-backup","version":999,"state":{}}') });
  await expect(page.getByRole('alert')).toContainText('備份格式或資料內容不正確');
  expect((await storedState(page))?.settings.dailyNewLimit).toBe(4);
  expect((await storedState(page))?.reviews).toHaveLength(1);
  await page.reload();
  await navigate(page, testInfo, '學習設定');
  await expect(page.locator('.goal-option.active')).toContainText('輕鬆開始');
});

test('production PWA reloads offline and continues saving learning progress', async ({ page, context }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  // First activation does not forcibly claim an open learning session.
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifest).toBeTruthy();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('離線學習中 · 進度會儲存在這台裝置')).toBeVisible();
  await completeOneWord(page);
  await page.reload();
  await navigate(page, testInfo, '學習足跡');
  await expect(page.locator('.progress-stat').filter({ hasText: '已接觸的單字' }).locator('strong')).toHaveText(`1 / ${vocabulary.length}`);
  await context.setOffline(false);
});

test('listening practice explains when a Japanese system voice is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    if ('speechSynthesis' in window) Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [] });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '開始聽音練習' }).click();
  await expect(page.getByRole('status').filter({ hasText: '這台裝置尚未提供日文語音' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  expect((await storedState(page))?.reviews ?? []).toHaveLength(0);
});

test('a failed initial database read never overwrites the existing progress', async ({ page }) => {
  await page.goto('/');
  await completeOneWord(page);
  const baseline = await storedState(page);
  expect(baseline?.reviews).toHaveLength(1);
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.get;
    let failed = false;
    IDBObjectStore.prototype.get = function (key: IDBValidKey | IDBKeyRange) {
      const request = original.call(this, key);
      if (!failed && this.name === 'app' && key === 'state' && this.transaction.mode === 'readonly') {
        failed = true;
        this.transaction.abort();
      }
      return request;
    };
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('讀取');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await expect(page.locator('.study-autosave')).not.toContainText('自動儲存');
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await page.locator('.rating-button.good').click();
  await page.getByRole('button', { name: '結束這輪' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(await storedState(page)).toEqual(baseline);
});

test('a stale second tab cannot overwrite progress saved by the first tab', async ({ page, context }, testInfo) => {
  const staleTab = await context.newPage();
  await Promise.all([page.goto('/'), staleTab.goto('/')]);
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  await expect(staleTab.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  // Both React instances have read the same empty IndexedDB snapshot.
  await completeOneWord(page);
  const baseline = await storedState(page);
  expect(Object.keys(baseline!.progress)).toEqual([firstWord.id]);

  async function practiceFromStaleLibrary(wordId: string) {
    const word = vocabulary.find((item) => item.id === wordId)!;
    await navigate(staleTab, testInfo, '單字手帖');
    await staleTab.locator('.word-row').filter({ has: staleTab.getByText(word.word, { exact: true }) }).click();
    await staleTab.getByRole('button', { name: '練習這個單字' }).click();
    await staleTab.getByRole('button', { name: '想好了，看看選項' }).click();
    await staleTab.locator('.answer-option').filter({ hasText: word.meaning }).click();
    await expect(staleTab.getByRole('alert')).toContainText('另一個分頁已更新進度，已停止覆寫');
    await expect(staleTab.locator('.study-autosave')).not.toContainText('自動儲存');
    await staleTab.locator('.rating-button.good').click();
    await expect(staleTab.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
    expect(await storedState(staleTab)).toEqual(baseline);
  }
  await practiceFromStaleLibrary('gaishutsu');
  // Once blocked, further in-memory practice must leave the original intact.
  await practiceFromStaleLibrary('rusu');
  await staleTab.reload();
  await navigate(staleTab, testInfo, '學習足跡');
  await expect(staleTab.locator('.progress-stat').filter({ hasText: '已接觸的單字' }).locator('strong')).toHaveText(`1 / ${vocabulary.length}`);
  await expect(staleTab.getByRole('alert')).toHaveCount(0);
  expect(await storedState(staleTab)).toEqual(baseline);
  await staleTab.close();
});

test('context questions supply a Chinese meaning clue and accept the matching Japanese word', async ({ page }) => {
  const target = vocabulary[1];
  expect(target.id).toBe('gaishutsu');
  await page.goto('/');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await page.locator('.rating-button.good').click();
  await expect(page.getByRole('heading', { name: '放進這句話，該用哪個詞？' })).toBeVisible();
  await expect(page.locator('.context-translation')).toHaveText(target.translation);
  await expect(page.locator('.context-question p')).not.toContainText(target.word);
  await expect(page.locator('.sentence-blank')).toBeVisible();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ has: page.getByText(target.word, { exact: true }) }).click();
  await expect(page.getByText('答對了', { exact: true })).toBeVisible();
  await expect(page.locator('.detail-word-line h3')).toHaveText(target.word);
  await page.locator('.rating-button.good').click();
  await page.getByRole('button', { name: '結束這輪' }).click();
  await expect.poll(async () => (await storedState(page))?.reviews.length).toBe(2);
  expect((await storedState(page))?.progress[target.id]?.correctCount).toBe(1);
});

test('WCAG A and AA checks pass on all main screens, word dialog and answer feedback', async ({ page }, testInfo) => {
  const reports: { screen: string; violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'] }[] = [];
  async function audit(screen: string) {
    // Measure the final interface, rather than a translucent frame of the
    // dialog's 200ms entrance animation. No accessibility rule is disabled.
    await page.evaluate(async () => {
      const finite = document.getAnimations().filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
      await Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
    });
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    reports.push({ screen, violations: result.violations });
  }
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  await audit('home');
  await navigate(page, testInfo, '單字手帖');
  await audit('words');
  await page.locator('.word-row').first().click();
  await audit('word-dialog');
  await page.getByRole('button', { name: '關閉視窗' }).click();
  await navigate(page, testInfo, '學習足跡');
  await audit('progress');
  await navigate(page, testInfo, '學習設定');
  await audit('settings');
  await navigate(page, testInfo, '今日學習');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await audit('feedback');
  await mkdir('artifacts', { recursive: true });
  await writeFile(`artifacts/a11y-${testInfo.project.name}.json`, JSON.stringify(reports, null, 2));
  await testInfo.attach('accessibility-report', { body: JSON.stringify(reports, null, 2), contentType: 'application/json' });
  const summary = reports.flatMap(({ screen, violations }) => violations.map((violation) => ({ screen, rule: violation.id, impact: violation.impact, affectedElements: violation.nodes.length })));
  expect(summary).toEqual([]);
});

test('main screens and word dialog fit a narrow Chrome viewport', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  for (const name of ['今日學習', '單字手帖', '學習足跡', '學習設定']) {
    await navigate(page, testInfo, name);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await navigate(page, testInfo, '單字手帖');
  await page.locator('.word-row').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: '關閉視窗' }).click();
  await navigate(page, testInfo, '今日學習');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
