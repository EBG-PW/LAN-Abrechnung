const path = require('node:path');
const exec = require('node:child_process').exec;

const fs = require("node:fs");
const readline = require('node:readline');
const { exit } = require('node:process');

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

        const MainconfigQuestion = await askQuestion('Did you fill out /config/mainconfig.json? (y/n)');
        if (MainconfigQuestion.toLowerCase() === 'n') {
            console.log('Please fill out /config/mainconfig.json and restart the installation');
            exit(1);
        }

        if (!fs.existsSync(path.join(__dirname, 'ecosystem.config.js'))) {
            fs.copyFile(path.join(__dirname, 'ecosystem.config.js.example'), path.join(__dirname, 'ecosystem.config.js'), (err) => {
                if (err) throw err;
                console.log('Copyed ecosystem.config.js.example and renamed it to ecosystem.config.js');
            });
        }

        await askQuestion('Fill out ecosystem.config.js or verify its correct?');
        const InstallPM2 = await askQuestion('Do you want to use PM2 and want that setup? (y/n)');
        if (InstallPM2 === 'y' || InstallPM2 === 'Y') {
            await executeCommand(PM2_install, LocalPath, 'Installed PM2');
            await executeCommand(PM2_start, LocalPath, 'Started application with PM2');
            await executeCommand(PM2_save, LocalPath, 'Saved process tree PM2');
        }

        // If PM2 was not selected, ask if application is running anyway
        if (InstallPM2.toLowerCase() === 'n') {
            const IsRunning = await askQuestion('Is the application running? (y/n)');
            if (IsRunning.toLowerCase() === 'n') {
                console.log('Please start the application');
            }
        }

        // Register first user and then give admin
        await askQuestion('Please register via the telegram bot and then continue');
        const mainconfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/mainconfig.json')));
        const AskAdmin = await askQuestion(`Do you want to give admin rights to ${mainconfig.SudoUser}? (y/n)`);
        if (AskAdmin.toLowerCase() === 'y') {
            const pg = require('./Web/node_modules/pg');
            const permission_groups = require('./config/permission_groups');
            const env = require('./ecosystem.config.js').apps[0].env;
            const pool = new pg.Pool({
                user: env.DB_USER,
                host: env.DB_HOST,
                database: env.DB_NAME,
                password: env.DB_PASSWORD,
                port: env.DB_PORT,
            })

            function executeQuery(command) {
                return new Promise(function (resolve, reject) {
                    pool.query(command, (err, result) => {
                        if (err) { reject(err) }
                        resolve(result);
                    });
                });
            }

            const SetPermissionGroupToUser = function (userid, permission_group) {
                return new Promise(function (resolve, reject) {
                  if (permission_group in permission_groups) {
                    let result_list = [];
                    pool.query(`DELETE FROM guests_permissions WHERE userid = $1`, [
                      userid
                    ], (err, result) => {
                      if (err) { reject(err) }
                      for (const permission in permission_groups[permission_group].permissions) {
                        pool.query(`INSERT INTO guests_permissions(userid, permission, read, write) VALUES ($1,$2,$3,$4)`, [
                          userid, permission, permission_groups[permission_group].permissions[permission].read, permission_groups[permission_group].permissions[permission].write
                        ], (err, result) => {
                          if (err) { reject(err) }
                          result_list.push(result);
                        });
                      };
                      pool.query(`UPDATE guests SET permission_group = $2 WHERE userid = $1`, [
                        userid, permission_group
                      ], (err, result) => {
                        if (err) { reject(err) }
                        result_list.push(result);
                        resolve(result_list);
                      });
                    });
                  } else {
                    reject(new Error('Permission group not found'));
                  }
                });
              }

            Promise.all([executeQuery(`UPDATE guests SET admin = true WHERE userid = '${mainconfig.SudoUser}'`), SetPermissionGroupToUser(mainconfig.SudoUser, 'admin_group')]).then(() => {
                console.log(`Gave admin rights to ${mainconfig.SudoUser}`);
                exit(0);
            });
        }

    } catch (error) {
        console.log(error);
    }
})();