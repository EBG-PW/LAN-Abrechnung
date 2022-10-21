require('dotenv').config();
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
const { SendEvent } = require('pm2-ctl')
var path = require('path');
let reqPath = path.join(__dirname, '../../');
const DB = require('../../lib/postgres');
const { tokenpermissions } = require('../middleware/tokenVerify')
const { log } = require('../../lib/logger');
const ecosystem = require('../../../ecosystem.config.js');
const PlugServer_Process_Name = ecosystem.apps[2].name;

let mainconfig, preisliste;

/* Import Config */
if (fs.existsSync(path.join(__dirname, '../', '../', '../', 'config', 'mainconfig.json'))) {
    mainconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', '../', 'config', 'mainconfig.json')));
}
if (fs.existsSync(path.join(__dirname, '../', '../', '../', 'config', 'preisliste.json'))) {
    preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', '../', 'config', 'preisliste.json')));
}

const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-Strom';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const PlugsToggleAllowedStateCheck = Joi.object({
    UserID: Joi.number().required()
});

const setPlugUserCheck = Joi.object({
    username: Joi.string().required(),
    plugid: Joi.number().required()
});

const router = express.Router();

router.get("/PlugsToggleAllowedState", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await PlugsToggleAllowedStateCheck.validateAsync(reg.query);
        if (reg.permissions.write.includes('admin_strom') || reg.permissions.write.includes('admin_all')) {
            DB.write.plugs.toggle_allowed_state(value.UserID).then(function (toggle_response) {
                if (toggle_response.rowCount === 1) {
                    SendEvent.ToProcess(PlugServer_Process_Name, { event: 'PlugsToggleAllowedState', data: { UserID: value.UserID } });
                    res.status(200);
                    res.json({
                        Message: "Success"
                    });
                } else {
                    res.status(501);
                    res.json({
                        Message: "Nothing chanced. This either means the UserID isn´t known, or the user has no plug yet"
                    });
                }
            }).catch(function (error) {
                log.error(error);
                throw new Error("DBError");
            })
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

router.get("/allPlugs", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('admin_strom') || reg.permissions.read.includes('admin_all')) {
            Promise.all([DB.get.plugs.GetAll()]).then(function (responce) {
                const [all_plugs] = responce;
                res.status(200);
                res.json({
                    Message: "Success",
                    Data: all_plugs
                });
            }).catch(function (error) {
                log.error(error);
                throw new Error("DBError");
            })
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/setPlugUser", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.write.includes('admin_strom') || reg.permissions.write.includes('admin_all')) {
            const value = await setPlugUserCheck.validateAsync(reg.body);
            if (value.username === "null") {
                DB.write.plugs.delUserToPlug(value.plugid).then(function (toggle_response) {
                    res.status(200);
                    res.json({
                        Message: "Success"
                    });
                }).catch(function (error) {
                    log.error(error);
                    throw new Error("DBError");
                });
            } else {
                DB.write.plugs.addUserToPlug(value.plugid, value.username).then(function (toggle_response) {
                    if (toggle_response.rowCount === 1) {
                        SendEvent.ToProcess(PlugServer_Process_Name, { event: 'UserPlugLink', data: { username: value.username } });
                        res.status(200);
                        res.json({
                            Message: "Success"
                        });
                    } else {
                        res.status(501);
                        res.json({
                            Message: "Nothing chanced."
                        });
                    }
                }).catch(function (error) {
                    log.error(error);
                    if (error.message.includes("duplicate key value violates unique constraint")) {
                        res.status(405);
                        res.json({
                            Error: "DuplicateKey"
                        });
                    } else if (error.message.includes("violates foreign key constraint")) {
                        res.status(405);
                        res.json({
                            Error: "Unknown/Notallowed User"
                        });
                    } else {
                        throw new Error("DBError");
                    }
                })
            }
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

router.get("/UserKWH", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_strom') || reg.permissions.read.includes('admin_strom') || reg.permissions.read.includes('admin_all')) {
            DB.get.plugs.power.kwh(reg.check.Data.userid).then(function (kwh) {
                if (kwh.rowCount === 1) {
                    res.status(200);
                    res.json({
                        url_websocket: process.env.WebSocketURL,
                        kwh: kwh.rows[0].power_used.toFixed(3),
                        power_start: kwh.rows[0].power_start.toFixed(3),
                        price: preisliste.PauschalKosten.StromKWH.Preis,
                        userid: reg.check.Data.userid,
                        plugid: kwh.rows[0].plugid,
                        graph_length: process.env.plug_power_graph
                    });
                } else {
                    res.status(500);
                    res.json({
                        error: "Keine Ergebnisse"
                    });
                }
            }).catch(function (error) {
                log.error(error);
                throw new Error("DBError");
            })
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

module.exports = {
    router: router,
    PluginName: PluginName,
    PluginRequirements: PluginRequirements,
    PluginVersion: PluginVersion,
    PluginAuthor: PluginAuthor,
    PluginDocs: PluginDocs
};