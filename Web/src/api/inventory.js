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
const PluginName = 'Lan-Inventory';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50
});

const router = express.Router();

router.get("/inventory", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_inventory') || reg.permissions.read.includes('admin_inventory') || reg.permissions.read.includes('admin_all')) {
            DB.get.Inventory.GetAll().then(ShoppingList_response => {
                res.status(200).json({Inventory_response: ShoppingList_response.rows});
            }).catch(err => {
                log.error(error);
                throw new Error("DBError");
            });
        }
    } catch (err) {
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