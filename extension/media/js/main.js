import {
    ball,
    startGameLoop,
    initCanvas,
    scores,
    leftPaddle,
    rightPaddle,
    paddleWidth,
    paddleHeight,
    gameOver,
    resetGameState
} from './game.js';

import { setupAIListener } from './ai.js';

let vscode;
try {
    vscode = acquireVsCodeApi();
} catch (e) {
    vscode = {
        postMessage: (msg) => console.log('📄 Mock log:', msg)
    };
}

function logToVSCode(msg) {
    vscode.postMessage({
        command: 'log',
        text: typeof msg === 'object' ? JSON.stringify(msg) : msg
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.__isUITest = !!navigator.webdriver;
    const canvas = document.getElementById("pongCanvas");
    const ctx = canvas.getContext("2d");

    const startBtn = document.getElementById("startBtn");
    const retryBtn = document.getElementById("retryBtn");
    logToVSCode("🚀 DOMContentLoaded, Game Ready!");

    startBtn.addEventListener("click", () => {
        logToVSCode("🟢 Start Game");
        startBtn.style.display = "none";

        scores.left = 0;
        scores.right = 0;

        ball.moving = true;
        gameOver = false;
    });

    retryBtn.addEventListener("click", () => {
        resetGameState();
        initCanvas(canvas, ctx);

        retryBtn.style.display = "none";
        startBtn.style.display = "block";

        logToVSCode("🔁 Retry clicked");
    });

    setupAIListener(logToVSCode);

    if (window.__isUITest) {
        startGameLoop(canvas, ctx);
    } else {

        async function loop() {
            if (!gameOver && ball.moving) {
                ball.x += ball.dx;
                ball.y += ball.dy;

                if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                    ball.dy *= -1;
                }
                
                let rightMove = "stay";
                if (window.getRightPaddleMove) {
                    const move = await window.getRightPaddleMove(ball, rightPaddle.y);
                    rightMove = String(move).trim().toLowerCase();
                }

                logToVSCode(`📥 Right paddle normalized move: ${rightMove}`);

                if (rightMove === "up") rightPaddle.y -= rightPaddle.speed;
                else if (rightMove === "down") rightPaddle.y += rightPaddle.speed;

                // New left paddle AI logic (similar pattern)
                let leftMove = "stay";
                if (window.getLeftPaddleMove) {
                    const move = await window.getLeftPaddleMove(ball, leftPaddle.y);
                    leftMove = String(move).trim().toLowerCase();
                }

                logToVSCode(`📥 Left paddle normalized move: ${leftMove}`);

                if (leftMove === "up") leftPaddle.y -= leftPaddle.speed;
                else if (leftMove === "down") leftPaddle.y += leftPaddle.speed;

                // Ensure paddles stay within bounds
                rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));
                leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
                if (
                    ball.x + ball.radius > rightPaddle.x &&
                    ball.y > rightPaddle.y &&
                    ball.y < rightPaddle.y + paddleHeight
                ) {
                    ball.dx *= -1;
                    ball.x = rightPaddle.x - ball.radius;
                }

                if (
                    ball.x - ball.radius < leftPaddle.x + paddleWidth &&
                    ball.y > leftPaddle.y &&
                    ball.y < leftPaddle.y + paddleHeight
                ) {
                    ball.dx *= -1;
                    ball.x = leftPaddle.x + paddleWidth + ball.radius;
                }

                if (ball.x < 0) {
                    scores.right++;
                    if (scores.right >= 7) {
                        ball.moving = false;
                        window.gameOver = true;
                    }
                    ball.x = canvas.width / 2;
                    ball.y = canvas.height / 2;
                    ball.dx = -ball.dx;
                }

                if (ball.x > canvas.width) {
                    scores.left++;
                    if (scores.left >= 7) {
                        ball.moving = false;
                        window.gameOver = true;
                    }
                    ball.x = canvas.width / 2;
                    ball.y = canvas.height / 2;
                    ball.dx = -ball.dx;
                }
            }

            initCanvas(canvas, ctx);
            requestAnimationFrame(loop);
        }

        loop();
    }
});

// Expose objects to global scope for playwright tests
window.ball = ball;
window.scores = scores;
window.leftPaddle = leftPaddle;
window.rightPaddle = rightPaddle;
window.gameOver = gameOver;
window.retryBtn = document.getElementById("retryBtn");