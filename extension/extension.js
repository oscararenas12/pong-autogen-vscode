const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
    const disposable = vscode.commands.registerCommand('pongAutogen.startGame', function () {
        const panel = vscode.window.createWebviewPanel(
            'pongGame',
            'AutoGen Pong',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'extension', 'media'))
                ]
            }
        );

        const mediaPath = path.join(context.extensionPath, 'extension', 'media');
        const htmlPath = path.join(mediaPath, 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        const mediaUri = panel.webview.asWebviewUri(vscode.Uri.file(mediaPath));
        html = html.replace(/{{mediaBase}}/g, mediaUri.toString());

        panel.webview.html = html;
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};