import { leftPaddle, rightPaddle, paddleHeight } from './game.js';

export function setupAIListener(logToVSCode) {
    async function getRightPaddleMove(ball, paddleY) {
        const paddleCenter = rightPaddle.y + paddleHeight / 2;
        const distance = Math.abs(ball.y - paddleCenter);

        const canvasHeight = 600; // Adjust based on actual canvas height
        const boundaryThreshold = 50;
        const nearTop = rightPaddle.y <= boundaryThreshold;
        const nearBottom = (rightPaddle.y + paddleHeight) >= (canvasHeight - boundaryThreshold);

        const input = {
            paddle: "right",
            ball_position: `Ball Y: ${ball.y}, Paddle Y: ${rightPaddle.y}, Paddle Center: ${paddleCenter}, Ball moving: ${ball.dy > 0 ? "down" : "up"}, Distance from ball: ${distance}, Near top boundary: ${nearTop}, Near bottom boundary: ${nearBottom}`
        };

        logToVSCode(`📤 Sending to AI: ${input.ball_position}`);

        try {
            const res = await fetch("http://localhost:5000/move_paddle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            });

            const raw = await res.text();
            logToVSCode(`🧾 Raw response: ${raw}`);

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                logToVSCode(`❌ JSON parse error: ${err.message}`);
                return "stay";
            }

            logToVSCode(`🤖 AI move: ${data.move}`);
            return data.move;
        } catch (err) {
            logToVSCode(`❌ AI fetch failed: ${err.message}`);
            return "stay";
        }
    }

    window.getRightPaddleMove = getRightPaddleMove;
}
