# 🏓 AutoGen Pong (VS Code Extension)

A lightweight VS Code extension that runs a classic Pong game in a WebView — with a twist: the paddles are controlled by AutoGen agents.

## ✨ Features

- 🎮 Canvas-based Pong game (white paddles, black background)
- 🧠 Backend agent logic using Python + Flask + AutoGen
- 🧪 Functional testing setup using Playwright
- 🧱 Clean project structure with extension frontend and agent backend

## 📦 Tech Stack

- VS Code Extension (Vanilla JS)
- Python Flask backend
- Microsoft AutoGen
- Playwright for testing

## 🚧 Status

Environment and structure scaffolded. Game logic, backend agent interaction, and Flask routing to come next.

---
TDD Assistant Prompt:
Rules to follow:
-  Only give me a small code snippet that addresses exactly one behavior or task at a time.
-   Do not show the full program. Only show the minimal code needed for the current step.
-   After giving the snippet, pause and ask if the test passed or if I need help adjusting.
-   When you provide a code snippet, please include the line number where it should be inserted—both the line above and the line below, so I know exactly where to place it.
-   Wait for me to confirm or ask for the next step before continuing.