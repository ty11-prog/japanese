import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { vocabulary } from '../../src/data/vocabulary';
import type { AppState } from '../../src/lib/learning';
import originalWordIds from '../fixtures/original-word-ids.json' with { type: 'json' };
import legacyBackup from '../fixtures/legacy-backup.json' with { type: 'json' };

const categories = ['日常生活', '工作學習', '情緒人際', '社會資訊', '動作表達'] as const;
const originalIds = new Set(originalWordIds);
const addedWords = vocabulary.filter((word) => !originalIds.has(word.id));

async function navigate(page: Page, info: TestInfo, name: string) {
  const label = info.project.name.includes('mobile') ? '手機導覽' : '主要導覽';
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

async function importBackup(page: Page, info: TestInfo, backup: unknown, expectedCount: number) {
  await navigate(page, info, '學習設定');
  await page.getByLabel('選擇進度備份檔').setInputFiles({
    name: '100-word-edition-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)),
  });
  const preview = page.getByRole('dialog', { name: '匯入前，先確認一下' });
  await expect(preview).toContainText(`這份備份包含 ${expectedCount} 個已學單字`);
  await preview.getByRole('button', { name: '確認取代並匯入' }).click();
  await expect.poll(async () => Object.keys((await storedState(page))?.progress ?? {}).length).toBe(expectedCount);
}

test('expanded library has 300 cards, 60 per topic, and readable new examples in all five topics', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await navigate(page, info, '單字手帖');
  await expect(page.locator('.count-badge')).toContainText('300');
  await expect(page.locator('.word-row')).toHaveCount(300);

  for (const category of categories) {
    await page.getByRole('textbox', { name: '搜尋單字' }).fill('');
    await page.getByRole('button', { name: category, exact: true }).click();
    await expect(page.locator('.word-row')).toHaveCount(60);
    const word = addedWords.find((item) => item.category === category)!;
    await page.getByRole('textbox', { name: '搜尋單字' }).fill(word.reading);
    const row = page.locator('.word-row').filter({ has: page.getByText(word.word, { exact: true }) });
    await expect(row).toHaveCount(1);
    await row.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: word.word, exact: true })).toBeVisible();
    await expect(dialog.locator('.detail-reading')).toHaveText(word.reading);
    await expect(dialog.locator('.detail-meaning')).toContainText(word.meaning);
    await expect(dialog.locator('.part-of-speech')).toHaveText(word.partOfSpeech);
    await expect(dialog.getByText(word.collocation, { exact: true })).toBeVisible();
    await expect(dialog.getByText(word.translation, { exact: true })).toBeVisible();
    const example = dialog.locator('.example-block p');
    await expect(example.locator('ruby').first()).toBeVisible();
    const rendered = await example.evaluate((element) => {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('rt, rp').forEach((node) => node.remove());
      return { base: clone.textContent, readings: Array.from(element.querySelectorAll('rt'), (node) => node.textContent ?? '') };
    });
    expect(rendered.base).toBe(word.example);
    expect(rendered.readings.every((reading) => /^[ぁ-ゖー]+$/.test(reading))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await dialog.getByRole('button', { name: '關閉視窗' }).click();
  }
  expect(errors).toEqual([]);
});

test('100-word edition backup preserves its schedule while progress and memory use the 300-word total', async ({ page }, info) => {
  await page.goto('/');
  await importBackup(page, info, legacyBackup, 1);
  expect(await storedState(page)).toEqual(legacyBackup.state);
  await page.reload();
  expect(await storedState(page)).toEqual(legacyBackup.state);
  await navigate(page, info, '學習足跡');
  await expect(page.locator('.progress-stat').filter({ hasText: '已接觸的單字' }).locator('strong')).toHaveText('1 / 300');
  await expect(page.locator('.memory-legend').getByText('未開始', { exact: false }).locator('strong')).toHaveText('299');
  const widths = await page.locator('.memory-bar > span').evaluateAll((elements) => elements.map((element) => parseFloat((element as HTMLElement).style.width)));
  expect(widths[0]).toBeCloseTo(100 / 300, 4);
  expect(widths[1]).toBe(0);
  await navigate(page, info, '今日學習');
  await expect(page.locator('.mini-stats')).toContainText('1 / 300');
  expect((await storedState(page))?.progress.shitaku).toEqual(legacyBackup.state.progress.shitaku);
});

test('a learner who finished the original 100 can practise a new word without changing old review schedules', async ({ page }, info) => {
  // A schema-1 backup with all original IDs and five successful spaced reviews.
  // Relative dates keep the old cards learned and not due, with today's new-word allowance intact.
  const day = 86_400_000;
  const now = Date.now();
  const offsets = [30, 29, 26, 19, 5];
  const intervals = [1, 3, 7, 14, 30];
  const dates = offsets.map((offset) => new Date(now - offset * day).toISOString());
  const oldState: AppState = {
    schemaVersion: 1, progress: {}, reviews: [], settings: { dailyNewLimit: 8, dailyMinutes: 15 }, updatedAt: dates[4],
  };
  for (const id of originalWordIds) {
    oldState.progress[id] = {
      wordId: id, introducedAt: dates[0], lastReviewedAt: dates[4], dueAt: new Date(now + 25 * day).toISOString(),
      intervalDays: 30, attempts: 5, correctCount: 5, correctStreak: 5, lapses: 0,
    };
    for (let index = 0; index < dates.length; index += 1) oldState.reviews.push({
      id: `legacy-${id}-${index}`, wordId: id, reviewedAt: dates[index], correct: true, rating: 'good', intervalDays: intervals[index],
    });
  }
  await page.goto('/');
  await importBackup(page, info, { format: 'kotoba-n3-backup', version: 1, state: oldState }, 100);
  await navigate(page, info, '今日學習');
  await page.getByRole('button', { name: '繼續今日學習', exact: true }).click();
  const word = addedWords[0];
  await expect(page.locator('.meaning-question h2')).toHaveText(word.word);
  await expect(page.locator('.study-card-meta')).toContainText('新單字');
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ has: page.getByText(word.meaning, { exact: true }) }).click();
  await expect(page.getByText('答對了', { exact: true })).toBeVisible();
  await expect.poll(async () => (await storedState(page))?.progress[word.id]?.attempts).toBe(1);
  const stored = (await storedState(page))!;
  expect(Object.keys(stored.progress)).toHaveLength(101);
  for (const id of originalWordIds) expect(stored.progress[id], id).toEqual(oldState.progress[id]);
  expect(stored.reviews.filter((review) => originalIds.has(review.wordId))).toEqual(oldState.reviews);
  await page.reload();
  await navigate(page, info, '學習足跡');
  await expect(page.locator('.progress-stat').filter({ hasText: '已接觸的單字' }).locator('strong')).toHaveText('101 / 300');
});
