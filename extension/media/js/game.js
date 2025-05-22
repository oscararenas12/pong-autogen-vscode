export const paddleWidth = 10;
export const paddleHeight = 80;

const winningScore = 7;
export let gameOver = false;

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

export const scores = {
    left: 0,
    right: 0
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

function drawScores(ctx, canvas) {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(scores.left, canvas.width / 4, 30);
    ctx.fillText(scores.right, (canvas.width * 3) / 4, 30);
    if (gameOver) {
        ctx.fillStyle = 'yellow';
        ctx.font = '40px Arial';
        ctx.fillText('🏁 Game Over!', canvas.width / 2 - 120, canvas.height / 2);
    }
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
    drawScores(ctx, canvas);
}

function resetBall(canvas) {
    // 🛑 Stop if game is already over
    if (gameOver) return;

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * 2;

    if (window.__isUITest) {
        ball.moving = false;
    } else {
        ball.moving = true;
    }
}

// Common drawing function to avoid duplication
function drawGameElements(canvas, ctx) {
    clearCanvas(ctx, canvas);
    drawPaddle(ctx, leftPaddle);
    drawPaddle(ctx, rightPaddle);
    drawBall(ctx);
    drawScores(ctx, canvas);
}

// Modified helper function with different implementation
function handleGameOver(canvas, ctx) {
    // Use a different method to clear the canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw white border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    drawPaddle(ctx, leftPaddle);
    drawPaddle(ctx, rightPaddle);
    drawBall(ctx);

    // Display who won the game
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(scores.left, canvas.width / 4, 30);
    ctx.fillText(scores.right, (canvas.width * 3) / 4, 30);

    // Add game over message with winner information
    ctx.fillStyle = 'yellow';
    ctx.font = '40px Arial';
    ctx.fillText('🏁 Game Over!', canvas.width / 2 - 120, canvas.height / 2);

    const winner = scores.left > scores.right ? 'Left' : 'Right';
    ctx.fillStyle = 'lightgreen';
    ctx.font = '30px Arial';
    ctx.fillText(`${winner} player wins!`, canvas.width / 2 - 100, canvas.height / 2 + 50);

    if (typeof window !== 'undefined' && window.retryBtn) {
        window.retryBtn.style.display = 'block';
    }
}

function updateBallPosition() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function handleWallCollisions(canvas) {
    // Top/bottom wall bounce
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
    }
}

function handlePaddleCollisions() {
    // Left paddle collision
    if (
        ball.x - ball.radius < leftPaddle.x + paddleWidth &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + paddleHeight
    ) {
        ball.dx *= -1;
        ball.x = leftPaddle.x + paddleWidth + ball.radius;
    }

    // Right paddle collision
    if (
        ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + paddleHeight
    ) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.radius;
    }
}

function handleScoring(canvas) {
    // 🚨 Scoring
    if (ball.x < 0) {
        scores.right++;
        if (scores.right >= winningScore) {
            gameOver = true;
            ball.moving = false;
        }
        resetBall(canvas);
    }

    if (ball.x > canvas.width) {
        scores.left++;
        if (scores.left >= winningScore) {
            gameOver = true;
            ball.moving = false;
        }
        resetBall(canvas);
    }
}

function renderGame(canvas, ctx) {
    drawGameElements(canvas, ctx);
}

function update(canvas, ctx) {
    if (gameOver) {
        handleGameOver(canvas, ctx);
        return;
    }

    if (ball.moving) {
        updateBallPosition();
        handleWallCollisions(canvas);
        handlePaddleCollisions();
        handleScoring(canvas);
    }

    renderGame(canvas, ctx);
}

export function startGameLoop(canvas, ctx) {
    function loop() {
        update(canvas, ctx);
        requestAnimationFrame(loop);
    }
    loop();
}

export function resetGameState() {
    scores.left = 0;
    scores.right = 0;

    ball.x = 400;
    ball.y = 300;
    ball.dx = 3;
    ball.dy = 2;
    ball.moving = false;

    leftPaddle.y = 150;
    rightPaddle.y = 150;

    gameOver = false;
}
