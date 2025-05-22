import { leftPaddle, rightPaddle } from './game.js';

export function setupAIListener(logToVSCode) {
    window.addEventListener("message", (event) => {
        const msg = event.data;
        if (msg.command === "movePaddles") {
            if (typeof msg.leftY === "number") leftPaddle.y = msg.leftY;
            if (typeof msg.rightY === "number") rightPaddle.y = msg.rightY;
            logToVSCode(`🤖 Paddle positions updated: L=${leftPaddle.y}, R=${rightPaddle.y}`);
        }
    });
}
