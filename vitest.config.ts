import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
  test: {
    include: ['e2e/**/*.{test,spec}.{ts,js}'],
    globalSetup: './e2e/teardown.ts',
    browser: {
      headless: true,
      enabled: true,
      screenshotFailures: false,
      provider: webdriverio(),
      // https://vitest.dev/config/browser/webdriverio
      instances: [
        { browser: 'chrome' },
        // { browser: 'firefox' },
        // { browser: 'edge' },
        // { browser: 'safari', headless: false , },
      ],
    },
  },
})
