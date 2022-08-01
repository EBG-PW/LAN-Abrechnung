const request = require("request");
const ping = require('ping');

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
  }

/**
 * This function will get the power data and status of a plug by plug ID
 * @param {string} IPAdress
 * @returns Array
 */
const GetPlugPower = (IPAdress) => {
    return new Promise(function(resolve, reject) {
            ping.sys.probe(IPAdress, function(isAlive){
                if(isAlive){
                  try{
                    request(`http://${IPAdress}/?m=1`, { json: true }, (err, res, body) => {
                      let out_arr = []; 
                      if(body){
                        let start_arr = getAllIndexes(body, '{m}');
                        let stop_arr = getAllIndexes(body, '{e}');
                        let end_arr = getAllIndexes(body, '{t}');
                        for (i = 0; i < start_arr.length; i++) {
                          out_arr.push(body.substr(start_arr[i]+3, stop_arr[i]-start_arr[i]-3))
                        }
                        resolve(out_arr);
                      }else{
                        reject("Offline: No Body")
                      }
                    });
                  } catch (error) {
                    reject("Offline: Request Failed")
                  }
                }else{
                    reject("Offline: No Ping Response")
                }
            });
    });
}

/**
 * This function will get the power data and status of a plug by plug ID
 * @returns Array
 */
/*
 let SwitchPlugPower = function(PlugID, state) {
    return new Promise(function(resolve, reject) {
        DB.get.plugs.ByID(PlugID).then(function(Plug) {
            if(Plug[0].state_switch_allowed){
                ping.sys.probe(Plug[0].ipaddr, function(isAlive){
                    if(isAlive){
                        let NewToggle;
                        if(state === "true" || state === true){
                            NewToggle = "On"
                        }else{
                            NewToggle = "off"
                        }
                        request(`http://${Plug[0].ipaddr}/cm?cmnd=Power%20${NewToggle}`, { json: true }, (err, res, body) => {
                            if(body){
                                let NewState;
                                if(body.POWER === "OFF"){
                                    NewState = false
                                }else{
                                    NewState = true
                                }
                                DB.update.plugs.UpdateState(PlugID, NewState).then(function(DB_Update_Response) {
                                    resolve(body.POWER)
                                });
                            }else{
                                resolve("Offline: No Body")
                            }
                        });
                        try{
                        }catch (error) {
                            resolve("Offline: Request Failed")
                        }
                    }else{
                        resolve("Offline: No Ping Response")
                    }
                });
            }else{
                resolve("Not_allowed")
            }
        }).catch(error => reject(error));
    });
}
*/
module.exports = {
    GetPlugPower
};