require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const DB = require('../lib/postgres');
const TV = require('../lib/TokenVerification');


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
    Token: Joi.string().required(),
    UserID: Joi.number().required()
});

const router = express.Router();

router.get("/PlugsToggleAllowedState", limiter, async (reg, res, next) => {
    try {
        const value = await PlugsToggleAllowedStateCheck.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, true).then(function(Check) {
            if(Check.State === true){
                DB.write.plugs.toggle_allowed_state(value.UserID).then(function(toggle_response) {
                    if(toggle_response.rowCount === 1){
                        res.status(200);
                        res.json({
                             Message: "Sucsess"
                        });  
                    }else{
                        res.status(500);
                        res.json({
                             Message: "Nothing chanced. This either means the UserID isn´t known, or the user has no plug yet"
                        }); 
                    }
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