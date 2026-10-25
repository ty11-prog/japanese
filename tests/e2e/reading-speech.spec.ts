import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { vocabulary } from '../../src/data/vocabulary';

const firstWord = vocabulary[0];
const secondWord = vocabulary[1];
type SpeechCall = { text: string; rate: number; lang: string; voiceURI: string };
type SpeechTestWindow = Window & { __speechCalls: SpeechCall[] };

async function navigate(page: Page, info: TestInfo, name: string) {
  const navigation = info.project.name.includes('mobile') ? '手機導覽' : '主要導覽';
  await page.getByRole('navigation', { name: navigation }).getByRole('button', { name, exact: true }).click();
}

async function openFirstWord(page: Page, info: TestInfo) {
  await navigate(page, info, '單字手帖');
  await page.locator('.word-row').filter({ has: page.getByText(firstWord.word, { exact: true }) }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

/** Exercise the browser integration without pretending to assess audible quality.
 * Native voice objects are not constructible in headless Chromium; the mock
 * utterance lets us inspect the exact text, voice and rate passed to Web Speech. */
async function mockSpeech(page: Page) {
  await page.addInitScript(() => {
    const testWindow = window as unknown as SpeechTestWindow;
    testWindow.__speechCalls = [];
    const voices = [
      { name: 'Japanese device', lang: 'ja-JP', voiceURI: 'local-ja', localService: true, default: false },
      { name: 'Japanese Natural Online', lang: 'ja-JP', voiceURI: 'online-ja', localService: false, default: false },
      { name: 'English device', lang: 'en-US', voiceURI: 'local-en', localService: true, default: true },
    ];
    let active: { onerror?: (event: { error: string }) => void } | undefined;
    class MockUtterance {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice?: { voiceURI: string };
      onstart?: () => void;
      onend?: () => void;
      onerror?: (event: { error: string }) => void;
      constructor(text: string) { this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockUtterance });
    Object.defineProperty(window.speechSynthesis, 'getVoices', { configurable: true, value: () => voices });
    Object.defineProperty(window.speechSynthesis, 'speak', { configurable: true, value: (utterance: MockUtterance) => {
      active = utterance;
      testWindow.__speechCalls.push({ text: utterance.text, rate: utterance.rate, lang: utterance.lang, voiceURI: utterance.voice?.voiceURI ?? '' });
      utterance.onstart?.();
    } });
    Object.defineProperty(window.speechSynthesis, 'cancel', { configurable: true, value: () => {
      const previous = active; active = undefined;
      previous?.onerror?.({ error: 'canceled' });
    } });
  });
}

async function speechCalls(page: Page) {
  return page.evaluate(() => (window as unknown as SpeechTestWindow).__speechCalls);
}

test('example ruby can be hidden globally and the preference survives reload', async ({ page }, info) => {
  await page.goto('/');
  await openFirstWord(page, info);
  const example = page.locator('.word-detail .example-block p');
  await expect(example.locator('ruby').first()).toBeVisible();
  const plainText = await example.evaluate((element) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('rt, rp').forEach((node) => node.remove());
    return clone.textContent;
  });
  expect(plainText).toBe(firstWord.example);
  const toggle = page.getByRole('button', { name: '例句假名', exact: true });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(example.locator('ruby')).toHaveCount(0);
  await expect(example).toHaveText(firstWord.example);
  expect(await page.evaluate(() => localStorage.getItem('kotoba-furigana'))).toBe('false');

  await page.reload();
  await openFirstWord(page, info);
  await expect(page.locator('.example-block ruby')).toHaveCount(0);
  await page.getByRole('button', { name: '關閉視窗' }).click();
  await navigate(page, info, '學習設定');
  const preference = page.getByRole('switch', { name: '顯示例句假名' });
  await expect(preference).toHaveAttribute('aria-checked', 'false');
  await preference.click();
  await expect(preference).toHaveAttribute('aria-checked', 'true');
  await openFirstWord(page, info);
  await expect(page.locator('.example-block ruby').first()).toBeVisible();
});

test('context questions hide the complete answer reading and restore ruby after answering', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await expect(page.locator('.feedback-card .example-block ruby').first()).toBeVisible();
  await page.locator('.rating-button.good').click();
  const context = page.locator('.context-question');
  await expect(context).toBeVisible();
  await expect(context.locator('.sentence-blank')).toHaveCount(1);
  await expect(context.locator('p')).not.toContainText(secondWord.word);
  expect(await context.locator('p rt').allTextContents()).not.toContain(secondWord.reading);
  await expect(context.locator('p ruby').first()).toBeVisible();
  await expect(context).toContainText(secondWord.translation);
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ has: page.getByText(secondWord.word, { exact: true }) }).click();
  await expect(page.getByText('答對了', { exact: true })).toBeVisible();
  expect(await page.locator('.feedback-card .example-block rt').allTextContents()).toContain(secondWord.reading);
  if (info.project.name.includes('mobile')) {
    await mkdir('artifacts', { recursive: true });
    await page.screenshot({ path: 'artifacts/reading-feedback.png', fullPage: true });
  }
});

test('Japanese voice and natural-speed preferences persist without changing learning progress', async ({ page }, info) => {
  await mockSpeech(page);
  await page.goto('/');
  await page.getByRole('button', { name: '開始今日學習', exact: true }).click();
  await page.getByRole('button', { name: '想好了，看看選項' }).click();
  await page.locator('.answer-option').filter({ hasText: firstWord.meaning }).click();
  await page.locator('.rating-button.good').click();
  await page.getByRole('button', { name: '結束這輪' }).click();
  await navigate(page, info, '學習設定');
  const voice = page.getByRole('combobox', { name: '日文聲音' });
  const rate = page.getByRole('combobox', { name: '預設語速' });
  await expect(rate).toHaveValue('1');
  await expect(voice.locator('option')).toHaveCount(3); // automatic + two Japanese voices
  await expect(voice).not.toContainText('English device');
  await page.getByRole('button', { name: '測試日文發音', exact: true }).click();
  expect((await speechCalls(page)).at(-1)).toMatchObject({ rate: 1, lang: 'ja-JP', voiceURI: 'online-ja' });
  await voice.selectOption('uri:local-ja');
  await rate.selectOption('1.1');
  await page.getByRole('button', { name: '測試日文發音', exact: true }).click();
  expect((await speechCalls(page)).at(-1)).toMatchObject({ rate: 1.1, voiceURI: 'local-ja' });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kotoba-speech-preferences')!))).toMatchObject({ voice: 'uri:local-ja', rate: 1.1 });
  await page.reload();
  await navigate(page, info, '學習設定');
  await expect(page.getByRole('combobox', { name: '日文聲音' })).toHaveValue('uri:local-ja');
  await expect(page.getByRole('combobox', { name: '預設語速' })).toHaveValue('1.1');
  await navigate(page, info, '學習足跡');
  await expect(page.locator('.progress-stat').filter({ hasText: '已接觸的單字' }).locator('strong')).toHaveText(`1 / ${vocabulary.length}`);
});

test('example audio uses original Japanese, offers slow playback and ignores user cancellation', async ({ page }, info) => {
  await mockSpeech(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await openFirstWord(page, info);
  await page.getByRole('button', { name: '播放例句發音', exact: true }).click();
  expect((await speechCalls(page)).at(-1)).toEqual({ text: firstWord.example, rate: 1, lang: 'ja-JP', voiceURI: 'online-ja' });
  await page.getByRole('button', { name: '慢速播放例句', exact: true }).click();
  expect((await speechCalls(page)).at(-1)).toEqual({ text: firstWord.example, rate: 0.8, lang: 'ja-JP', voiceURI: 'online-ja' });
  await expect(page.getByRole('status').filter({ hasText: '目前無法播放' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('an offline remote-voice preference falls back to an installed Japanese voice', async ({ page, context }, info) => {
  await mockSpeech(page);
  await page.goto('/');
  await navigate(page, info, '學習設定');
  await page.getByRole('combobox', { name: '日文聲音' }).selectOption('uri:online-ja');
  await context.setOffline(true);
  await expect(page.getByText('離線學習中 · 進度會儲存在這台裝置')).toBeVisible();
  await page.getByRole('button', { name: '測試日文發音', exact: true }).click();
  expect((await speechCalls(page)).at(-1)).toMatchObject({ voiceURI: 'local-ja', rate: 1 });
  await expect(page.getByRole('combobox', { name: '日文聲音' })).toHaveValue('uri:online-ja');
  await context.setOffline(false);
  await expect(page.getByText('離線學習中 · 進度會儲存在這台裝置')).toHaveCount(0);
  await page.getByRole('button', { name: '測試日文發音', exact: true }).click();
  expect((await speechCalls(page)).at(-1)).toMatchObject({ voiceURI: 'online-ja' });
});

test('ruby and voice controls fit a narrow viewport', async ({ page }, info) => {
  if (!info.project.name.includes('mobile')) test.skip();
  await page.setViewportSize({ width: 360, height: 800 });
  await mockSpeech(page);
  await page.goto('/');
  await openFirstWord(page, info);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/reading-detail.png' });
  await page.getByRole('button', { name: '關閉視窗' }).click();
  await navigate(page, info, '學習設定');
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/reading-settings.png', fullPage: true });
  await page.locator('.settings-card').filter({ has: page.getByRole('combobox', { name: '日文聲音' }) }).screenshot({ path: 'artifacts/reading-voice-settings.png' });
});
