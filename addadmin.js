const path = require('node:path');
const exec = require('node:child_process').exec;

const fs = require("node:fs");
const readline = require('node:readline');
const { exit } = require('node:process');

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

(async function () {
    try {
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