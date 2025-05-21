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
