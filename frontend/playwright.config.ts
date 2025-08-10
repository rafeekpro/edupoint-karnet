import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup projects - these run first
    { 
      name: 'setup-admin', 
      testMatch: /auth\.setup\.ts/,
      testDir: './tests'
    },
    { 
      name: 'setup-therapist', 
      testMatch: /auth\.setup\.ts/,
      testDir: './tests'
    },
    { 
      name: 'setup-client', 
      testMatch: /auth\.setup\.ts/,
      testDir: './tests'
    },
    
    // Test projects with different auth states
    {
      name: 'admin-tests',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
      testMatch: /admin-.*\.spec\.ts/,
    },
    {
      name: 'therapist-tests',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/therapist.json',
      },
      dependencies: ['setup-therapist'],
      testMatch: /therapist-.*\.spec\.ts/,
    },
    {
      name: 'client-tests',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/client.json',
      },
      dependencies: ['setup-client'],
      testMatch: /client-.*\.spec\.ts/,
    },
    
    // Original browser projects for general tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/auth\.setup\.ts/, /admin-.*\.spec\.ts/, /therapist-.*\.spec\.ts/, /client-.*\.spec\.ts/],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: [/auth\.setup\.ts/, /admin-.*\.spec\.ts/, /therapist-.*\.spec\.ts/, /client-.*\.spec\.ts/],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: [/auth\.setup\.ts/, /admin-.*\.spec\.ts/, /therapist-.*\.spec\.ts/, /client-.*\.spec\.ts/],
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});