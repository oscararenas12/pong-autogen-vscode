
// Setup communication with VS Code extension
let vscode;
try {
    vscode = acquireVsCodeApi();
} catch (e) {
    if (e instanceof Error && e.message.includes('acquireVsCodeApi is not defined')) {
        // Handle the expected exception
        console.log('Running outside VS Code environment, using mock implementation');
        vscode = {
            postMessage: (msg) => {
                console.log('Mock VS Code message:', msg);
            }
        };
    } else {
        // Re-throw the unexpected exception
        throw e;
    }
}

// Log to VS Code or fallback to console
function logToVSCode(message) {
    if (vscode) {
        vscode.postMessage({
            command: 'log',
            text: typeof message === 'object' ? JSON.stringify(message) : message
        });
    } else {
        console.log('VS Code log:', message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("pongCanvas");
    const ctx = canvas.getContext("2d");

    // Draw left paddle
    ctx.fillStyle = "white";
    ctx.fillRect(10, 150, 10, 80); // x, y, width, height

    // Draw canvas border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // ✅ Get button element
    const startBtn = document.getElementById("startBtn");

    // Hide button on click
    startBtn.addEventListener("click", () => {
        startBtn.style.display = "none";
        logToVSCode("🟢 Start Game button clicked.");
    });

    logToVSCode("✅ Left paddle rendered.");
});

