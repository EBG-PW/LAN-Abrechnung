require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const DB = require('../../lib/postgres');
const TV = require('../../lib/TokenVerification');


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

const UserList = Joi.object({
    Token: Joi.string().required()
});

const router = express.Router();

router.get("/user", limiter, async (reg, res, next) => {
    try {
        const value = await UserList.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function (Check) {
            if (Check.State === true) {
                DB.get.Guests.ByID(Check.Data.userid).then(function (Guest_response) {
                    res.status(200);
                    res.json({
                        me: Guest_response[0]
                    });
                });
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

router.get("/userlist", limiter, async (reg, res, next) => {
    try {
        const value = await UserList.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function (Check) {
            if (Check.State === true) {
                DB.get.Guests.AllSave().then(function (GuestsList_response) {
                    res.status(200);
                    res.json({
                        GuestsList_response
                    });
                });
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

router.get("/adminuserlist", limiter, async (reg, res, next) => {
    try {
        const value = await UserList.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, true).then(function (Check) {
            if (Check.State === true) {
                DB.get.Guests.All().then(function (GuestsList_response) {
                    res.status(200);
                    res.json({
                        GuestsList_response
                    });
                });
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