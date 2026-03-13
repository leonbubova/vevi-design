import { Page } from '@playwright/test';

export const BREAKPOINTS = {
  TABLET: 600,
  DESKTOP_NAV: 768,
  DESKTOP: 1024,
} as const;

export const VIEWPORTS = {
  'iphone-se': { width: 375, height: 667 },
  'iphone-14': { width: 390, height: 844 },
  'tablet-sm': { width: 600, height: 900 },
  'tablet-lg': { width: 820, height: 1080 },
  'laptop': { width: 1024, height: 768 },
  'desktop': { width: 1440, height: 900 },
} as const;

export function isMobile(viewportWidth: number): boolean {
  return viewportWidth < BREAKPOINTS.TABLET;
}

export function isTablet(viewportWidth: number): boolean {
  return viewportWidth >= BREAKPOINTS.TABLET && viewportWidth < BREAKPOINTS.DESKTOP;
}

export function isDesktop(viewportWidth: number): boolean {
  return viewportWidth >= BREAKPOINTS.DESKTOP;
}

export function hasDesktopNav(viewportWidth: number): boolean {
  return viewportWidth >= BREAKPOINTS.DESKTOP_NAV;
}

export function getViewportWidth(page: Page): number {
  return page.viewportSize()!.width;
}

export function getViewportHeight(page: Page): number {
  return page.viewportSize()!.height;
}
