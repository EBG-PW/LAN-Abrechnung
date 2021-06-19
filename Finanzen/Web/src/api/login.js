require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
useragent = require('express-useragent');
const Joi = require('joi');
var path = require('path');
const randomstring = require('randomstring');
const DB = require('../lib/postgres');
const bcrypt = require('bcrypt');


const PluginConfig = {
};

/* Plugin info */
const PluginName = 'Lan-WebLogin';
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

const LoginCheck = Joi.object({
    userid: Joi.number().required(),
    password: Joi.string().required()
});

const router = express.Router();

router.get("/login/:UserID", limiter, (reg, res, next) => {
    res.status(200);
    res.sendFile(path.join(__dirname + "../../../" + process.env.data + '/Plugin_Login/index.html'));
});


router.get("/login", limiter, (reg, res, next) => {
    res.status(200);
    res.sendFile(path.join(__dirname + "../../../" + process.env.data + '/Plugin_Login/index.html'));
});

router.post("/check", limiter, async (reg, res, next) => {
    try {
        const value = await LoginCheck.validateAsync(reg.body);
        DB.get.Guests.ByID(value.userid).then(function(result) {
            if(typeof result[0] === "undefined"){
                res.status(401);
                res.json({
                  message: "Falscher Benutzername oder Passwort",
                });
            }else{
                bcrypt.compare(value.password, result[0].passwort).then(function(result) {
                    if(result){
                        var source = reg.headers['user-agent']
                        console.log(useragent.parse(source))
                        console.log("Loged")
                        console.log(reg.headers['x-forwarded-for'] || reg.socket.remoteAddress )
                        //Write new Webtoken
                    }else if(!result){ //Not sure why this is !
                        res.status(401);
                        res.json({
                          message: "Falscher Benutzername oder Passwort",
                        });
                      }else{
                        res.status(500);
                        res.json({
                          message: "Kritischer Fehler!",
                        });
                      }
                });
            }
        });
        /*
        DB.get.RegToken.ByToken(value.Token).then(function(response) {
            if(response.rows.length === 1){
                DB.del.RegToken.DeleteToken(value.Token).then(function(del_response) {
                    if(del_response.rowCount === 1){
                        bcrypt.hash(value.Password, parseInt(process.env.saltRounds), function(err, hash) {
                            DB.write.Guests.UpdateCollumByID(response.rows[0].userid, 'passwort', hash).then(function(update_response) {
                                let ID = randomstring.generate({
                                    length: 32,
                                    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                                });
                                DB.message.PostNew('Telegram', ID, {text: 'Web_Register', chatid: response.rows[0].userid, type: 'Function'}).then(function(New_Message) {
                                    console.log(`New Task for Telegram, with ID ${ID} was made.`)
                                });
                                res.status(200);
                                res.json({
                                    message: "Success - Password was set",
                                });
                            });
                        });
                    }else{
                        res.status(401);
                        res.json({
                            message: "Token not found",
                        });
                    }
                });
            }else{
                res.status(401);
                res.json({
                    message: "Token not found",
                });
            }
        }).catch(function(error){
            console.log(error)
            res.status(500);
            res.json({
              message: "Databace error",
            });
        })*/
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