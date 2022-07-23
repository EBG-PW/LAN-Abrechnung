require('dotenv').config();
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
let reqPath = path.join(__dirname, '../../');
const DB = require('../../lib/postgres');
const { tokenpermissions } = require('../middleware/tokenVerify')
const { log } = require('../../lib/logger');

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
    UserID: Joi.number().required()
});

const router = express.Router();

router.get("/PlugsToggleAllowedState", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await PlugsToggleAllowedStateCheck.validateAsync(reg.query);
        if (reg.permissions.read.includes('admin_strom') || reg.permissions.read.includes('admin_all')) {
            DB.write.plugs.toggle_allowed_state(value.UserID).then(function (toggle_response) {
                if (toggle_response.rowCount === 1) {
                    res.status(200);
                    res.json({
                        Message: "Sucsess"
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

router.get("/UserKWH", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_strom') || reg.permissions.read.includes('admin_strom') || reg.permissions.read.includes('admin_all')) {
            DB.get.plugs.power.kwh(reg.check.Data.userid).then(function (kwh) {
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