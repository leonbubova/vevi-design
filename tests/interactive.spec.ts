import { test, expect } from '@playwright/test';
import { getViewportWidth, hasDesktopNav } from './helpers/viewports';

test.beforeEach(async ({ page }) => {
  await page.goto('/v5.html');
  await page.evaluate(() => document.fonts.ready);
});

test('burger toggles mobile nav open and closed', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  if (hasDesktopNav(vpWidth)) {
    test.skip();
    return;
  }

  const burger = page.locator('#burger');
  const mobileNav = page.locator('#mobileNav');

  // Open
  await burger.click();
  await expect(burger).toHaveClass(/open/);
  await expect(mobileNav).toHaveClass(/open/);

  // Close
  await burger.click();
  await expect(burger).not.toHaveClass(/open/);
  await expect(mobileNav).not.toHaveClass(/open/);
});

test('mobile nav link click closes nav', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  if (hasDesktopNav(vpWidth)) {
    test.skip();
    return;
  }

  const burger = page.locator('#burger');
  const mobileNav = page.locator('#mobileNav');

  await burger.click();
  await expect(mobileNav).toHaveClass(/open/);

  // Click a nav link (not in footer)
  await mobileNav.locator('a[href="#story"]').click();
  await expect(mobileNav).not.toHaveClass(/open/);
});

test('impressum modal opens and closes', async ({ page }) => {
  const modal = page.locator('#impModal');

  // Open via footer link
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.locator('footer a:has-text("Impressum")').click();

  await expect(modal).toHaveClass(/open/);

  // Close by clicking background
  await modal.click({ position: { x: 5, y: 5 } });
  await expect(modal).not.toHaveClass(/open/);
});

test('datenschutz modal opens and closes', async ({ page }) => {
  const modal = page.locator('#dsModal');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.locator('footer a:has-text("Datenschutz")').click();

  await expect(modal).toHaveClass(/open/);

  // Close
  await modal.click({ position: { x: 5, y: 5 } });
  await expect(modal).not.toHaveClass(/open/);
});
