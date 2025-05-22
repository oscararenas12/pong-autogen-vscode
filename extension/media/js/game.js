export const paddleWidth = 10;
export const paddleHeight = 80;

export const leftPaddle = { x: 10, y: 150, speed: 5 };
export const rightPaddle = { x: 770, y: 150, speed: 5 };

export const ball = {
    x: 400,
    y: 300,
    radius: 10,
    dx: 3,
    dy: 2,
    moving: false
};

function drawPaddle(ctx, paddle) {
    ctx.fillStyle = "white";
    ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
}

function drawBall(ctx) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
}

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

export function initCanvas(canvas, ctx) {
    clearCanvas(ctx, canvas);
    drawPaddle(ctx, leftPaddle);
    drawPaddle(ctx, rightPaddle);
    drawBall(ctx);
}

function update(canvas, ctx) {
    if (ball.moving) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.dy *= -1;
        }
    }

    clearCanvas(ctx, canvas);
    drawPaddle(ctx, leftPaddle);
    drawPaddle(ctx, rightPaddle);
    drawBall(ctx);
}

export function startGameLoop(canvas, ctx) {
    function loop() {
        update(canvas, ctx);
        requestAnimationFrame(loop);
    }
    loop();
}
