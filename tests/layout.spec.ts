import { test, expect } from '@playwright/test';
import { getViewportWidth } from './helpers/viewports';

test.beforeEach(async ({ page }) => {
  await page.goto('/v5.html');
  await page.evaluate(() => document.fonts.ready);
});

test('no horizontal scrollbar', async ({ page }) => {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasOverflow).toBe(false);
});

test('no element bleeds outside viewport', async ({ page }) => {
  const vpWidth = getViewportWidth(page);

  const bleedingElements = await page.evaluate((vw) => {
    const all = document.querySelectorAll('body *');
    const results: string[] = [];
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      // Skip invisible elements
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
      // Skip elements with zero dimensions
      if (rect.width === 0 || rect.height === 0) continue;
      // Skip fixed/absolute positioned decorative elements (pseudo-element containers, overlays)
      if (style.position === 'fixed') continue;
      // Skip marquee — intentionally overflows with animation
      if (el.closest('.marquee-wrap')) continue;
      // Skip elements clipped by ancestor overflow:hidden
      let ancestor = el.parentElement;
      let clipped = false;
      while (ancestor && ancestor !== document.body) {
        const aStyle = getComputedStyle(ancestor);
        if (aStyle.overflow === 'hidden' || aStyle.overflowX === 'hidden') {
          const aRect = ancestor.getBoundingClientRect();
          if (aRect.right <= vw + 1 && aRect.left >= -1) { clipped = true; break; }
        }
        ancestor = ancestor.parentElement;
      }
      if (clipped) continue;

      if (rect.right > vw + 1 || rect.left < -1) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className ? `.${String(el.className).split(' ').join('.')}` : '';
        const id = el.id ? `#${el.id}` : '';
        results.push(`${tag}${id}${cls} [left:${Math.round(rect.left)}, right:${Math.round(rect.right)}, vw:${vw}]`);
      }
    }
    return results;
  }, vpWidth);

  expect(bleedingElements, `Elements bleeding outside viewport:\n${bleedingElements.join('\n')}`).toHaveLength(0);
});

test('hero-portrait stays within viewport bounds', async ({ page }) => {
  const portrait = page.locator('.hero-portrait');
  await expect(portrait).toBeVisible();

  const vpWidth = getViewportWidth(page);
  const box = await portrait.boundingBox();
  expect(box).not.toBeNull();

  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  // On desktop viewports, portrait may extend past viewport but is clipped by hero overflow:hidden
  if (vpWidth < 1024) {
    expect(box!.x + box!.width).toBeLessThanOrEqual(vpWidth + 1);
  }
});
