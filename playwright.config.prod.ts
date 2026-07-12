import { defineConfig, devices } from '@playwright/test';
 
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  retries: 2,
  workers: 2,
  reporter: 'html',
 
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
 
  // Test production build
  webServer: {
    command: 'npm run build && npm start',
    url: 'http://localhost:3001',
    timeout: 180000,
    reuseExistingServer: false,
  },
 
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});