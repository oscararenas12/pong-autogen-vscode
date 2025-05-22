// tests/index.js
const Mocha = require('mocha');
const path = require('path');

exports.run = function () {
    return new Promise((resolve, reject) => {
        const mocha = new Mocha({ ui: 'bdd', color: true });

        mocha.addFile(path.resolve(__dirname, './vscode/extension-activation.test.js'));

        mocha.run((failures) => {
            if (failures > 0) {
                reject(new Error(`${failures} test(s) failed.`));
            } else {
                resolve();
            }
        });
    });
};
