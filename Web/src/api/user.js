require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const DB = require('../../lib/postgres');
const TV = require('../../lib/TokenVerification');
const { tokenpermissions } = require('../middleware/tokenVerify')
const { log } = require('../../lib/logger');


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-User';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const router = express.Router();

router.get("/user", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_user') || reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.ByID(reg.check.Data.userid).then(function (Guest_response) {
                res.status(200);
                res.json({
                    me: Guest_response[0]
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

router.get("/userlist", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_user') || reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.AllSave().then(function (GuestsList_response) {
                res.status(200);
                res.json({
                    GuestsList_response
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

router.get("/adminuserlist", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.All().then(function (GuestsList_response) {
                res.status(200);
                res.json({
                    GuestsList_response
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

module.exports = {
    router: router,
    PluginName: PluginName,
    PluginRequirements: PluginRequirements,
    PluginVersion: PluginVersion,
    PluginAuthor: PluginAuthor,
    PluginDocs: PluginDocs
};