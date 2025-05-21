const { test, expect } = require('@playwright/test');
const path = require('path');

test('Start Game button appears and disappears on click', async ({ page }) => {
    const htmlPath = path.resolve(__dirname, '../extension/media/index.html');
    await page.goto('file://' + htmlPath);

    const button = page.locator('#startBtn');
    await expect(button).toBeVisible();

    await button.click();
    await expect(button).toBeHidden();
});
  