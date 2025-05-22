// tests/ui/pong-ui.test.js
const { test, expect } = require('@playwright/test');
const path = require('path');

test('Start Game button hides after click', async ({ page }) => {
    const extensionPath = path.resolve(__dirname, '../../extension/media/index.html');
    await page.goto('file://' + extensionPath);

    const button = page.locator('#startBtn');
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toHaveCSS('display', 'none');
});