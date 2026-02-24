// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright E2E 測試配置
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './e2e',
    
    /* 每個測試最多 30 秒 */
    timeout: 30 * 1000,
    
    /* 測試失敗時不重試 (CI 中可改為 2) */
    retries: process.env.CI ? 2 : 0,
    
    /* 並行測試 */
    workers: process.env.CI ? 1 : undefined,
    
    /* Reporter */
    reporter: process.env.CI ? 'github' : 'list',
    
    /* 全域設定 */
    use: {
        /* 基底 URL */
        baseURL: 'http://localhost:3000',
        
        /* 截圖 — 只在失敗時 */
        screenshot: 'only-on-failure',
        
        /* Trace — 只在第一次重試時 */
        trace: 'on-first-retry',
    },

    /* 只用 Chromium */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* 測試前自動啟動 Next.js dev server */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
