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
const PluginName = 'Lan-TokenCheck';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
  });

const TokenCheck = Joi.object({
    Token: Joi.string().required()
});

const router = express.Router();

router.post("/", limiter, async (reg, res, next) => {
    try {
        const value = await TokenCheck.validateAsync(reg.body);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function(Check) {
            if(Check.State){
                res.status(200);
                res.json({
                  TokenData: Check.Data
                });
            }else{
                DB.del.webtoken.Del(value.Token).then(function(Check) {
                    res.status(401);
                    res.json({
                        Message: "Token invalid"
                    });
                })
            }
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