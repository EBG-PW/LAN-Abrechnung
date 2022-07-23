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
const PluginName = 'Lan-TokenCheck';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const router = express.Router();

router.post("/", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        res.status(200);
        res.json({
            TokenData: reg.check.Data,
            Permissions: reg.permissions
        });
    } catch (error) {
        log.error(error);
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