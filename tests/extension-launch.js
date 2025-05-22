// tests/extension-launch.js
const path = require('path');
const { runTests } = require('@vscode/test-electron');

async function main() {
    const mode = process.argv[2] || 'mocha'; // default to mocha
    const testEntry =
        mode === 'webview'
            ? './vscode-entrypoint.js'
            : './index.js';

    try {
        console.log(`🚀 Launching VS Code Extension Test in "${mode}" mode...`);
        await runTests({
            extensionDevelopmentPath: path.resolve(__dirname, '../'),
            extensionTestsPath: path.resolve(__dirname, testEntry),
        });
    } catch (err) {
        console.error(`❌ Failed to run ${mode} tests`, err);
        process.exit(1);
    }
}

main();