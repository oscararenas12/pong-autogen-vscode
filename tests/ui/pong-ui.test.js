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

test('Right player scores when ball goes past left wall', async ({ page }) => {
    const file = path.resolve(__dirname, '../../extension/media/index.html');
    await page.goto('file://' + file);

    const button = page.locator('#startBtn');
    await button.click();

    // 🧪 Simulate ball going out of bounds to the left
    await page.evaluate(() => {
        window.ball.x = -20; // ensure it's well past the wall
        window.ball.dx = -3;
        window.ball.moving = true;
    });

    // ⏳ Wait for game loop to process score update
    await page.waitForTimeout(800);

    // 🛑 Stop the ball to freeze game state for assertion
    await page.evaluate(() => {
        window.ball.moving = false;
    });

    // ✅ Assert right player score increased
    const scoreRight = await page.evaluate(() => window.scores?.right);
    expect(scoreRight).toBeGreaterThan(0);

    // ✅ Ball should have reset near center
    const ballX = await page.evaluate(() => window.ball?.x);
    expect(ballX).toBeGreaterThanOrEqual(250);
    expect(ballX).toBeLessThanOrEqual(550);
});

test('Ball bounces off the left paddle', async ({ page }) => {
    const file = path.resolve(__dirname, '../../extension/media/index.html');
    await page.goto('file://' + file);

    const button = page.locator('#startBtn');
    await button.click();

    // 🧪 Position the ball to collide with left paddle
    await page.evaluate(() => {
        window.ball.x = 20; // slightly ahead of left paddle (x: 10 + width)
        window.ball.y = window.leftPaddle.y + 20; // aligned with paddle vertically
        window.ball.dx = -3; // moving left
        window.ball.dy = 0;
        window.ball.moving = true;
    });

    await page.waitForTimeout(300);

    // ✅ Assert ball bounced (dx is now positive)
    const dx = await page.evaluate(() => window.ball.dx);
    expect(dx).toBeGreaterThan(0);
});

test('Game ends after right player reaches 7 points', async ({ page }) => {
    const file = path.resolve(__dirname, '../../extension/media/index.html');
    await page.goto('file://' + file);

    const button = page.locator('#startBtn');
    await button.click();

    // 🧪 Simulate the right player scoring 7 times
    for (let i = 0; i < 7; i++) {
        await page.evaluate(() => {
            window.ball.x = -20;
            window.ball.dx = -3;
            window.ball.moving = true;
        });
        await page.waitForTimeout(500);
        await page.evaluate(() => { window.ball.moving = false; });
    }

    // ⏳ Wait for the game over screen to render
    await page.waitForTimeout(1000);

    // 📸 Check canvas pixels for yellow (#ffff00) indicating game over
    const hasYellowPixels = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (!ctx) return false;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            if (r === 255 && g === 255 && b === 0) return true;
        }
        return false;
    });

    expect(hasYellowPixels).toBe(true);
});


test('Retry button resets game and clears Game Over screen', async ({ page }) => {
    const file = path.resolve(__dirname, '../../extension/media/index.html');
    await page.goto('file://' + file);

    const button = page.locator('#startBtn');
    await button.click();

    // 🧪 Score 7 points to end game
    for (let i = 0; i < 7; i++) {
        await page.evaluate(() => {
            window.ball.x = -20;
            window.ball.dx = -3;
            window.ball.moving = true;
        });
        await page.waitForTimeout(500);
        await page.evaluate(() => { window.ball.moving = false; });
    }

    // ⏳ Wait for Retry button to become visible
    const retryBtn = page.locator('#retryBtn');
    await retryBtn.waitFor({ state: 'visible', timeout: 5000 });
    await retryBtn.click();

    // 🧪 Wait a bit for canvas to update
    await page.waitForTimeout(300);

    // ✅ Check that yellow pixels are gone (Game Over screen cleared)
    const hasYellowPixels = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (!ctx) return false;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
            if (r === 255 && g === 255 && b === 0) return true;
        }
        return false;
    });
    expect(hasYellowPixels).toBe(false);

    // ✅ Check scores reset
    const [left, right] = await page.evaluate(() => [window.scores?.left, window.scores?.right]);
    expect(left).toBe(0);
    expect(right).toBe(0);
});