import {
    ball,
    startGameLoop,
    initCanvas,
    scores,
    leftPaddle,
    rightPaddle,
    paddleHeight,
    gameOver
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
    const canvas = document.getElementById("pongCanvas");
    const ctx = canvas.getContext("2d");

    const startBtn = document.getElementById("startBtn");

    startBtn.addEventListener("click", () => {
        startBtn.style.display = "none";

        // Reset scores every game start
        scores.left = 0;
        scores.right = 0;

        ball.moving = true;
        gameOver = false;
        logToVSCode("🟢 Start Game");
    });

    setupAIListener(logToVSCode);
    initCanvas(canvas, ctx);
    startGameLoop(canvas, ctx);
});

// Expose objects to global scope for playwright tests
window.ball = ball;
window.scores = scores;
window.leftPaddle = leftPaddle;
window.rightPaddle = rightPaddle;
window.gameOver = gameOver;