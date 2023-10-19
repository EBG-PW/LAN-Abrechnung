require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
var path = require('path');
const randomstring = require('randomstring');
const DB = require('@lib/postgres');
const bcrypt = require('bcrypt');
const { SendEvent } = require('pm2-ctl');
const { log } = require('@lib/logger');
const ecosystem = require('../../../ecosystem.config.js');
//const Web_Process_Name = ecosystem.apps[0].name;
const Telegram_Process_Name = ecosystem.apps[1].name;


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-WebReg';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

//Global Vars
const saltRounds = parseInt(process.env.saltRounds);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const getUserCheck = Joi.object({
    Token: Joi.string().required().max(32)
});

const RegisterdCheck = Joi.object({
    Token: Joi.string().required().max(32),
    Password: Joi.string().required()
});

const router = express.Router();

router.get("/load/:Token", limiter, (reg, res, next) => {
    DB.get.RegToken.ByToken(reg.params.Token).then(function (response) {
        if (response.rows.length === 1) {
            res.status(200);
            res.sendFile(path.join(__dirname + '../../../' + 'data' + '/Plugin_Reg/index.html'));
        } else {
            res.status(401);
            res.sendFile(path.join(__dirname + '../../../' + 'data' + '/Plugin_Reg/401.html'));
        }
    }).catch(function (error) {
        console.log(error)
        res.status(500);
        res.json({
            message: "Databace error",
        });
    })

});

router.get("/getUser", limiter, async (reg, res, next) => {
    try {
        const value = await getUserCheck.validateAsync(reg.query);
        DB.get.RegToken.ByToken(value.Token).then(function (response) {
            if (response.rows.length === 1) {
                res.status(200);
                res.json(
                    response.rows[0]
                );
            } else {
                res.status(401);
                res.json({
                    route: "/getUser",
                    message: "Could not load token"
                });
            }
        }).catch(function (error) {
            console.log(error)
            res.status(500);
            res.json({
                message: "Databace error",
            });
        })
    } catch (error) {
        next(error);
    }
});

router.post("/register", limiter, async (reg, res, next) => {
    try {
        const value = await RegisterdCheck.validateAsync(reg.body);
        DB.get.RegToken.ByToken(value.Token).then(function (regtoken_response) {
            DB.get.Guests.Check.HauptGuest(regtoken_response.rows[0].userid).then(function (hauptgast_response) {
                if (regtoken_response.rows.length === 1) {
                    DB.del.RegToken.DeleteToken(value.Token).then(function (del_response) {
                        if (del_response.rowCount === 1) {
                            bcrypt.hash(value.Password, parseInt(process.env.saltRounds), function (err, hash) {
                                let RegPromiseArray = [];
                                if (hauptgast_response === false) { // When false, then its a guest. If true, its the userid of the hauptgast
                                    RegPromiseArray.push(DB.write.Permissions.SetGroup(regtoken_response.rows[0].userid, "user_group")) // Set user group
                                } else {
                                    // Set permissions for the user that currently tryes to register
                                    RegPromiseArray.push(DB.write.Permissions.SetGroup(regtoken_response.rows[0].userid, "sub_group")) // Set subuser group
                                    if (hauptgast_response.permission_group !== "admin_group") { // If haupt user is admin, he can do everything anyway
                                        console.log(hauptgast_response, regtoken_response.rows[0].userid)
                                        // Set permissions for the Hauptgast, so he can manage the subuser
                                        RegPromiseArray.push(DB.write.Permissions.SetGroup(hauptgast_response.hauptgast_userid, "user_sub_group")) // Set user group with subguest admin permissions
                                    }
                                }
                                RegPromiseArray.push(DB.write.Guests.UpdateCollumByID(regtoken_response.rows[0].userid, 'passwort', hash)) // Set passwort
                                Promise.all(RegPromiseArray).then(function (update_response) {
                                    SendEvent.ToProcess(Telegram_Process_Name, { event: 'NewRegestration', message: { chatid: regtoken_response.rows[0].userid } }).then(function (event_response) {
                                        log.info(`[${PluginName}] Sent Event to Telegram Process`);
                                        res.status(200);
                                        res.json({
                                            message: "Success - Password was set",
                                            userid: regtoken_response.rows[0].userid
                                        });
                                    }).catch(function (err) {
                                        log.error(err)
                                        throw new Error("SendEvent");
                                    });
                                }).catch(function (err) {
                                    log.error(err)
                                    throw new Error("DBError");
                                });
                            });
                        } else {
                            res.status(401);
                            res.json({
                                message: "Token not found",
                            });
                        }
                    });
                } else {
                    res.status(401);
                    res.json({
                        message: "Token not found",
                    });
                }
            }).catch(function (error) {
                console.log(error)
                res.status(500);
                res.json({
                    message: "Databace error",
                });
            })
        }).catch(function (error) {
            console.log(error)
            res.status(500);
            res.json({
                message: "Databace error",
            });
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