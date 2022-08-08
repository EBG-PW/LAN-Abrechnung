const request = require("request");
const ping = require('ping');
const WebSocket = require('ws');
const args = require('minimist')(process.argv.slice(2));

let ws; //Websocket Variable
const ws_connectiontime = 10 * 1000; //The time that a reconnect should take max.
let ws_connected = false;
let ws_connecting = false;
let ws_connection_error_counter = 1;
let ws_connection_error_max = 3;

const PlugCache = require('js-object-cache');

let debug = false;
const urlR = /^wss?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const command = {
    setting: {
        controler: 'settings_controler',
        plugs: 'settings_plugs',
        plugsinfo: 'settings_plug_info'
    },
    plug: {
        power: 'plug_power',
        status: 'plug_status'
    },
    failed: 'failed'
}

let token, url;

/* Start Arguments Logic */

if ('t' in args || 'token' in args) {
    token = args.t || args.token;
} else {
    console.log("No token provided");
    process.exit(3);
}

if ('u' in args || 'url' in args) {
    url = args.u || args.url;
    if (isNaN(url)) {
        if (urlR.test(url)) {
            url = url;
        } else {
            console.log("Invalid URL");
            process.exit(2);
        }
    } else {
        console.log("Input was a number: Invalid URL");
        process.exit(2);
    }
}

if ('d' in args || 'debug' in args) {
    debug = true;
}

if ('r' in args || 'retrys' in args) {
    ws_connection_error_max = args.r || args.retrys;
}

if (args.h || args.help) {
    console.log("\n\nRequired arguments:")
    console.log("-t, --token: Application Token to access the API")
    console.log("\nOptional arguments:")
    console.log("-h, --help: Show this help");
    console.log("-d, --debug: Enable debug mode");
    console.log("-r, --retrys: Retrys to connect to the websocket");
    console.log("-u, --url: Set the websocket url to connect to\n\n");
    process.exit(0);
}

/* Generic funktions */

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

function convertBool(bool) {
    if (bool) {
        return true;
    } else {
        return false;
    }
}

/* PowerPlug Tasmota Functions */

/**
 * This function will get the power data and status of a plug by IP
 * @param {string} IPAdress
 * @returns Array
 */
const GetPlugPower = (IPAdress) => {
    return new Promise(function (resolve, reject) {
        ping.sys.probe(IPAdress, function (isAlive) {
            if (isAlive) {
                try {
                    request(`http://${IPAdress}/?m=1`, { json: true }, (err, res, body) => {
                        let out_arr = [];
                        out_arr.push(IPAdress);
                        if (body) {
                            let start_arr = getAllIndexes(body, '{m}');
                            let stop_arr = getAllIndexes(body, '{e}');
                            //Get ON / OFF State
                            if (body.includes('ON')) {
                                out_arr.push(true);
                            } else if (body.includes('OFF')) {
                                out_arr.push(false);
                            } else {
                                out_arr.push(null);
                            }
                            //Get all data 
                            for (i = 0; i < start_arr.length; i++) {
                                out_arr.push(body.substr(start_arr[i] + 3, stop_arr[i] - start_arr[i] - 3,));
                            }
                            resolve(out_arr);
                        } else {
                            reject("Offline: No Body: " + IPAdress);
                        }
                    });
                } catch (error) {
                    reject("Offline: Request Failed: " + IPAdress)
                }
            } else {
                reject("Offline: No Ping Response: " + IPAdress)
            }
        });
    });
}

/**
 * This function will set the state of a plug by IP
 * @param {string} IPAdress
 * @param {boolean} state
 * @returns Array
 */
const SwitchPlugPower = (IPAdress, state) => {
    return new Promise(function (resolve, reject) {
        ping.sys.probe(IPAdress, function (isAlive) {
            if (isAlive) {
                let NewToggle;
                if (state === "true" || state === true) {
                    NewToggle = "On"
                } else {
                    NewToggle = "off"
                }
                request(`http://${IPAdress}/cm?cmnd=Power%20${NewToggle}`, { json: true }, (err, res, body) => {
                    if (body) {
                        let NewState;
                        if (body.POWER === "OFF") {
                            NewState = false
                        } else {
                            NewState = true
                        }
                        resolve(NewState)
                    } else {
                        resolve("Offline: No Body: ")
                    }
                });
                try {
                } catch (error) {
                    resolve("Offline: Request Failed: ")
                }
            } else {
                resolve("Offline: No Ping Response: ")
            }
        });
    });
}

/* Logging Function */

function getTimestamp() {
    const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();

    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${pad(d.getFullYear(), 4)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * @param {string} level Loglevel of the to log text
 * @param {string} text Text to log
 */
const logger = function (level, text) {
    if (level === 'error') { console.log(`[${getTimestamp()}] \x1b[31m[E]\x1b[0m`, text) }
    if (level === 'warning') { console.log(`[${getTimestamp()}] \x1b[33m[W]\x1b[0m`, text) }
    if (debug && level === 'info') { console.log(`[${getTimestamp()}] \x1b[32m[I]\x1b[0m`, text) }
    if (level === 'system') { console.log(`[${getTimestamp()}] \x1b[36m[S]\x1b[0m`, text) }
}

/**
 * logs an error to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logError = (text) => logger('error', text);

/**
 * logs a warning to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logWarning = (text) => logger('warning', text);

/**
 * logs a info to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logInfo = (text) => logger('info', text);

/**
 * logs an system message to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logSystem = (text) => logger('system', text);

const log = {
    error: logError,
    warning: logWarning,
    info: logInfo,
    system: logSystem,
}

/* IntervalFunction */

const check = () => {
    if (ws_connected) { //Verify client is still connected to websocket relay
        const PlugCacheIPs = PlugCache.keys()
        let CheckedIPs = [];
        for (let i = 0; i < PlugCacheIPs.length; i++) {
            CheckedIPs.push(GetPlugPower(PlugCacheIPs[i]));
        }

        Promise.allSettled(CheckedIPs).then(function (results) {
            let Success = 0;
            for (let i = 0; i < results.length; i++) {
                if (results[i].status === 'fulfilled') {
                    Success++; //Count successful requests
                    const CacheState = PlugCache.get(results[i].value[0]);
                    const data = {
                        ControlerToken: token,
                        ID: CacheState.plugid,
                        IP: results[i].value[0],
                        ON: convertBool(results[i].value[1]),
                        Voltage: parseInt(results[i].value[2].replace(/\D/g, '')),
                        Current: parseFloat(results[i].value[3].replace(/\D/g, '')),
                        Power: parseInt(results[i].value[4].replace(/\D/g, '')),
                        TodayEnergy: parseFloat(results[i].value[8].replace(/\D/g, '')),
                        YesterdayEnergy: parseFloat(results[i].value[9].replace(/\D/g, '')),
                        TotalEnergy: parseFloat(results[i].value[10].replace(/\D/g, '')),
                        PowerFactor: parseFloat(results[i].value[7].replace(/\D/g, '')),
                    }
                    //Ensure Plugs are off if they are not allowed to be on
                    if ((CacheState.allowed_state === false || CacheState.allowed_state === 'false') && (data.ON === true || data.ON === 'true')) { //Run if allowed_state is false
                        log.info(`${data.IP} is not allowed to be ON`);
                        SwitchPlugPower(data.IP, false).catch(error => log.error(error));
                    }
                    ws.send(JSON.stringify({ event: command.plug.power, data_payload: { data } }));
                } else {
                    log.error(`${results[i].reason}`);
                }
            }
            log.info(`${Success}/${results.length} Plugs checked`);
        });
    }
}

/* Websocket Logic */
/* Date Protocol: {event: String, data_payload: {}} */
const ConnectWS = () => {
    ws = null;
    ws = new WebSocket(url || 'ws://localhost:10027/client', {
        perMessageDeflate: false
    });

    ws.on('open', function open() {
        log.system(`Connected to server: ${url || 'ws://localhost:10027/client'}`);
        ws_connection_error_counter = 1;
        ws_connected = true;
        ws_connecting = false;
        ws.send(JSON.stringify({ event: command.setting.controler, data_payload: { token: token } }));
    });

    ws.on('message', function message(data) {
        log.info(`Received message: ${data}`);

        const message_data = JSON.parse(data);
        const { event, data_payload } = message_data;

        if (event === command.failed) {
            if ('error' in data_payload) {
                log.error(data_payload.error);
                process.exit(1);
            }
        } else if (event === command.setting.plugsinfo) {
            PlugCache.set_object('ipaddr', data_payload.plugs);
            log.system(`Resived data to monitor ${PlugCache.keys().length} plugs`);
        }
    });

    ws.on('close', function close() {
        if (ws_connected) {
            log.system(`Disconnected from server: ${url || 'ws://localhost:10027/client'}`);
        }
        ws_connected = false;
    });

    ws.on('error', function error(error) {
        if (error.code === 'ECONNREFUSED') {
            if (ws_connection_error_counter < ws_connection_error_max) {
                ws_connection_error_counter++;
            } else {
                log.error(`Connection to server failed ${ws_connection_error_counter}/${ws_connection_error_max} times: ${url || 'ws://localhost:10027/client'}`);
                process.exit(1);
            }
        } else {
            log.error(error);
        }
    });
}

setInterval(() => {
    if (ws_connected) {
        check();
    } else {
        if (!ws_connecting) {
            log.system(`Connecting to server: ${url || 'ws://localhost:10027/client'}`);
            setTimeout(() => {
                ws_connecting = false;
            }, ws_connectiontime);
            ConnectWS();
        }
    }
}, 1000);