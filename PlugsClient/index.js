const request = require("request");
const ping = require('ping');
const WebSocket = require('ws');
const args = require('minimist')(process.argv.slice(2));

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
    process.exit(1);
}

if ('u' in args || 'url' in args) {
    url = args.u || args.url;
    if (isNaN(url)) {
        if (urlR.test(url)) {
            url = url;
        } else {
            console.log("Invalid URL");
            process.exit(1);
        }
    } else {
        console.log("Input was a number: Invalid URL");
        process.exit(1);
    }
}

if (args.h || args.help) {
    console.log("\n\nRequired arguments:")
    console.log("-t, --token: Application Token to access the API")
    console.log("\nOptional arguments:")
    console.log("-h, --help: Show this help");
    console.log("-u, --url: Set the websocket url to connect to\n\n");
    process.exit(0);
}

/* Websocket Logic */
/* Date Protocol: {event: String, data_payload: {}} */

const ws = new WebSocket(url || 'ws://localhost:10027/client', {
    perMessageDeflate: false
});

ws.on('open', function open() {
    ws.send(JSON.stringify({event: command.setting.controler, data_payload: {token: token}}));
});

ws.on('message', function message(data) {
    console.log('received: %s', data);
});