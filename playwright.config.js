const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3333',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx serve . -p 3333',
    url: 'http://localhost:3333',
    reuse: true,
    timeout: 15000,
  },
});