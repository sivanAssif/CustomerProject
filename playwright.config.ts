import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // הסטור המקומי (קובץ JSON) אינו בטוח להרצה מקבילית — מריצים סדרתית.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'he-IL',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // בדיקות E2E רצות מול הסטור המקומי (קובץ), לא מול Supabase הענן.
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    },
    timeout: 120000,
  },
});
