import { test, expect } from '@playwright/test';
import { getViewportWidth, hasDesktopNav, BREAKPOINTS } from './helpers/viewports';

test.beforeEach(async ({ page }) => {
  await page.goto('/v5.html');
  await page.evaluate(() => document.fonts.ready);
});

test('story-layout grid columns', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const columns = await page.locator('.story-layout').evaluate((el) => {
    return getComputedStyle(el).gridTemplateColumns;
  });

  if (vpWidth < BREAKPOINTS.DESKTOP_NAV) {
    // 1 column: single value
    expect(columns.split(' ').length).toBe(1);
  } else {
    // 2 columns: "5fr 6fr" → 2 values
    expect(columns.split(' ').length).toBe(2);
  }
});

test('ethos-grid columns', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const columns = await page.locator('.ethos-grid').evaluate((el) => {
    return getComputedStyle(el).gridTemplateColumns;
  });

  if (vpWidth < BREAKPOINTS.DESKTOP_NAV) {
    // 1 column
    expect(columns.split(' ').length).toBe(1);
  } else {
    // 3 columns
    expect(columns.split(' ').length).toBe(3);
  }
});

test('karte-columns grid columns', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const columns = await page.locator('.karte-columns').evaluate((el) => {
    return getComputedStyle(el).gridTemplateColumns;
  });

  if (vpWidth < BREAKPOINTS.DESKTOP_NAV) {
    // 1 column
    expect(columns.split(' ').length).toBe(1);
  } else {
    // 2 columns
    expect(columns.split(' ').length).toBe(2);
  }
});

test('section padding scales per breakpoint', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const padding = await page.locator('.story.pad-lg').evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      top: parseFloat(style.paddingTop),
      left: parseFloat(style.paddingLeft),
    };
  });

  if (vpWidth < BREAKPOINTS.DESKTOP_NAV) {
    // .pad-lg: 3rem top, 1.5rem sides → ~48px top, ~24px left
    expect(padding.top).toBeLessThan(60);
    expect(padding.left).toBeLessThan(40);
  } else {
    // .pad-lg: 8rem top, 2.5rem sides → ~128px top, ~40px left
    expect(padding.top).toBeGreaterThan(100);
    expect(padding.left).toBeGreaterThan(30);
  }
});
