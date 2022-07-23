const DB = require('../../lib/postgres');
const { log } = require('../../lib/logger');
const TV = require('../../lib/TokenVerification');
const useragent = require('express-useragent');

/**
 * Checks if token is valid and provides the permissions as object.
 * When token is not valid, it will stop the request.
 * @param {boolean} [skip] If true, it will skip the token check.
 * @returns {object}
 */
const tokenpermissions = (skip = false) => {
    return (reg, res, next) => {
        let IP;
        const source = reg.headers['user-agent']

        //Get Users IP
        if (process.env.CloudFlare_Proyx === 'true' || process.env.CloudFlare_Proyx == true) {
            IP = reg.headers['cf-connecting-ip'] || reg.socket.remoteAddress //This only works with cloudflare proxy
        } else {
            IP = reg.headers['x-forwarded-for'] || reg.socket.remoteAddress //This only works without cloudflare
        }

        const para = {
            Browser: useragent.parse(source),
            IP: IP
        }

        let UserToken;

        if (reg.headers['authorization'] != undefined) {
            UserToken = reg.headers['authorization'].replace('Bearer ', '');
        } else {
            if (!skip) {
                return next(new Error('No token in request found'));
            } else {
                const PermissionsObject = {
                    read: [],
                    write: []
                };
                reg.permissions = PermissionsObject;
                return next()
            }
        }

        TV.check(UserToken, para).then(function (Check) {
            if (Check.State) {
                DB.get.Permissions.Get(Check.Data.userid).then(function (Permissions) {
                    const PermissionsObject = {
                        read: [],
                        write: []
                    };

                    Permissions.rows.forEach(function (Permission) {
                        if (Permission.read === true || Permission.read === "true") {
                            PermissionsObject.read.push(Permission.permission);
                        }
                        if (Permission.write === true || Permission.write === "true") {
                            PermissionsObject.write.push(Permission.permission);
                        }
                    });

                    reg.permissions = PermissionsObject;
                    reg.check = Check
                    return next();
                });
            } else {
                if (skip) { return next(); }

                res.status(401);
                res.json({
                    Message: 'Token Invalid'
                });
            }
        }).catch(function (error) {
            //Lets just try to delete the token when its not valid, this was done in the logout check before
            DB.del.webtoken.Del(UserToken).then(function (Check) {
                logger('error', 'Token could not be verifyed');
                next(error);
            })

        });
    }
}

module.exports = {
    tokenpermissions
};