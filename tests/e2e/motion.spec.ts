import { expect, test } from '@playwright/test';

// The site is fully self-hosted: any request off localhost is a bug, never let it leave the machine.
test.beforeEach(async ({ context }) => {
  await context.route(/^(?!https?:\/\/localhost[:/])/, (route) => route.abort('blockedbyclient'));
});

test.describe('scroll spy', () => {
  test('marks the section being read and only that one', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('./');

    for (const id of ['proyectos', 'sobre-mi']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page.evaluate(() =>
            [...document.querySelectorAll('[data-spy-link][aria-current]')].map(
              (link) => (link as HTMLElement).dataset.spyLink,
            ),
          ),
        )
        .toEqual([id]);
    }
  });

  test('nothing is marked at the top of the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('./');
    await expect(page.locator('[data-spy-link][aria-current]')).toHaveCount(0);
  });
});

test.describe('staggered lists', () => {
  test('every staggered item ends up fully visible', async ({ page }) => {
    await page.goto('./');
    for (const item of await page.locator('[data-stagger]').all()) {
      await item.scrollIntoViewIfNeeded();
    }
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            [...document.querySelectorAll('[data-stagger] > *')]
              .filter((el) => Number(getComputedStyle(el).opacity) < 1)
              .map((el) => `${el.tagName}.${el.className}`),
          ),
        { timeout: 20000 },
      )
      .toEqual([]);
  });

  // Regression guard: a stagger group outside a revealing block must never be hidden,
  // the same failure mode the reveal styles had before they were gated on reveal-ready.
  test('items stay visible when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('[data-stagger] > *')].filter(
        (el) => Number(getComputedStyle(el).opacity) < 1,
      ).length,
    );
    expect(hidden).toBe(0);
  });
});
