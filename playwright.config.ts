import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3939',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'iphone-se',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'iphone-14',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'tablet-sm',
      use: { ...devices['Desktop Chrome'], viewport: { width: 600, height: 900 } },
    },
    {
      name: 'tablet-lg',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1080 } },
    },
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npx serve . -l 3939',
    url: 'http://localhost:3939',
    reuseExistingServer: !process.env.CI,
  },
});
