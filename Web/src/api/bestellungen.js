require('dotenv').config();
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const SanitizeHtml = require('sanitize-html');
const Joi = require('joi');
var path = require('path');
const DB = require('../../lib/postgres');
const { tokenpermissions } = require('../middleware/tokenVerify');
const { SendEvent } = require('pm2-ctl');
const { log } = require('../../lib/logger');
const randomstring = require('randomstring');
const ecosystem = require('../../../ecosystem.config.js');
//const Web_Process_Name = ecosystem.apps[0].name;
const Telegram_Process_Name = ecosystem.apps[1].name;

const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-Bestellungen';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const customJoi = Joi.extend((joi) => {
    return {
        type: 'string',
        base: joi.string(),
        rules: {
            htmlStrip: {

                validate(value) {

                    return SanitizeHtml(value, {
                        allowedTags: [],
                        allowedAttributes: {},
                    });
                },
            },
        },
    };
});

let mainconfig, preisliste;

/* Import Config */
if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'mainconfig.json'))) {
    mainconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'mainconfig.json')));
}
if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json'))) {
    preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json')));
}

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const NewOderCheck = Joi.object({
    EssenListe: Joi.string().required(),
    Zeit: Joi.string().required()
});

const GetUserOrderCheck = Joi.object({
    orderid: customJoi.string().required()
});

const UserOrderCheck = Joi.object({
    orderid: customJoi.string().required(),
    article: customJoi.string().required(),
    price: Joi.number().required(),
    Amount: Joi.number().required()
});

const switchOrderStateByKeyCheck = Joi.object({
    key: customJoi.string().required()
});

const router = express.Router();

router.post("/new", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await NewOderCheck.validateAsync(reg.body);
        if (reg.permissions.write.includes('admin_bestellungen') || reg.permissions.write.includes('admin_all')) {
            let ID = randomstring.generate({
                length: 32,
                charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
            });
            let Zeit = new Date().getTime() + (value.Zeit * 60 * 1000)
            let ZeitString = new Date(Zeit);
            //check if TIme is in the future
            if (ZeitString > new Date().getTime()) {
                DB.write.order.AddOrder(value.EssenListe, ID, ZeitString).then(function (response) {

                    const SendToTelegramData = {
                        EssenListe: value.EssenListe,
                        Zeit: new Date(Zeit).toLocaleString('de-DE') + ':' + new Date(Zeit).getMilliseconds(),
                        ID: ID,
                        WebPanelURL: process.env.WebPanelURL
                    }
                    SendEvent.ToProcess(Telegram_Process_Name, { event: 'NewOrder', message: SendToTelegramData }).then(function (response) {
                        log.info(`[${PluginName}] Sent Event to Telegram Process`);
                        res.status(200);
                        res.json({
                            message: "Success",
                        });
                    }).catch(function (err) {
                        log.error(err)
                        throw new Error("SendEvent");
                    });
                }).catch(function (error) {
                    log.error(error);
                    throw new Error("DBError");
                })
            } else {
                res.status(400);
                res.json({
                    message: "Time MUST be in the Future",
                });
            }
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/newUserOrder", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await UserOrderCheck.validateAsync(reg.body);
        if (reg.permissions.write.includes('user_bestellungen') || reg.permissions.write.includes('admin_bestellungen') || reg.permissions.write.includes('admin_all')) {
            DB.get.order.GetOrder(value.orderid).then(function (Order_Response) {
                //Handle if the OrderID was not found
                if (Order_Response.rows.length === 0) {
                    res.status(404);
                    res.json({
                        Message: "Order not found"
                    });
                } else {
                    if (Order_Response.rows[0].timeuntil > new Date().getTime()) {
                        let OrderKey = randomstring.generate({
                            length: 32,
                            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                        });
                        DB.write.order.AddOrderArticle(reg.check.Data.userid, value.article, value.Amount, Number(value.price) * Number(value.Amount), value.orderid, OrderKey).then(function (AddOrderArticle_Response) {
                            res.status(200);
                            res.json({
                                Message: "Success"
                            });
                        }).catch(function (error) {
                            log.error(error);
                            throw new Error("DBError");
                        })
                    } else {
                        res.status(410);
                        res.json({
                            Message: "Time not valid anymore"
                        });
                    }
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

router.get("/getUserOrders", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await GetUserOrderCheck.validateAsync(reg.query);
        if (reg.permissions.read.includes('admin_bestellungen') || reg.permissions.read.includes('admin_all')) {
            DB.get.order.GetOrderList(value.orderid, false).then(function (GetOrder_response) {
                res.status(200);
                res.json({
                    GetOrder_response: GetOrder_response.rows
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

router.get("/getUserOrdersForToken", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await GetUserOrderCheck.validateAsync(reg.query);
        if (reg.permissions.read.includes('user_bestellungen') || reg.permissions.read.includes('admin_bestellungen') || reg.permissions.read.includes('admin_all')) {
            DB.get.order.GetOrderByOrderID(value.orderid, reg.check.Data.userid).then(function (GetOrder_response) {
                res.status(200);
                res.json({
                    GetOrder_response: GetOrder_response.rows
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

router.get("/switchOrderStateByKey", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await switchOrderStateByKeyCheck.validateAsync(reg.query);
        if (reg.permissions.write.includes('admin_bestellungen') || reg.permissions.write.includes('admin_all')) {
            DB.get.order.GetByKey(value.key).then(function (GetOrder_response) {
                if (GetOrder_response.rows[0].status === false) {
                    let T_ID = randomstring.generate({
                        length: 32,
                        charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                    });
                    let Product = {
                        produktname: GetOrder_response.rows[0].artikel,
                        produktcompany: "Order",
                        price: GetOrder_response.rows[0].price,
                        bought: GetOrder_response.rows[0].amount
                    }
                    DB.get.Guests.ByID(GetOrder_response.rows[0].userid).then(function (User_Thats_Ordered) {
                        const Billed_User = User_Thats_Ordered[0].hauptgast_userid || GetOrder_response.rows[0].userid;
                        DB.write.shopinglist.Buy(Billed_User, GetOrder_response.rows[0].userid, Product, T_ID).then(function (Buy_response) {
                            DB.write.order.SwitchState(value.key, true).then(function (Switch_response) {
                                res.status(200);
                                res.json({
                                    Message: "Success",
                                    orderid: GetOrder_response.rows[0].orderid
                                });
                            });
                        }).catch(function (error) {
                            log.error(error);
                            throw new Error("DBError");
                        });
                    }).catch(function (error) {
                        log.error(error);
                        throw new Error("DBError");
                    });
                } else {
                    res.status(508);
                    res.json({
                        Message: "Failed",
                        orderid: GetOrder_response.rows[0].orderid
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

router.post("/delUserOrder", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        const value = await switchOrderStateByKeyCheck.validateAsync(reg.body);
        if (reg.permissions.write.includes('user_bestellungen') || reg.permissions.write.includes('admin_bestellungen') || reg.permissions.write.includes('admin_all')) {
            DB.get.order.GetByKey(value.key).then(function (Order_key_Response) {
                DB.get.order.GetOrder(Order_key_Response.rows[0].orderid).then(function (Order_Response) {
                    if (Order_Response.rows[0].timeuntil > new Date().getTime() && Order_Response.rows[0].status === false) {
                        DB.del.order.ByKey(value.key, reg.check.Data.userid).then(function (Del_Response) {
                            res.status(200);
                            res.json({
                                Message: "Success",
                                orderid: Order_key_Response.rows[0].orderid
                            });
                        }).catch(function (error) {
                            log.error(error);
                            throw new Error("DBError");
                        })
                    } else {
                        res.status(410);
                        res.json({
                            Message: "Time not valid anymore or bough already"
                        });
                    }
                }).catch(function (error) {
                    log.error(error);
                    throw new Error("DBError");
                })
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