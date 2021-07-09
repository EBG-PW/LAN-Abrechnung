require('dotenv').config();
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
let reqPath = path.join(__dirname, '../../');
const DB = require('../lib/postgres');
const TV = require('../lib/TokenVerification');
const randomstring = require('randomstring');

let mainconfig, preisliste;

/* Import Config */
if(fs.existsSync(`${reqPath}${process.env.Config}/mainconfig.json`)) {
	mainconfig = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.Config}/mainconfig.json`));
}
if(fs.existsSync(`${reqPath}${process.env.Config}/preisliste.json`)) {
	preisliste = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.Config}/preisliste.json`));
}

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
                DB.write.order.AddOrder(value.EssenListe, ID, ZeitString).then(function(response) {
                    let TaskID = randomstring.generate({
                        length: 32,
                        charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                    });
                    DB.message.PostNew('Telegram', TaskID, {text: `Es wird Essen bestellt!<nl><nl>Bitte auf ${value.EssenListe} eins oder mehrere Gerichte raussuchen.<nl>Bitte bis <b>${new Date(Zeit).toLocaleString('de-DE')}</b> bestellen.<nl>Bestellen im Webpanel mit der ID: <pre language="c++">${ID}</pre>`, chatid: mainconfig.LanChat, type: 'Message'}).then(function(New_Message) {
                        console.log(`New Task for Telegram, with ID ${TaskID} was made.`)
                        
                        res.status(200);
                        res.json({
                            message: "Success",
                        });
                        
                    });
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