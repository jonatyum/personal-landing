import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The site is fully self-hosted: any request off localhost is a bug, never let it leave the machine.
test.beforeEach(async ({ context }) => {
  await context.route(/^(?!https?:\/\/localhost[:/])/, (route) => route.abort('blockedbyclient'));
});

test('the English page is served in English, with English section ids', async ({ page }) => {
  await page.goto('./en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('Web development end to end.');
  const h2s = await page.locator('main section > .container h2').allInnerTexts();
  expect(h2s.map((text) => text.trim())).toEqual([
    'Experience',
    'Projects',
    'Track record',
    'About',
    'Education',
    'Contact',
  ]);
  await expect(page.locator('#experience')).toHaveCount(1);
});

test('no Spanish copy is left on the English page', async ({ page }) => {
  await page.goto('./en/');
  const stray = await page.evaluate(() => {
    const text = document.body.innerText;
    // Proper nouns keep their Spanish spelling; these are phrases that must have been translated.
    return ['Desarrollo web', 'Ver proyectos', 'Escríbeme', 'Sobre mí', 'Trayectoria'].filter((phrase) =>
      text.includes(phrase),
    );
  });
  expect(stray).toEqual([]);
});

test('each page links to the other language and declares the alternates', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

  const header = page.locator('.site-header__lang');
  await header.getByRole('link', { name: /English/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await header.getByRole('link', { name: /Español/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('the language switch marks the current page', async ({ page }) => {
  await page.goto('./en/');
  const current = page.locator('.site-header__lang [aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText(/^EN/);
});

test('no axe violations on the English page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./en/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
