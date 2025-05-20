// playwright.config.js
module.exports = {
    testDir: './tests',
    timeout: 10000,
    use: {
        headless: true,
        viewport: { width: 800, height: 600 },
        baseURL: 'http://localhost:5000', // Optional for Flask interaction later
        ignoreHTTPSErrors: true
    },
    projects: [
        {
            name: 'chromium-webview',
            use: { browserName: 'chromium' }
        }
    ]
};
  