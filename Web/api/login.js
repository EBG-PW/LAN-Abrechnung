require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const randomstring = require('randomstring');
const DB = require('@lib/postgres');
const { tokenpermissions } = require('@middleware/tokenVerify')
const { log } = require('@lib/logger');
const bcrypt = require('bcrypt');


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-WebLogin';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const LoginCheck = Joi.object({
    userid: Joi.number().required(),
    password: Joi.string().required()
});

const router = express.Router();

router.get("/login/:UserID", limiter, (reg, res, next) => {
    res.status(200);
    res.sendFile(path.join(__dirname + '../../../' + 'data' + '/Plugin_Login/index.html'));
});


router.get("/login", limiter, (reg, res, next) => {
    res.status(200);
    res.sendFile(path.join(__dirname + '../../../' + 'data' + '/Plugin_Login/index.html'));
});

router.post("/check", limiter, async (reg, res, next) => {
    try {
        const value = await LoginCheck.validateAsync(reg.body);
        DB.get.Guests.ByID(value.userid).then(function (Guest_result) {
            if (typeof Guest_result[0] === "undefined") {
                res.status(401);
                res.json({
                    message: "Falscher Benutzername oder Passwort",
                });
            } else {
                bcrypt.compare(value.password, Guest_result[0].passwort).then(function (result) {
                    if (result) {
                        let source = reg.headers['user-agent']
                        let UserAgent = useragent.parse(source)
                        let IP = reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
                        let WebToken = randomstring.generate({
                            length: process.env.WebTokenLength, //DO NOT CHANCE!!!
                            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                        });
                        //Write new Webtoken
                        DB.write.webtoken.Add(value.userid, Guest_result[0].username, IP, UserAgent.source, WebToken, Guest_result[0].admin, Guest_result[0].lang).then(function (WebToken_respone) {
                            res.status(200);
                            res.json({
                                Token: WebToken,
                            });
                        }).catch(function (error) {
                            log.error(error)
                            res.status(500);
                            res.json({
                                message: "Kritischer Fehler!",
                            });
                        })
                    } else if (!result) { //Not sure why this is !
                        res.status(401);
                        res.json({
                            message: "Falscher Benutzername oder Passwort",
                        });
                    } else {
                        res.status(500);
                        res.json({
                            message: "Kritischer Fehler!",
                        });
                    }
                });
            }
        }).catch(function (error) {
            log.error(error)
            res.status(500);
            res.json({
                message: "Kritischer Fehler!",
            });
        })
    } catch (error) {
        next(error);
    }
});

router.post("/logout", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        DB.del.webtoken.Del(reg.headers['authorization'].replace('Bearer ', '')).then(function (Check) {
            res.status(200);
            res.json({
                Message: "Success"
            });
        }).catch(function (error) {
            log.error(error)
            throw new Error("DBError")
        });
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