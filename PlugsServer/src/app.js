const db = require('../lib/postgres');
const { log } = require('../../Web/lib/logger');
const app = require('uWebSockets.js').App();

/* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */
setInterval(() => {
  //console.log('publishing');
  app.publish('client', '22C');
}, 100);

/* Clients route is used for the PlugClients connecting, the PlugsClient will establish a connection to this appliaction. */
/* It will then recive the Plug IPs that are assinged to him and starts sending all avaible data of those Plugs */
app.ws('/client', {

  idleTimeout: 30,
  maxBackpressure: 1024,
  maxPayloadLength: 2048,
  compression: app.DEDICATED_COMPRESSOR_8KB,

  open: (ws) => {
    log.info(`Opened connection by a plug_client`);
    ws.subscribe('client');
  },

  pong: (ws, message) => {
    ws.ping(message)
  },

  message: (ws, message, isBinary) => {
    /* Date Protocol: {event: String, data_payload: {}} */

    log.info(`Received message: ${Buffer.from(message).toString()}`);

    const message_data = JSON.parse(Buffer.from(message).toString());
    if (message_data.event === 'settings_controler') {

    } else if (message_data.event === 'settings_plugs') {

    } else if (message_data.event === 'plug_power') {

    } else if (message_data.event === 'plug_status') {

    }

    //ws.send(message, isBinary, true);
  }

});

app.ws('/webuser', {

  idleTimeout: 30,
  maxBackpressure: 1024,
  maxPayloadLength: 2048,
  compression: app.DEDICATED_COMPRESSOR_8KB,

  open: (ws) => {
    console.log('WebSocket opened')
    ws.send('Its open: UwU', (error) => {
      if (error) {
        console.log(error)
      }
    });
  },

  /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
  message: (ws, message, isBinary) => {
    /* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */

    /* Here we echo the message back, using compression if available */
    ws.send(message, isBinary, true);
  }

});

app.get('/*', (res, req) => {

  /* It does Http as well */
  res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');

})

module.exports = app