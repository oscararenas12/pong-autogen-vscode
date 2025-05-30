import { leftPaddle, rightPaddle, paddleHeight } from './game.js';

export function setupAIListener(logToVSCode) {
    async function getPaddleMove(paddleSide, ball, paddleY) {
        const input = {
            paddle: paddleSide,
            ball_position: `Ball Y: ${ball.y}, Paddle Y: ${paddleY}, Ball moving: ${ball.dy > 0 ? "down" : "up"}, Ball dy: ${Math.abs(ball.dy)}`
        };

        logToVSCode(`📤 Sending to ${paddleSide} AI: ${input.ball_position}`);

        try {
            const res = await fetch("http://localhost:5000/move_paddle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            });

            const raw = await res.text();
            logToVSCode(`🧾 ${paddleSide} AI raw response: ${raw}`);

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                logToVSCode(`❌ JSON parse error (${paddleSide}): ${err.message}`);
                return "stay";
            }

            logToVSCode(`🤖 ${paddleSide} AI move: ${data.move}`);
            return data.move;
        } catch (err) {
            logToVSCode(`❌ ${paddleSide} AI fetch failed: ${err.message}`);
            return "stay";
        }
    }

    window.getRightPaddleMove = (ball, paddleY) => getPaddleMove("right", ball, paddleY);
    window.getLeftPaddleMove = (ball, paddleY) => getPaddleMove("left", ball, paddleY);
}
