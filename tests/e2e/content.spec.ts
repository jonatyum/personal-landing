import { expect, test } from '@playwright/test';

// The site is fully self-hosted: any request off localhost is a bug, never let it leave the machine.
test.beforeEach(async ({ context }) => {
  await context.route(/^(?!https?:\/\/localhost[:/])/, (route) => route.abort('blockedbyclient'));
});

test('one h1 and the section h2s in A–F order', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('h1')).toHaveCount(1);
  const h2s = await page.locator('main section > .container h2').allInnerTexts();
  expect(h2s.map((text) => text.trim().charAt(0))).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
});

test('landmarks: one banner, main and contentinfo', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
});

test('every in-page link points to an existing section', async ({ page }) => {
  await page.goto('./');
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
      .map((a) => new URL(a.href).hash.slice(1))
      .filter((id) => id && !document.getElementById(id)),
  );
  expect(missing).toEqual([]);
});

test('JSON-LD describes the person', async ({ page }) => {
  await page.goto('./');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw ?? '{}');
  expect(data['@type']).toBe('ProfilePage');
  expect(data.mainEntity['@type']).toBe('Person');
  expect(data.mainEntity.name).toBeTruthy();
  expect(data.mainEntity.sameAs).toContain('https://github.com/jonatyum');
});

test('scoreboard is a captioned table with every row', async ({ page }) => {
  await page.goto('./');
  const table = page.getByRole('table', { name: /Trayectoria/ });
  await expect(table).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(12); // header + 11 events
});

test('scoreboard keeps its semantics as cards on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('./');
  const table = page.getByRole('table', { name: /Trayectoria/ });
  await expect(table.getByRole('rowheader', { name: '2025' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Rol' })).toHaveCount(1);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all content is rendered', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('link', { name: /Codeforces/ }).first()).toBeVisible();
  });
});

test('404 page links back home and is not indexed', async ({ page }) => {
  const response = await page.goto('./404.html');
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator('h1')).toHaveText('Página no encontrada');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#experiencia')).toHaveCount(1);
});

test('sitemap is well-formed XML', async ({ request }) => {
  const response = await request.get('./sitemap.xml');
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
});
