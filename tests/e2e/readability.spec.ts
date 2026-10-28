import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { vocabulary } from '../../src/data/vocabulary';

async function navigate(page: Page, info: TestInfo, name: string) {
  const label = info.project.name.includes('mobile') ? '手機導覽' : '主要導覽';
  await page.getByRole('navigation', { name: label }).getByRole('button', { name, exact: true }).click();
}

async function checkRuby(heading: Locator, word: typeof vocabulary[number]) {
  const result = await heading.evaluate((element) => {
    const base = element.cloneNode(true) as HTMLElement;
    base.querySelectorAll('rt, rp').forEach((node) => node.remove());
    const reading = element.cloneNode(true) as HTMLElement;
    reading.querySelectorAll('ruby').forEach((ruby) => ruby.replaceWith(ruby.querySelector('rt')!.textContent!));
    const pairs = Array.from(element.querySelectorAll('ruby')).map((ruby) => {
      const range = document.createRange();
      range.selectNode(ruby.firstChild!);
      const baseRect = range.getBoundingClientRect();
      const readingRect = ruby.querySelector('rt')!.getBoundingClientRect();
      return {
        base: ruby.firstChild!.textContent, reading: ruby.querySelector('rt')!.textContent,
        offset: Math.abs((baseRect.left + baseRect.width / 2) - (readingRect.left + readingRect.width / 2)),
        above: readingRect.top < baseRect.top,
      };
    });
    return { base: base.textContent, reading: reading.textContent, pairs };
  });
  expect(result.base).toBe(word.word);
  expect(result.reading).toBe(word.reading);
  for (const pair of result.pairs) {
    expect(pair.offset, `${word.word}/${pair.base}: reading is above its own kanji`).toBeLessThanOrEqual(3);
    expect(pair.above, `${word.word}/${pair.base}`).toBe(true);
  }
  return result;
}

test('the renamed notebook keeps its PWA identity and readable text across narrow screens', async ({ page }, info) => {
  await page.goto('/');
  await expect(page).toHaveTitle('拾語手帖 · N3 日文單字與文法');
  await expect(page.locator('.brand-wordmark')).toContainText('拾語手帖');
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ name: '拾語手帖 · N3日文單字與文法', short_name: '拾語手帖', id: './', scope: './', start_url: './' });
  expect(await page.locator('meta[name="apple-mobile-web-app-title"]').getAttribute('content')).toBe('拾語手帖');
  const widths = info.project.name.includes('mobile') ? [320, 360, 390] : [761, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ['今日學習', '單字手帖', '文法練習', '學習足跡', '學習設定']) {
      await navigate(page, info, name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${name}`).toBe(true);
    }
    await expect(page.locator('.settings-note').first()).toHaveCSS('font-size', width <= 760 ? '14px' : '12px');
    await navigate(page, info, '文法練習');
    await expect(page.locator('.grammar-card > p').first()).toHaveCSS('font-size', '14px');
    await expect(page.locator('.grammar-button.primary').first()).toHaveCSS('font-size', '14px');
  }
});

test('dictionary headings align kana to curated kanji groups, including long and irregular words', async ({ page }, info) => {
  const widths = info.project.name.includes('mobile') ? [320, 390] : [1440];
  const samples = ['節約', '準備', '予算', '取り替える', '真面目', '申し訳ない', '賞味期限', '日帰り', '片付ける', 'ありがたい'];
  await page.goto('/');
  await navigate(page, info, '單字手帖');
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const spelling of samples) {
      const word = vocabulary.find((item) => item.word === spelling)!;
      await page.getByRole('textbox', { name: '搜尋單字' }).fill(spelling);
      await page.locator('.word-row').filter({ has: page.getByText(spelling, { exact: true }) }).click();
      const dialog = page.getByRole('dialog');
      const ruby = await checkRuby(dialog.locator('.headword-text'), word);
      if (spelling === '節約') expect(ruby.pairs.map((pair) => [pair.base, pair.reading])).toEqual([['節', 'せつ'], ['約', 'やく']]);
      if (spelling === '準備') expect(ruby.pairs.map((pair) => [pair.base, pair.reading])).toEqual([['準', 'じゅん'], ['備', 'び']]);
      if (spelling === '真面目') expect(ruby.pairs).toHaveLength(1);
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth), `${width}/${spelling}: dialog fits`).toBe(true);
      if (width === 390 && spelling === '節約') {
        await mkdir('artifacts', { recursive: true });
        await dialog.screenshot({ path: 'artifacts/readability-word-detail.png' });
      }
      await page.getByRole('button', { name: '關閉視窗', exact: true }).click();
    }
  }
});

test('answer feedback and the optional reading hint use the same aligned headword without extra attempts', async ({ page }, info) => {
  const word = vocabulary.find((item) => item.id === 'setsuyaku')!;
  await page.goto('/');
  await navigate(page, info, '單字手帖');
  await page.getByRole('textbox', { name: '搜尋單字' }).fill(word.word);
  await page.locator('.word-row').click();
  await page.getByRole('button', { name: '練習這個單字', exact: true }).click();
  const question = page.locator('.meaning-question .headword-text');
  await expect(question.locator('rt')).toHaveCount(0);
  await page.getByRole('button', { name: '看看假名', exact: true }).click();
  await checkRuby(question, word);
  await page.getByRole('button', { name: '隱藏假名', exact: true }).click();
  await expect(question.locator('rt')).toHaveCount(0);
  await page.getByRole('button', { name: '想好了，看看選項', exact: true }).click();
  await page.locator('.answer-option').filter({ hasText: word.meaning }).click();
  await expect(page.getByText('答對了', { exact: true })).toBeVisible();
  const feedback = page.locator('.feedback-card .headword-text');
  await checkRuby(feedback, word);
  if (info.project.name.includes('mobile')) {
    await mkdir('artifacts', { recursive: true });
    await page.screenshot({ path: 'artifacts/readability-answer-feedback.png', fullPage: true });
  }
  await page.locator('.rating-button.good').click();
  await navigate(page, info, '學習足跡');
  await expect(page.locator('.progress-stat').filter({ hasText: '已接觸的單字' }).locator('strong')).toHaveText('1 / 300');
  await expect(page.locator('.progress-stat').filter({ hasText: '今日練習次數' }).locator('strong')).toHaveText('1 次');
  await page.reload();
  await navigate(page, info, '學習足跡');
  await expect(page.locator('.progress-stat').filter({ hasText: '今日練習次數' }).locator('strong')).toHaveText('1 次');
});
