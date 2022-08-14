const path = require('node:path');
const exec = require('node:child_process').exec;

const fs = require("node:fs");
const readline = require('node:readline');

// Paths
const PlugsServerPath = path.join(__dirname, './PlugsServer');
const TelegramPath = path.join(__dirname, './Telegram');
const WebPath = path.join(__dirname, './Web');
const LocalPath = path.join(__dirname);

// Commands
const NPM_Install = 'npm install';
const YARN_Install = 'yarn install';
const PM2_install = 'npm install pm2 -g';
const PM2_start = 'pm2 start ecosystem.config.js';
const PM2_save = 'pm2 save';

// Functions
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function executeCommand(command, cwd, message) {
    return new Promise(function (resolve, reject) {
        exec(command, { cwd: cwd }, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`);
                return;
            }
            console.log(message);
            resolve();
        }).on('error', (code) => {
            console.log(`child process error with code ${code}`);
            reject();
        })
    });
}

(async function () {
    try {
        // Execute commands
        await executeCommand(YARN_Install, PlugsServerPath, 'Installed PlugsServer dependencies');
        await executeCommand(NPM_Install, TelegramPath, 'Installed Telegram dependencies');
        await executeCommand(NPM_Install, WebPath, 'Installed Web dependencies');

        console.log('\nFinished installing dependencies\n\n');

        if (!fs.existsSync(path.join(__dirname, 'ecosystem.config.js'))) {
            console.log("DUMM")
            fs.copyFile(path.join(__dirname, 'ecosystem.config.js.example'), path.join(__dirname, 'ecosystem.config.js'), (err) => {
                if (err) throw err;
                console.log('Copyed ecosystem.config.js.example and renamed it to ecosystem.config.js');
            });
        }

        await askQuestion('Fill out ecosystem.config.js or verify its correct?');
        const InstallPM2 = await askQuestion('Do you want to use PM2 and want that setup? (y/n)');
        if(InstallPM2 === 'y' || InstallPM2 === 'Y') {
            await executeCommand(PM2_install, LocalPath, 'Installed PM2');
            await executeCommand(PM2_start, LocalPath, 'Started application with PM2');
            await executeCommand(PM2_save, LocalPath, 'Saved process tree PM2');
        }
    } catch (error) {
        console.log(error);
    }
})();