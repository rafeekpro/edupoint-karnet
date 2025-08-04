import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000, // 60 seconds per test
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    navigationTimeout: 30000, // 30 seconds for navigation
    actionTimeout: 10000, // 10 seconds for actions
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'cd ../frontend && npm start',
      port: 3000,
      reuseExistingServer: true, // Since Docker is already running
    },
    {
      command: 'cd ../backend && uvicorn main:app --reload',
      port: 8000,
      reuseExistingServer: true, // Since Docker is already running
    },
  ],
});