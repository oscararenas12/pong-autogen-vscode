// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests-playwright',
    timeout: 10000,
    retries: 0,
    use: {
        headless: true,
        viewport: { width: 800, height: 600 },
        ignoreHTTPSErrors: true,
        baseURL: 'http://localhost:5000', // Ready for future Flask backend
    },
    projects: [
        {
            name: 'chromium-webview',
            use: {
                browserName: 'chromium'
            }
        }
    ],
    reporter: [['list']]
});
