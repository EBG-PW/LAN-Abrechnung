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
const PluginName = 'Lan-Finanzen';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
  });

const ShoppingList = Joi.object({
    Token: Joi.string().required()
});

const router = express.Router();

router.get("/shoppinglist", limiter, async (reg, res, next) => {
    try {
        const value = await ShoppingList.validateAsync(reg.query);
        let source = reg.headers['user-agent']
        let para = {
            Browser: useragent.parse(source),
            IP: reg.headers['x-forwarded-for'] || reg.socket.remoteAddress
        }
        TV.check(value.Token, para, false).then(function(Check) {
            DB.get.shopinglist.Get(Check.Data.userid).then(function(ShoppingList_response) {
                console.log(ShoppingList_response)
            });
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