require('dotenv').config();
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
let reqPath = path.join(__dirname, '../../');
const DB = require('../../lib/postgres');
const TV = require('../../lib/TokenVerification');

let mainconfig, preisliste;

/* Import Config */
if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'mainconfig.json'))) {
    mainconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'mainconfig.json')));
}
if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json'))) {
    preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json')));
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
    Token: Joi.string().required(),
    UserID: Joi.number().required()
});

const UserKWHCheck = Joi.object({
    Token: Joi.string().required()
});

const router = express.Router();

router.get("/PlugsToggleAllowedState", limiter, async (reg, res, next) => {
    try {
        const value = await PlugsToggleAllowedStateCheck.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, true).then(function (Check) {
            if (Check.State === true) {
                DB.write.plugs.toggle_allowed_state(value.UserID).then(function (toggle_response) {
                    if (toggle_response.rowCount === 1) {
                        res.status(200);
                        res.json({
                            Message: "Sucsess"
                        });
                    } else {
                        res.status(500);
                        res.json({
                            Message: "Nothing chanced. This either means the UserID isn´t known, or the user has no plug yet"
                        });
                    }
                }).catch(function (error) {
                    res.status(500);
                    console.log(error)
                })
            } else {
                res.status(401);
                res.json({
                    Message: "Token invalid"
                });
            }
        }).catch(function (error) {
            res.status(500);
            console.log(error)
        })
    } catch (error) {
        next(error);
    }
});

router.get("/UserKWH", limiter, async (reg, res, next) => {
    try {
        const value = await UserKWHCheck.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function (Check) {
            if (Check.State === true) {
                DB.get.plugs.power.kwh(Check.Data.userid).then(function (kwh) {
                    if (kwh.rowCount === 1) {
                        res.status(200);
                        res.json({
                            kwh: kwh.rows[0].diff.toFixed(2),
                            price: preisliste.PauschalKosten.StromKWH.Preis
                        });
                    } else {
                        res.status(500);
                        res.json({
                            error: "Keine Ergebnisse"
                        });
                    }
                }).catch(function (error) {
                    res.status(500);
                    console.log(error)
                })
            } else {
                res.status(401);
                res.json({
                    Message: "Token invalid"
                });
            }
        }).catch(function (error) {
            res.status(500);
            console.log(error)
        })
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