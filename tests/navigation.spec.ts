import { test, expect } from '@playwright/test';
import { getViewportWidth, hasDesktopNav } from './helpers/viewports';

test.beforeEach(async ({ page }) => {
  await page.goto('/v5.html');
  await page.evaluate(() => document.fonts.ready);
});

test('burger visible on mobile, hidden on desktop', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const burger = page.locator('.burger');

  if (hasDesktopNav(vpWidth)) {
    await expect(burger).toBeHidden();
  } else {
    await expect(burger).toBeVisible();
  }
});

test('nav-links hidden on mobile, visible on desktop', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const navLinks = page.locator('.nav-links');

  if (hasDesktopNav(vpWidth)) {
    const display = await navLinks.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('flex');
  } else {
    const display = await navLinks.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  }
});

test('nav-cta hidden on mobile, visible on desktop', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const navCta = page.locator('.nav-cta');

  if (hasDesktopNav(vpWidth)) {
    await expect(navCta).toBeVisible();
  } else {
    await expect(navCta).toBeHidden();
  }
});

test('scrolled class after 60px scroll', async ({ page }) => {
  const nav = page.locator('#nav');

  // Initially no .scrolled
  await expect(nav).not.toHaveClass(/scrolled/);

  // Scroll past threshold
  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForTimeout(100);
  await expect(nav).toHaveClass(/scrolled/);
});

test('scrolled class removed on scroll back to top', async ({ page }) => {
  const nav = page.locator('#nav');

  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForTimeout(100);
  await expect(nav).toHaveClass(/scrolled/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  await expect(nav).not.toHaveClass(/scrolled/);
});
