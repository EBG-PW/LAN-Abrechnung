const fs = require("node:fs");
const readline = require('node:readline');
const pg = require('pg');
const env = require('./ecosystem.config.js').apps[0].env;

const pool = new pg.Pool({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
})

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

function executeQuery(command) {
    return new Promise(function (resolve, reject) {
        pool.query(command, (err, result) => {
            if (err) { reject(err) }
            resolve(result);
        });
    });
}


(async function () {
    try {
        console.log('Tool to create a new plug controler:\n');
        const ControlerName = await askQuestion('What is the name of the controler? ');
        const ControlerToken = await askQuestion('What is the token of the controler? ');

        const ControlerList = await executeQuery('SELECT controlerid FROM plugs_controler');
        let ControlerIDArray = ControlerList.rows.map(a => a.controlerid);
        console.log(`\n\nYou currently have those controlers: ${ControlerIDArray.join(', ')}`);

        const ControlerID = await askQuestion('What is the ID of the controler? ');

        if (ControlerIDArray.includes(parseInt(ControlerID, 10))) {
            console.log(`\n\nControler with ID ${ControlerID} already exists`);
            process.exit(1);
        } else {
            await executeQuery(`INSERT INTO plugs_controler (controlerid, controlername, token) VALUES ('${ControlerID}', '${ControlerName}', '${ControlerToken}')`);
            console.log(`\n\nControler with ID ${ControlerID} created`);
            process.exit(0);
        }
    } catch (error) {
        console.log(error);
    }
})();