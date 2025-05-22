import { ball, startGameLoop, initCanvas } from './game.js';
import { setupAIListener } from './ai.js';

// VS Code API setup
let vscode;
try {
    vscode = acquireVsCodeApi();
} catch (e) {
    console.error('Error acquiring VS Code API:', e);
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
        ball.moving = true;
        logToVSCode("🟢 Start Game");
    });

    setupAIListener(logToVSCode);
    initCanvas(canvas, ctx);
    startGameLoop(canvas, ctx);
});
