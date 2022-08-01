const request = require("request");
const ping = require('ping');
const WebSocket = require('ws');
const args = require('minimist')(process.argv.slice(2));

let debug = false;
const urlR = /^wss?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const command = {
    setting: {
        controler: 'settings_controler',
        plugs: 'settings_plugs'
    },
    plug: {
        power: 'plug_power',
        status: 'plug_status'
    }
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

if (args.h || args.help) {
    console.log("\n\nRequired arguments:")
    console.log("-t, --token: Application Token to access the API")
    console.log("\nOptional arguments:")
    console.log("-h, --help: Show this help");
    console.log("-d, --debug: Enable debug mode");
    console.log("-u, --url: Set the websocket url to connect to\n\n");
    process.exit(0);
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


/* Websocket Logic */
/* Date Protocol: {event: String, data_payload: {}} */

const ws = new WebSocket(url || 'ws://localhost:10027/client', {
    perMessageDeflate: false
});

ws.on('open', function open() {
    ws.send(JSON.stringify({ event: command.setting.controler, data_payload: { token: token } }));
});

ws.on('message', function message(data) {
    log.info(`Received message: ${data}`);

    const message_data = JSON.parse(data);
    const { event, data_payload } = message_data;

    if (event === 'failed') {
        if ('error' in data_payload) {
            log.error(data_payload.error);
            process.exit(1);
        }
    }
});