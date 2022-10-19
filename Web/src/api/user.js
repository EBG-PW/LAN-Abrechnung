require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const DB = require('../../lib/postgres');
const TV = require('../../lib/TokenVerification');
const { tokenpermissions } = require('../middleware/tokenVerify')
const { log } = require('../../lib/logger');
const permission_groups = require('../../../config/permission_groups');
const { object } = require('joi');


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-User';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
});

const SetLang = Joi.object({
    lang: Joi.string().required()
});

const setPayedState = Joi.object({
    userid: Joi.string().required()
});

const SetPermissionGroup = Joi.object({
    userid: Joi.number().required(),
    permgroup: Joi.string().required()
});

const setPaymentAllowedState = Joi.object({
    userid: Joi.string().required()
});

const setSubuserPayedAmount = Joi.object({
    userid: Joi.string().required(),
    amount: Joi.number().required().min(0).max(1000)
});

const router = express.Router();

router.get("/user", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_user') || reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.ByID(reg.check.Data.userid).then(function (Guest_response) {
                res.status(200);
                res.json({
                    me: Guest_response[0]
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

router.get("/userlist", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_user') || reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.AllSave().then(function (GuestsList_response) {
                res.status(200);
                res.json({
                    GuestsList_response
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

router.get("/adminuserlist", limiter, tokenpermissions(), async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.All().then(function (GuestsList_response) {
                res.status(200);
                res.json({
                    GuestsList_response
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

router.post("/setLang", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_user') || reg.permissions.read.includes('admin_user') || reg.permissions.read.includes('admin_all')) {
            const value = await SetLang.validateAsync(reg.body);
            Promise.all([DB.write.Guests.updatelang(value.lang, reg.check.Data.userid), DB.write.webtoken.UpdateLang(value.lang, reg.check.Data.userid)])
                .then(function (Check) {
                    res.status(200);
                    res.json({
                        Message: `Language chanced to ${value.Lang}`
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

router.post("/setPayedState", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.write.includes('admin_finanzen') || reg.permissions.write.includes('admin_all')) {
            const value = await setPayedState.validateAsync(reg.body);
            DB.write.Guests.UpdateCollumByID(value.userid, 'payed', true).then(function (Check) {
                res.status(200);
                res.json({
                    Message: `Payed State chanced to true`
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

router.get("/PermisionGroup", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('admin_permissions') || reg.permissions.read.includes('admin_all')) {
            res.status(200);
            res.json({
                PermissionGroups: permission_groups
            });
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/setPermisionGroup", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.write.includes('admin_permissions') || reg.permissions.write.includes('admin_all')) {
            const value = await SetPermissionGroup.validateAsync(reg.body);
            DB.write.Permissions.SetGroup(value.userid, value.permgroup).then(function (Check) {
                res.status(200);
                res.json({
                    Message: `Permissionsgroup chanced to ${value.permgroup}`
                });
            }).catch(function (error) {
                log.error(error);
                next(error);
            })
        } else {
            throw new Error("NoPermissions");
        }
    } catch (error) {
        next(error);
    }
});

router.get("/getSubusersOfUser", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.read.includes('user_subadmin') || reg.permissions.read.includes('admin_all')) {
            DB.get.Guests.GetMySubguests(reg.check.Data.userid).then(function (Subusers) {
                res.status(200);
                res.json({
                    Subusers
                });
            }).catch(function (error) {
                log.error(error);
                next(error);
            })
        }
    } catch (error) {
        next(error);
    }
});

router.post("/setPaymentAllowedState", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.write.includes('user_subadmin') || reg.permissions.write.includes('admin_all')) {
            const value = await setPaymentAllowedState.validateAsync(reg.body);
            DB.write.Guests.ToggleSubUserPayedAllowedState(reg.check.Data.userid, value.userid).then(function (Check) {
                res.status(200);
                res.json({
                    Message: `Toggle Payment Allowed State`
                });
            }).catch(function (error) {
                log.error(error);
                next(error);
            })
        }
    } catch (error) {
        next(error);
    }
});

router.post("/setSubuserPayedAmount", tokenpermissions(), limiter, async (reg, res, next) => {
    try {
        if (reg.permissions.write.includes('user_subadmin') || reg.permissions.write.includes('admin_all')) {
            const value = await setSubuserPayedAmount.validateAsync(reg.body);
            DB.write.Guests.SetSubUserPayedAmount(reg.check.Data.userid, value.userid, value.amount).then(function (Check) {
                res.status(200);
                res.json({
                    Message: `Set Subuser Payed Amount`
                });
            }).catch(function (error) {
                log.error(error);
                next(error);
            })
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