
const util = require('util')
const db = require('../lib/postgres');
const { log } = require('../../Web/lib/logger');
const app = require('uWebSockets.js').App();
const Cache = require('js-object-cache');

//Some variables to keep track of metrics
const StatsCounters = {
  OpenWebSockets: 0,
  InMessagesCounter: 0n,
  OutMessagesCounter: 0n,
  LastInMessagesCounter: 0n,
  LastOutMessagesCounter: 0n,
  InMessagesPerSecond: 0,
  OutMessagesPerSecond: 0,
  CalculatedMessagesCounterinS: 10,
}

// This cache has the controler token as key and stores the controler object as value
const ControlerCache = new Cache();
// This cache has the plugID as key and is used to store flows for each plug
const PlugHistoryCache = new Cache();
//This cache has the userid as key and stores the allowed plugs for each user
const UserCache = new Cache();

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
    gethistory: 'plug_gethistory',
    history: 'plug_history',
  },
  failed: 'failed'
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

const ReBuildUserCache = () => {
  return new Promise((resolve, reject) => {
    db.Plugs.GetAll().then(function (Plugs) {
      for (let i = 0; i < Plugs.length; i++) {
        if (!UserCache.has(Plugs[i].userid)) {
          if (Plugs[i].userid != null) {
            UserCache.set(Plugs[i].userid, []);
            UserCache.get(Plugs[i].userid).push(Plugs[i].plugid);
          }
        } else {
          UserCache.get(Plugs[i].userid).push(Plugs[i].plugid);
        }
      }
      resolve(Plugs);
    }
    ).catch(function (err) {
      reject(err);
    }
    );
  });
}

/* Clients route is used for the PlugClients connecting, the PlugsClient will establish a connection to this appliaction. */
/* It will then recive the Plug IPs that are assinged to him and starts sending all avaible data of those Plugs */
app.ws('/client', {

  idleTimeout: 30,
  maxBackpressure: 1024,
  maxPayloadLength: 2048,
  compression: app.DEDICATED_COMPRESSOR_8KB,

  open: (ws) => {
    log.info(`Opened connection by a plug_client`);
    StatsCounters.OpenWebSockets++;
  },

  close: (ws, code, reason) => {
    log.info(`Closed connection by a plug_client`);
    StatsCounters.OpenWebSockets--;
  },

  pong: (ws, message) => {
    ws.ping(message)
    StatsCounters.OutMessagesCounter++;
  },

  message: (ws, message, isBinary) => {
    StatsCounters.InMessagesCounter++;
    /* Date Protocol: {event: String, data_payload: {}} */

    log.info(`Received client_message: ${Buffer.from(message).toString()}`);

    const message_data = JSON.parse(Buffer.from(message).toString());
    const { event, data_payload } = message_data;

    //If Event is requesting settings of a controler
    if (event === commandClient.setting.controler) {
      //Check if the controler is in the cache
      if (ControlerCache.has(data_payload.token)) {
        db.Plugs.GetByControlerID(ControlerCache.get(data_payload.token).controlerid).then(function (Plugs) {
          //Send plugs to the client
          ws.send(JSON.stringify({ event: commandClient.setting.plugsinfo, data_payload: { plugs: Plugs } }));
          StatsCounters.OutMessagesCounter++;
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
              StatsCounters.OutMessagesCounter++;
              //Subscribe this websocket to the client ID, so user Websockets can send data to the correct client
              ws.subscribe(`/client/id/${ControlerCache.get(data_payload.token).controlerid}`);
            });
          } else {
            //The requested controler dosn´t exist...
            ws.send(JSON.stringify({ event: commandClient.failed, data_payload: { error: 'No Controler found' } }));
            StatsCounters.OutMessagesCounter++;
          }
        }).catch(function (err) {
          console.log(err);
        });

      }
    } else if (event === commandClient.setting.plugs) {

    } else if (event === commandClient.plug.status) {
      //Subscribe this websocket to the client ID, so user Websockets can send data to the correct client
      //ws.subscribe(`/client/id/${ControlerCache.get(data_payload.data.ControlerToken).controlerid}`);
    } else if (event === commandClient.plug.power) {
      if (ControlerCache.has(data_payload.data.ControlerToken)) {
        //Runs when the client sends status of one plug
        if (process.env.enable_influx === 'true' || process.env.enable_influx === true) {
          //Run InfluxDB request
        }
        //Create the flow cache in case it doesn't exist
        if (!PlugHistoryCache.has_flow(data_payload.data.ID)) {
          PlugHistoryCache.create_flow(data_payload.data.ID, process.env.plug_power_cache);
        }
        PlugHistoryCache.set_flow(data_payload.data.ID, data_payload.data);
        StatsCounters.OutMessagesCounter++;
        app.publish(`/plug/id/${data_payload.data.ID}`, JSON.stringify({ event: commandWebuser.plug.power, data_payload: data_payload.data }));
      } else {
        //The requested controler dosn´t exist...
        ws.send(JSON.stringify({ event: commandClient.failed, data_payload: { error: 'Not permitted' } }));
        StatsCounters.OutMessagesCounter++;
      }
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
    StatsCounters.OpenWebSockets++;
    log.info(`Opened connection by a webuser`);
  },

  close: (ws, code, reason) => {
    StatsCounters.OpenWebSockets--;
    log.info(`Closed connection by a webuser`);
  },

  message: (ws, message, isBinary) => {
    StatsCounters.InMessagesCounter++;
    log.info(`Received webuser_message: ${Buffer.from(message).toString()}`);
    const message_data = JSON.parse(Buffer.from(message).toString());
    const { event, data_payload } = message_data;

    if (UserCache.has(data_payload.userid)) {
      if (UserCache.get(data_payload.userid).includes(parseInt(data_payload.plugid, 10))) {
        if (event === commandWebuser.plug.subscribe) {
          //{"event": "subscribe_plugid", "data_payload": {"plugid": "1", "userid": "206921999"}}
          log.info(`${data_payload.userid} Subscribing to plug: ${data_payload.plugid}`);
          ws.subscribe(`/plug/id/${data_payload.plugid}`);
        } else if (event === commandWebuser.plug.gethistory) {
          //{"event": "plug_gethistory", "data_payload": {"plugid": "1", "userid": "206921999"}}
          if (PlugHistoryCache.has_flow(data_payload.plugid)) {
            ws.send(JSON.stringify({ event: commandWebuser.plug.history, data_payload: PlugHistoryCache.get_flow(data_payload.plugid) }));
          } else {
            ws.send(JSON.stringify({ event: commandWebuser.failed, data_payload: { error: 'No history found' } }));
          }
          StatsCounters.OutMessagesCounter++;
        }
      } else {
        ws.send(JSON.stringify({ event: commandWebuser.failed, data_payload: { error: 'Not permitted' } }));
        StatsCounters.OutMessagesCounter++;
      }
    } else {
      ReBuildUserCache().then(function (User) {
        if (UserCache.has(data_payload.userid)) {
          if (UserCache.get(data_payload.userid).includes(parseInt(data_payload.plugid, 10))) {
            if (event === commandWebuser.plug.subscribe) {
              //{"event": "subscribe_plugid", "data_payload": {"plugid": "1", "userid": "206921999"}}
              log.info(`Subscribing to plug: ${data_payload.plugid}`);
              ws.subscribe(`/plug/id/${data_payload.plugid}`);
            } else if (event === commandWebuser.plug.gethistory) {
              //{"event": "plug_gethistory", "data_payload": {"plugid": "1", "userid": "206921999"}}
              if (PlugHistoryCache.has_flow(data_payload.plugid)) {
                ws.send(JSON.stringify({ event: commandWebuser.plug.history, data_payload: PlugHistoryCache.get_flow(data_payload.plugid) }));
              } else {
                ws.send(JSON.stringify({ event: commandWebuser.failed, data_payload: { error: 'No history found' } }));
              }
              StatsCounters.OutMessagesCounter++;
            }
          } else {
            ws.send(JSON.stringify({ event: commandWebuser.failed, data_payload: { error: 'Not permitted' } }));
            StatsCounters.OutMessagesCounter++;
          }
        } else {
          ws.send(JSON.stringify({ event: commandWebuser.failed, data_payload: { error: 'Not permitted' } }));
          StatsCounters.OutMessagesCounter++;
        }
      }).catch(function (err) {
        log.error(err);
      });
    }
  }

});

//Calculate the avrage messages per second
setInterval(function () {
  //calculate diffrence
  const IntMessageDiff = StatsCounters.InMessagesCounter - StatsCounters.LastInMessagesCounter
  const OutMessageDiff = StatsCounters.OutMessagesCounter - StatsCounters.LastOutMessagesCounter

  //Set last value
  StatsCounters.LastInMessagesCounter = StatsCounters.InMessagesCounter;
  StatsCounters.LastOutMessagesCounter = StatsCounters.OutMessagesCounter;

  //Calculate avrage per second
  StatsCounters.InMessagesPerSecond = Number(BigInt(IntMessageDiff) * 100n / BigInt(StatsCounters.CalculatedMessagesCounterinS)) / 100;
  StatsCounters.OutMessagesPerSecond = Number(BigInt(OutMessageDiff) * 100n / BigInt(StatsCounters.CalculatedMessagesCounterinS)) / 100;
}, StatsCounters.CalculatedMessagesCounterinS * 1000);

//Push plugs data to PostgreSQL
setInterval(function () {
  const PlugIds = PlugHistoryCache.keys();
  if (PlugIds.length > 0) {
    for (let i = 0; i < PlugIds.length; i++) {
      const PlugHistory = PlugHistoryCache.get_flow(PlugIds[i].replace('_flow', ''));
      db.Plugs.SetPower(PlugHistory[PlugHistory.length - 1].ID, (PlugHistory[PlugHistory.length - 1].TotalEnergy / 1000).toFixed(3)).then(function (result) {
        log.info(`Plug ${PlugHistory[PlugHistory.length - 1].ID} updated`);
      }).catch(function (err) {
        log.error(err);
      });
    }
  }
}, process.env.write_to_pg_every * 1000);

app.get('/*', (res, req) => {
  res.writeStatus('200 OK').end(`This is a websocket relay for powerplugs!\n\nStats:\nCurrent open sockets ${StatsCounters.OpenWebSockets}\nTotal messages received: ${StatsCounters.InMessagesCounter} Currently: ${StatsCounters.InMessagesPerSecond}/s\nTotal messages send: ${StatsCounters.OutMessagesCounter} Currently: ${StatsCounters.OutMessagesPerSecond}/s\n\nRaw: ${util.inspect(StatsCounters, { showHidden: true, depth: null, colors: false })}`);

})

module.exports = app