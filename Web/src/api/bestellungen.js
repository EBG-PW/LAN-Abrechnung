require('dotenv').config();
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const SanitizeHtml = require('sanitize-html');
const Joi = require('joi');
var path = require('path');
const DB = require('../../lib/postgres');
const TV = require('../../lib/TokenVerification');
const randomstring = require('randomstring');

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

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const TokenCheck = Joi.object({
    Token: Joi.string().required(),
    EssenListe: Joi.string().required(),
    Zeit: Joi.string().required()
});

const GetUserOrderCheck = Joi.object({
    Token: Joi.string().required(),
    orderid: customJoi.string().required()
});

const UserOrderCheck = Joi.object({
    Token: Joi.string().required(),
    orderid: customJoi.string().required(),
    article: customJoi.string().required(),
    price: Joi.number().required(),
    Amount: Joi.number().required()
});

const switchOrderStateByKeyCheck = Joi.object({
    Token: Joi.string().required(),
    key: customJoi.string().required()
});

const router = express.Router();

router.post("/new", limiter, async (reg, res, next) => {
    try {
        const value = await TokenCheck.validateAsync(reg.body);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, true).then(function (Check) {
            if (Check.State === true) {
                let ID = randomstring.generate({
                    length: 32,
                    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                });
                let Zeit = new Date().getTime() + (value.Zeit * 60 * 1000)
                let ZeitString = new Date(Zeit);
                DB.write.order.AddOrder(value.EssenListe, ID, ZeitString).then(function (response) {
                    let TaskID = randomstring.generate({
                        length: 32,
                        charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                    });
                    DB.message.PostNew('Telegram', TaskID, { text: `Es wird Essen bestellt!<nl><nl>Bitte auf ${value.EssenListe} eins oder mehrere Gerichte raussuchen.<nl>Bitte bis <b>${new Date(Zeit).toLocaleString('de-DE')}:${new Date(Zeit).getMilliseconds()}</b> bestellen.<nl>Bestellen im Webpanel mit der ID: <pre language="c++">${ID}</pre><nl><nl>${process.env.WebPanelURL}/public/UserBestellungen.html?${ID}`, chatid: mainconfig.LanChat, type: 'Message' }).then(function (New_Message) {
                        console.log(`New Task for Telegram, with ID ${TaskID} was made.`)

                        res.status(200);
                        res.json({
                            message: "Success",
                        });

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

router.post("/newUserOrder", limiter, async (reg, res, next) => {
    try {
        const value = await UserOrderCheck.validateAsync(reg.body);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function (Check) {
            if (Check.State === true) {
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
                            DB.write.order.AddOrderArticle(Check.Data.userid, value.article, value.Amount, Number(value.price) * Number(value.Amount), value.orderid, OrderKey).then(function (AddOrderArticle_Response) {
                                res.status(200);
                                res.json({
                                    Message: "Succsess"
                                });
                            });
                        } else {
                            res.status(410);
                            res.json({
                                Message: "Time not valid anymore"
                            });
                        }
                    }
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

router.get("/getUserOrders", limiter, async (reg, res, next) => {
    try {
        const value = await GetUserOrderCheck.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, true).then(function (Check) {
            if (Check.State === true) {
                DB.get.order.GetOrderList(value.orderid, false).then(function (GetOrder_response) {
                    res.status(200);
                    res.json({
                        GetOrder_response: GetOrder_response.rows
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

router.get("/getUserOrdersForToken", limiter, async (reg, res, next) => {
    try {
        const value = await GetUserOrderCheck.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function (Check) {
            if (Check.State === true) {
                DB.get.order.GetOrderByOrderID(value.orderid, Check.Data.userid).then(function (GetOrder_response) {
                    res.status(200);
                    res.json({
                        GetOrder_response: GetOrder_response.rows
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

router.get("/switchOrderStateByKey", limiter, async (reg, res, next) => {
    try {
        const value = await switchOrderStateByKeyCheck.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, true).then(function (Check) {
            if (Check.State === true) {
                DB.get.order.GetByKey(value.key).then(function (GetOrder_response) {
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
                    DB.write.shopinglist.Buy(GetOrder_response.rows[0].userid, GetOrder_response.rows[0].userid, Product, T_ID).then(function (Buy_response) {
                        DB.write.order.SwitchState(value.key, true).then(function (Switch_response) {
                            res.status(200);
                            res.json({
                                Message: "Succsess",
                                orderid: GetOrder_response.rows[0].orderid
                            });
                        });
                    })
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

router.post("/delUserOrder", limiter, async (reg, res, next) => {
    try {
        const value = await switchOrderStateByKeyCheck.validateAsync(reg.body);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function (Check) {
            if (Check.State === true) {
                DB.get.order.GetByKey(value.key).then(function (Order_key_Response) {
                    DB.get.order.GetOrder(Order_key_Response.rows[0].orderid).then(function (Order_Response) {
                        if (Order_Response.rows[0].timeuntil > new Date().getTime()) {
                            DB.del.order.ByKey(value.key, Check.Data.userid).then(function (Del_Response) {
                                res.status(200);
                                res.json({
                                    Message: "Succsess",
                                    orderid: Order_key_Response.rows[0].orderid
                                });
                            });
                        } else {
                            res.status(410);
                            res.json({
                                Message: "Time not valid anymore"
                            });
                        }
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