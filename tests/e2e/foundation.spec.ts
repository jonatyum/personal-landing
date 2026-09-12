import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const DARK_BG = 'rgb(7, 9, 13)';
const LIGHT_BG = 'rgb(247, 249, 252)';

const bodyBackground = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);

// The site is fully self-hosted: any request off localhost is a bug, never let it leave the machine.
test.beforeEach(async ({ context }) => {
  await context.route(/^(?!https?:\/\/localhost[:/])/, (route) => route.abort('blockedbyclient'));
});

test.describe('accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const width of [360, 1440]) {
      test(`no axe violations · ${colorScheme} · ${width}px`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.setViewportSize({ width, height: 900 });
        await page.goto('./');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }

  test('no axe violations with the mobile menu open', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('./');
    await page.getByRole('button', { name: 'Menú' }).click();
    const results = await new AxeBuilder({ page }).include('#site-menu').analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('layout', () => {
  for (const width of [320, 360, 414, 768, 1024, 1440]) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('./');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('inline navigation fits on one line', async ({ page }) => {
    for (const width of [1024, 1100, 1200, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('./');
      await page.evaluate(() => document.fonts.ready);
      const heights = await page.locator('.nav__link').evaluateAll((links) =>
        links.map((link) => Math.round(link.getBoundingClientRect().height)),
      );
      expect(heights.every((h) => h === 44), `at ${width}px: ${heights.join(', ')}`).toBe(true);
      const mark = await page.locator('.site-header .brand .brand__mark').boundingBox();
      expect(mark?.width, `brand mark at ${width}px`).toBeCloseTo(36, 0);
    }
  });

  test('header controls meet the 44px target size', async ({ page }) => {
    for (const width of [360, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('./');
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.site-header a, .site-header button')]
          .filter((el) => el.offsetParent !== null && !el.closest('dialog'))
          .map((el) => ({ text: el.textContent?.trim(), rect: el.getBoundingClientRect() }))
          .filter(({ rect }) => rect.height < 44 || rect.width < 44)
          .map(({ text, rect }) => `${text} ${Math.round(rect.width)}×${Math.round(rect.height)}`),
      );
      expect(small, `at ${width}px`).toEqual([]);
    }
  });
});

test.describe('theme', () => {
  test('follows the system preference when nothing is saved', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('./');
    expect(await bodyBackground(page)).toBe(DARK_BG);
    await page.emulateMedia({ colorScheme: 'light' });
    expect(await bodyBackground(page)).toBe(LIGHT_BG);
  });

  test('applies the saved theme before the page renders', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    // Record the theme the moment <body> is created: nothing can be painted before that.
    await page.addInitScript(() => {
      new MutationObserver((_, observer) => {
        if (!document.body) return;
        (window as any).__themeAtBody = document.documentElement.dataset.theme ?? null;
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto('./');
    expect(await page.evaluate(() => (window as any).__themeAtBody)).toBe('dark');
    expect(await bodyBackground(page)).toBe(DARK_BG);
  });

  test('toggle switches, persists and updates aria-pressed', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('./');
    const toggle = page.locator('.site-header__actions [data-theme-toggle]');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(await bodyBackground(page)).toBe(DARK_BG);
    await page.reload();
    expect(await bodyBackground(page)).toBe(DARK_BG);
    await expect(page.locator('.site-header__actions [data-theme-toggle]')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('keyboard', () => {
  test('first Tab reaches the skip link, which moves focus to main', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('mobile menu opens, traps focus, closes with Escape and restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('./');
    const open = page.getByRole('button', { name: 'Menú' });
    await open.click();
    const menu = page.locator('#site-menu');
    await expect(menu).toBeVisible();
    // A modal dialog lets focus leave to the browser UI (activeElement = body), never to the page behind it.
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const escaped = await page.evaluate(() => {
        const el = document.activeElement;
        return !!el && el !== document.body && !el.closest('#site-menu');
      });
      expect(escaped).toBe(false);
    }
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(open).toBeFocused();
  });

  test('choosing a section in the mobile menu closes it and navigates', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('./');
    await page.getByRole('button', { name: 'Menú' }).click();
    await page.locator('#site-menu').getByRole('link', { name: 'Proyectos' }).click();
    await expect(page.locator('#site-menu')).toBeHidden();
    await expect(page).toHaveURL(/#proyectos$/);
    await expect(page.locator('#proyectos h2')).toBeInViewport();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('section links stay reachable and JS-only controls are hidden', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('./');
    const nav = page.locator('.site-header nav');
    await expect(nav.getByRole('link', { name: 'Contacto' })).toBeVisible();
    await expect(page.locator('[data-menu-open]')).toBeHidden();
    await expect(page.locator('.site-header [data-theme-toggle]').first()).toBeHidden();
  });
});

test('production build does not render pending markers', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByText('PENDIENTE')).toHaveCount(0);
});
