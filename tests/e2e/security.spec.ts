import { test, expect, type Page } from '@playwright/test';
import { createServer } from 'node:http';

type CspViolation = { directive: string; blockedURI: string };
type SecurityWindow = Window & { __securityViolations: CspViolation[] };

async function recordPolicyViolations(page: Page) {
  await page.addInitScript(() => {
    const securityWindow = window as unknown as SecurityWindow;
    securityWindow.__securityViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      securityWindow.__securityViolations.push({
        directive: event.effectiveDirective,
        blockedURI: event.blockedURI,
      });
    });
  });
}

test('production CSP precedes resources and permits the app to load without violations', async ({ page }) => {
  await recordPolicyViolations(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();

  const policy = page.locator('head meta[http-equiv="Content-Security-Policy"]');
  await expect(policy).toHaveCount(1);
  const placement = await policy.evaluate((meta) => {
    const resources = [...document.querySelectorAll('script[src], link[href], style')];
    return {
      content: meta.getAttribute('content') ?? '',
      resourceCount: resources.length,
      precedesResources: resources.every((resource) => Boolean(
        meta.compareDocumentPosition(resource) & Node.DOCUMENT_POSITION_FOLLOWING,
      )),
    };
  });
  expect(placement.resourceCount).toBeGreaterThan(0);
  expect(placement.precedesResources).toBe(true);
  expect(placement.content).not.toMatch(/'unsafe-(?:inline|eval)'/);
  expect(await page.evaluate(() => (window as unknown as SecurityWindow).__securityViolations)).toEqual([]);
});

test('CSP blocks injected inline and cross-origin scripts before they execute or request data', async ({ page }) => {
  const externalScript = 'https://csp-probe.invalid/security-probe.js';
  let externalAttempts = 0;
  // If CSP regresses, fulfill locally so the probe never contacts another host.
  await page.route(externalScript, async (route) => {
    externalAttempts += 1;
    await route.fulfill({
      contentType: 'text/javascript',
      body: 'document.documentElement.dataset.externalProbeExecuted = "true";',
    });
  });
  await recordPolicyViolations(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();

  await page.evaluate((scriptURL) => {
    const inline = document.createElement('script');
    inline.textContent = 'document.documentElement.dataset.inlineProbeExecuted = "true";';
    document.head.append(inline);
    const external = document.createElement('script');
    external.src = scriptURL;
    document.head.append(external);
  }, externalScript);

  await expect.poll(async () => page.evaluate((scriptURL) => {
    const violations = (window as unknown as SecurityWindow).__securityViolations;
    return {
      inline: violations.some((event) => event.directive.startsWith('script-src') && event.blockedURI === 'inline'),
      // Browsers may redact the path of a cross-origin blocked URL.
      external: violations.some((event) => event.directive.startsWith('script-src') && (
        event.blockedURI === scriptURL || event.blockedURI === new URL(scriptURL).origin
      )),
    };
  }, externalScript)).toEqual({ inline: true, external: true });
  expect(externalAttempts).toBe(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-inline-probe-executed');
  await expect(page.locator('html')).not.toHaveAttribute('data-external-probe-executed');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
});

test('referrer policy omits the referring URL on an ordinary outbound navigation', async ({ page }) => {
  const destination = 'https://referrer-probe.invalid/destination';
  let referringURL: string | undefined;
  let destinationRequests = 0;
  await page.route(destination, async (route) => {
    destinationRequests += 1;
    referringURL = route.request().headers().referer;
    await route.fulfill({ contentType: 'text/html', body: '<h1>Local navigation probe</h1>' });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
  // Do not set rel=noreferrer: the document policy itself must protect this link.
  await page.evaluate((url) => {
    const link = document.createElement('a');
    link.href = url;
    document.body.append(link);
    link.click();
  }, destination);
  await expect(page.getByRole('heading', { name: 'Local navigation probe' })).toBeVisible();
  expect(destinationRequests).toBe(1);
  expect(referringURL).toBeUndefined();
  expect(await page.evaluate(() => document.referrer)).toBe('');
});

test('cross-origin framing shows a direct-opening fallback without mounting the learning interface', async ({ page, baseURL }) => {
  const appURL = new URL('/', baseURL).href;
  // This parent intentionally has no CSP: the app must detect that it is framed,
  // instead of appearing protected only because its own frame-src blocked a child.
  // A real loopback response keeps Chromium's local-network checks enabled.
  const parentServer = createServer((_request, response) => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><html><head><title>Frame host</title></head><body><iframe title="Embedded learning app" src="${appURL}"></iframe></body></html>`);
  });
  try {
    await new Promise<void>((resolve, reject) => {
      parentServer.once('error', reject);
      parentServer.listen(0, '127.0.0.1', () => {
        parentServer.removeListener('error', reject);
        resolve();
      });
    });
    const address = parentServer.address();
    if (!address || typeof address === 'string') throw new Error('Frame host did not receive a loopback port');
    const parentURL = new URL(`http://127.0.0.1:${address.port}/security-frame-host`);
    expect(parentURL.origin).not.toBe(new URL(appURL).origin);

    await page.goto(parentURL.href);
    const embedded = page.frameLocator('iframe[title="Embedded learning app"]');
    await expect(embedded.getByRole('heading', { name: '請直接開啟拾語手帖', exact: true })).toBeVisible();
    const directLink = embedded.getByRole('link', { name: '開啟拾語手帖', exact: true });
    await expect(directLink).toHaveAttribute('target', '_blank');
    const linkURL = await directLink.evaluate((link) => (link as HTMLAnchorElement).href);
    expect(new URL(linkURL).origin).toBe(new URL(appURL).origin);
    await expect(embedded.getByRole('heading', { name: '今天，從這裡開始' })).toHaveCount(0);
    await expect(embedded.getByRole('navigation')).toHaveCount(0);
    await expect(embedded.getByRole('button')).toHaveCount(0);

    const [opened] = await Promise.all([page.waitForEvent('popup'), directLink.click()]);
    await expect(opened.getByRole('heading', { name: '今天，從這裡開始' })).toBeVisible();
    expect(new URL(opened.url()).origin).toBe(new URL(appURL).origin);
    await opened.close();
  } finally {
    if (parentServer.listening) {
      parentServer.closeAllConnections();
      await new Promise<void>((resolve, reject) => parentServer.close((error) => error ? reject(error) : resolve()));
    }
  }
});
