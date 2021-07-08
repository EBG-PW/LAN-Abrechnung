require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const DB = require('../lib/postgres');
const TV = require('../lib/TokenVerification');
const randomstring = require('randomstring');


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-Bestellungen';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
  });

const TokenCheck = Joi.object({
    Token: Joi.string().required(),
    EssenListe: Joi.string().required(),
    Zeit: Joi.string().required()

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
        TV.check(value.Token, para, true).then(function(Check) {
            if(Check.State === true){
                let ID = randomstring.generate({
                    length: 32,
                    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                });
                let Zeit = new Date().getTime() + (value.Zeit * 60 * 1000)
                let ZeitString = new Date(Zeit);
                DB.write.order.AddOrder(value.EssenListe, ID, ZeitString)
                DB.message.PostNew('Telegram', ID, {text: 'Web_Register', chatid: response.rows[0].userid, type: 'Function'}).then(function(New_Message) {
                    console.log(`New Task for Telegram, with ID ${ID} was made.`)
                });
                res.status(200);
                res.json({
                    message: "Success - Password was set",
                    userid: response.rows[0].userid
                });
            }else{
                res.status(401);
                res.json({
                     Message: "Token invalid"
                });
            }
        }).catch(function(error){
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