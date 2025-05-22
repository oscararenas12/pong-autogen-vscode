const assert = require('assert');
const vscode = require('vscode');

describe('Extension Activation', () => {
    it('should register pongAutogen.startGame command', async () => {
        // 🔑 Activate the extension first
        const ext = vscode.extensions.getExtension('oscar-arenas.pong-autogen');
        await ext.activate();

        // 🔍 Now check registered commands
        const commands = await vscode.commands.getCommands(true);
        const hasCommand = commands.includes('pongAutogen.startGame');

        assert.strictEqual(
            hasCommand,
            true,
            'Expected command pongAutogen.startGame to be registered'
        );
    });
});

it('should launch the WebView when command is executed', async () => {
    await vscode.commands.executeCommand('pongAutogen.startGame');

    const visiblePanels = vscode.window.visibleTextEditors;
    assert.ok(visiblePanels, 'Expected WebView to open (at least one editor visible)');
});

it('should have the correct metadata', async () => {
    const ext = vscode.extensions.getExtension('oscar-arenas.pong-autogen');
    assert.strictEqual(ext.packageJSON.name, 'pong-autogen');
    assert.strictEqual(ext.packageJSON.activationEvents.includes('onCommand:pongAutogen.startGame'), true);
});

