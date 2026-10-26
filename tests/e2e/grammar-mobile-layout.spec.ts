import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('the home grammar introduction has reading space and its action stays reachable across viewport widths', async ({ page }, info) => {
  const mobile = info.project.name.includes('mobile');
  const widths = mobile ? [320, 360, 390, 430, 480, 760] : [761, 1024, 1440];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await mkdir('artifacts', { recursive: true });

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今天，從這裡開始', exact: true })).toBeVisible();
    const entry = page.locator('.grammar-home-entry');
    await entry.scrollIntoViewIfNeeded();
    const action = entry.getByRole('button', { name: '開始文法練習', exact: true });
    await expect(action).toBeVisible();

    const layout = await entry.evaluate((element) => {
      const rect = (node: Element) => {
        const bounds = node.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height };
      };
      const card = rect(element);
      const style = getComputedStyle(element);
      const copyElement = element.querySelector(':scope > div')!;
      const heading = copyElement.querySelector('h2')!;
      const paragraph = copyElement.querySelector('p')!;
      const headingStyle = getComputedStyle(heading);
      const paragraphStyle = getComputedStyle(paragraph);
      const innerLeft = card.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
      const innerRight = card.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
      return {
        copy: rect(copyElement), icon: rect(element.querySelector('.grammar-home-icon')!),
        action: rect(element.querySelector(':scope > button')!), heading: rect(heading), paragraph: rect(paragraph),
        headingFontSize: parseFloat(headingStyle.fontSize),
        paragraphLineHeight: parseFloat(paragraphStyle.lineHeight),
        innerLeft, innerRight, innerWidth: innerRight - innerLeft,
        columnGap: parseFloat(style.columnGap) || 0,
      };
    });

    // Overflow alone missed the original bug: flex could collapse the copy to
    // a few characters wide while the action remained alongside the paragraph.
    if (width <= 760) {
      expect(layout.copy.width, `${width}px: readable copy width`).toBeGreaterThanOrEqual(layout.innerWidth - layout.icon.width - layout.columnGap - 2);
      expect(layout.action.top, `${width}px: action below the complete explanation`).toBeGreaterThanOrEqual(layout.copy.bottom + 8);
      expect(layout.action.left, `${width}px: action starts at the content edge`).toBeCloseTo(layout.innerLeft, 0);
      expect(layout.action.width, `${width}px: full-width action`).toBeCloseTo(layout.innerWidth, 0);
    } else {
      expect(layout.copy.width, `${width}px: desktop copy width`).toBeGreaterThanOrEqual(layout.innerWidth * 0.5);
      expect(layout.action.left, `${width}px: desktop action alongside explanation`).toBeGreaterThanOrEqual(layout.copy.right + 8);
    }
    expect(layout.heading.height, `${width}px: heading fits at most two normal lines`).toBeLessThanOrEqual(layout.headingFontSize * 2.8);
    expect(layout.paragraph.height, `${width}px: paragraph is not a vertical strip`).toBeLessThanOrEqual(layout.paragraphLineHeight * 6 + 1);
    expect(layout.action.height, `${width}px: touch target`).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px: no horizontal overflow`).toBe(true);
    await entry.screenshot({ path: `artifacts/grammar-home-${mobile ? 'mobile' : 'desktop'}-${width}.png` });

    await action.click();
    await expect(page.locator('.grammar-card')).toHaveCount(30);
    await expect(page.getByRole('region', { name: '文法學習進度' })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
