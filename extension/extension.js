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

        const fixUri = (relativePath) =>
            panel.webview.asWebviewUri(vscode.Uri.file(path.join(mediaPath, relativePath))).toString();

        html = html
            .replace('./js/main.js', fixUri('js/main.js'))
            .replace('./style.css', fixUri('style.css'));

        panel.webview.html = html;

        // Add message listener
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'log':
                        console.log('[Webview]:', message.text);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};