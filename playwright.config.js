// playwright.config.js
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests/ui',
    projects: [
        {
            name: 'chromium-local',
            use: {
                browserName: 'chromium',
                launchOptions: {
                    args: ['--allow-file-access-from-files']
                }
            }
        }
    ]
});
