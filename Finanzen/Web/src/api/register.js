require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
var path = require('path');
const DB = require('../lib/postgres');
const bcrypt = require('bcrypt');


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-WebReg';
const PluginRequirements = [];
const PluginVersion = '0.0.1';
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

//Global Vars
const saltRounds = parseInt(process.env.saltRounds);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150
  });

const getUserCheck = Joi.object({
    Token: Joi.string().required().max(32)
});

const RegisterdCheck = Joi.object({
    Token: Joi.string().required().max(32),
    Password: Joi.string().required()
});

const router = express.Router();

router.get("/load/:Token", limiter, (reg, res, next) => {
    DB.get.RegToken.ByToken(reg.params.Token).then(function(response) {
        if(response.rows.length === 1){
            res.status(200);
            res.sendFile(path.join(__dirname + "../../../" + process.env.data + '/Plugin_Reg/index.html'));
        }else{
            res.status(401);
            res.json({
                route: "/",
                message: "Could not load token"
            });
        }
    }).catch(function(error){
        console.log(error)
        res.status(500);
        res.json({
          message: "Databace error",
        });
    })

});

router.get("/getUser", limiter, async (reg, res, next) => {
    try {
        const value = await getUserCheck.validateAsync(reg.query);
        console.log(value.Token)
        DB.get.RegToken.ByToken(value.Token).then(function(response) {
            if(response.rows.length === 1){
                res.status(200);
                res.json(
                    response.rows[0]
                );
            }else{
                res.status(401);
                res.json({
                    route: "/getUser",
                    message: "Could not load token"
                });
            }
        }).catch(function(error){
            console.log(error)
            res.status(500);
            res.json({
            message: "Databace error",
            });
        })
    } catch (error) {
        next(error);
    }
});

router.post("/register", limiter, async (reg, res, next) => {

});

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };