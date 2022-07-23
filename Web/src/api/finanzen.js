require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const DB = require('../../lib/postgres');
const { tokenpermissions } = require('../middleware/tokenVerify')
const { log } = require('../../lib/logger');


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

const router = express.Router();

router.get("/shoppinglist", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_finanzen') || reg.permissions.read.includes('admin_finanzen') || reg.permissions.read.includes('admin_all')) {
            DB.get.shopinglist.Get(reg.check.Data.userid).then(function (ShoppingList_response) {
                res.status(200);
                res.json({
                    ShoppingList_response: ShoppingList_response.rows
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

router.get("/gettotalspend", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_finanzen') || reg.permissions.read.includes('admin_finanzen') || reg.permissions.read.includes('admin_all')) {
            DB.get.shopinglist.Get(reg.check.Data.userid).then(function (ShoppingList_response) {
                let total = 0;
                ShoppingList_response.rows.map(row => {
                    total = total + row.price
                })
                res.status(200);
                res.json({
                    total
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

module.exports = {
    router: router,
    PluginName: PluginName,
    PluginRequirements: PluginRequirements,
    PluginVersion: PluginVersion,
    PluginAuthor: PluginAuthor,
    PluginDocs: PluginDocs
};