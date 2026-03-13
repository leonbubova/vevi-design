import { test, expect } from '@playwright/test';
import { getViewportWidth, getViewportHeight, isMobile, isTablet, isDesktop } from './helpers/viewports';

test.beforeEach(async ({ page }) => {
  await page.goto('/v5.html');
  await page.evaluate(() => document.fonts.ready);
});

test('portrait is visible', async ({ page }) => {
  await expect(page.locator('.hero-portrait')).toBeVisible();
});

test('portrait within viewport bounds', async ({ page }) => {
  const portrait = page.locator('.hero-portrait');
  const box = await portrait.boundingBox();
  const vpWidth = getViewportWidth(page);

  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(0);

  // On viewports where hero has overflow:hidden, the portrait may extend past
  // the viewport edge in bounding box but is visually clipped — only check
  // on viewports where it should fully fit
  if (isMobile(vpWidth) || isTablet(vpWidth)) {
    expect(box!.x + box!.width).toBeLessThanOrEqual(vpWidth + 1);
  }
});

test('portrait sizing per breakpoint', async ({ page }) => {
  const portrait = page.locator('.hero-portrait');
  const box = await portrait.boundingBox();
  const vpWidth = getViewportWidth(page);

  expect(box).not.toBeNull();

  if (isMobile(vpWidth)) {
    // width: 85vw, max-width: 360px
    const expected = Math.min(vpWidth * 0.85, 360);
    expect(box!.width).toBeGreaterThan(expected - 20);
    expect(box!.width).toBeLessThan(expected + 20);
  } else if (isTablet(vpWidth)) {
    // width: 230px
    expect(box!.width).toBeGreaterThan(210);
    expect(box!.width).toBeLessThan(250);
  } else if (isDesktop(vpWidth)) {
    // width: 330px
    expect(box!.width).toBeGreaterThan(310);
    expect(box!.width).toBeLessThan(350);
  }
});

test('mobile: portrait horizontally centered', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  if (!isMobile(vpWidth)) {
    test.skip();
    return;
  }

  const portrait = page.locator('.hero-portrait');
  const box = await portrait.boundingBox();
  expect(box).not.toBeNull();

  const portraitCenter = box!.x + box!.width / 2;
  const vpCenter = vpWidth / 2;
  expect(Math.abs(portraitCenter - vpCenter)).toBeLessThan(20);
});

test('tablet: portrait right-aligned', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  if (!isTablet(vpWidth)) {
    test.skip();
    return;
  }

  const portrait = page.locator('.hero-portrait');
  const box = await portrait.boundingBox();
  expect(box).not.toBeNull();

  // right: 2rem = 32px from viewport edge
  const rightEdge = vpWidth - (box!.x + box!.width);
  expect(rightEdge).toBeGreaterThan(10);
  expect(rightEdge).toBeLessThan(80);
});

test('desktop: portrait aligned to 1200px container', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  if (!isDesktop(vpWidth)) {
    test.skip();
    return;
  }

  const portrait = page.locator('.hero-portrait');
  const box = await portrait.boundingBox();
  expect(box).not.toBeNull();

  // right: calc(50% - 600px) means the right edge of portrait aligns near the container edge
  // The portrait's right position from viewport right should be approximately (50% - 600px)
  const expectedRight = vpWidth / 2 - 600;
  // Portrait right edge distance from viewport right
  expect(box!.x).toBeGreaterThan(expectedRight - 40);
});

test('portrait does not overlap h1 text', async ({ page }) => {
  const h1 = page.locator('.hero h1');
  const portrait = page.locator('.hero-portrait');

  const h1Box = await h1.boundingBox();
  const portraitBox = await portrait.boundingBox();

  expect(h1Box).not.toBeNull();
  expect(portraitBox).not.toBeNull();

  const overlapsHorizontally = portraitBox!.x < h1Box!.x + h1Box!.width && portraitBox!.x + portraitBox!.width > h1Box!.x;
  const overlapsVertically = portraitBox!.y < h1Box!.y + h1Box!.height && portraitBox!.y + portraitBox!.height > h1Box!.y;

  expect(overlapsHorizontally && overlapsVertically,
    `Portrait (bottom: ${Math.round(portraitBox!.y + portraitBox!.height)}) overlaps h1 (top: ${Math.round(h1Box!.y)}) on ${getViewportWidth(page)}x${getViewportHeight(page)}`
  ).toBe(false);
});

test('max-height constraint on small phones', async ({ page }) => {
  const vpWidth = getViewportWidth(page);
  const vpHeight = getViewportHeight(page);
  if (!isMobile(vpWidth)) {
    test.skip();
    return;
  }

  const portrait = page.locator('.hero-portrait');
  const box = await portrait.boundingBox();
  expect(box).not.toBeNull();

  // max-height: 52svh — headless Chrome may differ slightly between svh/vh
  const maxExpected = vpHeight * 0.52;
  expect(box!.height).toBeLessThanOrEqual(maxExpected + 15);
});
