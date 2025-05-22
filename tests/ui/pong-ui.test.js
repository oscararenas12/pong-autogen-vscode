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
        window.ball.x = -10;
        window.ball.moving = true;
    });

    // ⏳ Wait for score to update
    await page.waitForTimeout(300);

    // 🛑 Pause ball to freeze position for checking
    await page.evaluate(() => {
        window.ball.moving = false;
    });

    // ✅ Assert score increased
    const scoreRight = await page.evaluate(() => window.scores?.right);
    expect(scoreRight).toBeGreaterThan(0);

    // ✅ Check ball position after reset
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

    // 🧪 Simulate 7 scores for the right player
    for (let i = 0; i < 7; i++) {
        await page.evaluate(() => {
            window.ball.x = -10;
            window.ball.moving = true;
        });
        await page.waitForTimeout(150);
    }

    // ⏳ Wait for canvas to render the "Game Over!" message
    await page.waitForTimeout(500);

    // ✅ Check canvas for yellow pixels (used in "🏁 Game Over!" text)
    const hasYellowPixels = await page.evaluate(() => {
        const canvas = document.getElementById("pongCanvas");
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i] === 255 && imageData[i + 1] === 255 && imageData[i + 2] === 0) {
                return true;
            }
        }
        return false;
    });

    expect(hasYellowPixels).toBe(true);
});

test('Retry button resets game and clears Game Over screen', async ({ page }) => {
    const file = path.resolve(__dirname, '../../extension/media/index.html');
    await page.goto('file://' + file);

    const startBtn = page.locator('#startBtn');
    await startBtn.click();

    // Force right player to win
    for (let i = 0; i < 7; i++) {
        await page.evaluate(() => {
            window.ball.x = -10;
            window.ball.moving = true;
        });
        await page.waitForTimeout(150);
    }

    // Wait for "Game Over!" to be drawn
    await page.waitForTimeout(500);

    // Click the Retry button
    const retryBtn = page.locator('#retryBtn');
    await retryBtn.click();

    // Wait a bit for canvas to update
    await page.waitForTimeout(300);

    // ✅ Assert Game Over text is gone
    const hasYellowPixels = await page.evaluate(() => {
        const canvas = document.getElementById("pongCanvas");
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i] === 255 && imageData[i + 1] === 255 && imageData[i + 2] === 0) {
                return true;
            }
        }
        return false;
    });

    expect(hasYellowPixels).toBe(false);

    // ✅ Assert scores reset
    const [leftScore, rightScore] = await page.evaluate(() => [window.scores.left, window.scores.right]);
    expect(leftScore).toBe(0);
    expect(rightScore).toBe(0);

    // ✅ Assert start button is shown again
    await expect(startBtn).toBeVisible();
});
