const db = require('../lib/postgres');
const { log } = require('../../Web/lib/logger');
const app = require('uWebSockets.js').App();

const ControlerCache = require('js-object-cache');

const commandClient = {
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
const commandWebuser = {
  plug: {
    subscribe: 'subscribe_plugid',
    power: 'plug_power',
  }
}

const ReBuildControlerCache = () => {
  return new Promise((resolve, reject) => {
    db.Controler.GetAll().then(function (Controler) {
      ControlerCache.set_object('token', Controler);
      resolve(Controler);
    }
    ).catch(function (err) {
      reject(err);
    }
    );
  });
}

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
    //ws.subscribe('client');
  },

  pong: (ws, message) => {
    ws.ping(message)
  },

  message: (ws, message, isBinary) => {
    /* Date Protocol: {event: String, data_payload: {}} */

    log.info(`Received message: ${Buffer.from(message).toString()}`);

    const message_data = JSON.parse(Buffer.from(message).toString());
    const { event, data_payload } = message_data;

    //If Event is requesting settings of a controler
    if (event === commandClient.setting.controler) {
      //Check if the controler is in the cache
      if (ControlerCache.has(data_payload.token)) {
        db.Plugs.GetByControlerID(ControlerCache.get(data_payload.token).controlerid).then(function (Plugs) {
          //Send plugs to the client
          ws.send(JSON.stringify({ event: commandClient.setting.plugsinfo, data_payload: { plugs: Plugs } }));
          //Subscribe this websocket to the client ID, so user Websockets can send data to the correct client
          ws.subscribe(`/client/id/${ControlerCache.get(data_payload.token).controlerid}`);
        });
      } else {
        //Wasn´t in cache, so update it and try again
        ReBuildControlerCache().then(function (Controler) {
          if (ControlerCache.has(data_payload.token)) {
            db.Plugs.GetByControlerID(ControlerCache.get(data_payload.token).controlerid).then(function (Plugs) {
              //Send plugs to the client
              ws.send(JSON.stringify({ event: commandClient.setting.plugsinfo, data_payload: { plugs: Plugs } }));
              //Subscribe this websocket to the client ID, so user Websockets can send data to the correct client
              ws.subscribe(`/client/id/${ControlerCache.get(data_payload.token).controlerid}`);
            });
          } else {
            //The requested controler dosn´t exist...
            ws.send(JSON.stringify({ event: commandClient.failed, data_payload: { error: 'No Controler found' } }));
          }
        }).catch(function (err) {
          console.log(err);
        });

      }
    } else if (event === commandClient.setting.plugs) {

    } else if (event === commandClient.plug.status) {

    } else if (event === commandClient.plug.power) {
      //Runs when the client sends status of one plug
      if (process.env.enable_influx === 'true' || process.env.enable_influx === true) {
        //Run InfluxDB request
      }
      app.publish(`/plug/id/${data_payload.data.ID}`, JSON.stringify({ event: commandWebuser.plug, data_payload: data_payload.data }));
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
    log.info(`Opened connection by a webuser`);
  },

  message: (ws, message, isBinary) => {

    const message_data = JSON.parse(Buffer.from(message).toString());
    const { event, data_payload } = message_data;

    if (event === commandWebuser.plug.subscribe) {
      //{"event": "subscribe_plugid", "data_payload": {"plugid": "1"}}
      log.info(`Subscribing to plug: ${data_payload.plugid}`);
      ws.subscribe(`/plug/id/${data_payload.plugid}`);
    }
  }

});

app.get('/*', (res, req) => {
  /* It does Http as well */
  res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');

})

module.exports = app