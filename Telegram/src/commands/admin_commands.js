const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../','../', 'lang'), ['de', 'en', 'de-by'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');
const { AtrbutCheck, TimeConvert } = require('../../lib/utils');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/admin( .+)*/i, (msg, props) => {
        let AvaibleModes = ['add', 'remove', 'rem', 'list']
        let CheckAtributes = AtrbutCheck(props);
        Promise.all([DB.get.tglang.Get(msg.from.id), DB.get.Guests.Check.Admin(msg.from.id)]).then(function (response) {
            const [tglang_response, Admin_Check_response] = response;
            if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
                if (CheckAtributes.hasAtributes) {
                    if ('reply_to_message' in msg) {
                        if (AvaibleModes.includes(CheckAtributes.atributes[0])) {
                            let UserID = msg.reply_to_message.from.id
                            let username;
                            if ('username' in msg.reply_to_message.from) {
                                username = msg.reply_to_message.from.username.toString();
                            } else {
                                username = msg.reply_to_message.from.first_name.toString();
                            }
    
                            if (CheckAtributes.atributes[0] === "add") {
                                DB.write.Guests.UpdateCollumByID(UserID, 'admin', true).then(function (Admin_Update_response) {
                                    if (Admin_Update_response.rowCount === 1) {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.AddSuccsess', { Username: username, UserID: UserID }));
                                    } else {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.AddNoSuccsess'));
                                    }
                                });
                            } else if (CheckAtributes.atributes[0] === "rem" || CheckAtributes.atributes[0] === "remove") {
                                DB.write.Guests.UpdateCollumByID(UserID, 'admin', false).then(function (Admin_Update_response) {
                                    if (Admin_Update_response.rowCount === 1) {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.RemSuccsess', { Username: username, UserID: UserID }));
                                    } else {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.RemNoSuccsess'));
                                    }
                                });
                            }
                        } else {
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustHaveAtributes', { Atributes: AvaibleModes.join(", ") }));
                        }
                    } else {
                        if (CheckAtributes.atributes[0] === "list") {
                            DB.get.Guests.Admins().then(function (Admin_List_response) {
                                let AdminList = "";
                                Admin_List_response.map(Admin => {
                                    AdminList = `${AdminList}\n- ${Admin.username}(${Admin.userid})`
                                });
                                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.list', { AdminList: AdminList }));
                            });
                        } else {
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeReply'));
                        }
                    }
                } else {
                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustHaveAtributes', { Atributes: AvaibleModes.join(", ") }));
                }
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        })
    });
    
    bot.on(/^\/loadprice/i, (msg) => {
        var run_start = new Date().getTime();
        if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json'))) {
            preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json')));
        }
        Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
            const [Admin_Check_response, tglang_response] = values;
            if (Admin_Check_response) {
                let Restul_array = [];
                for (const key in preisliste.SnackBar) {
                    Restul_array.push(DB.write.Products.Add(preisliste.SnackBar[key]))
                }
                Promise.all(Restul_array).then(function (Insert_Response) {
                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'loadprice.Text', { Amount: Insert_Response.length, duration: TimeConvert(new Date().getTime() - run_start) }));
                }).catch(function (error) {
                    log.error(error)
                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                })
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        })
    });
    
    bot.on(/^\/loadplugs/i, (msg) => {
        var run_start = new Date().getTime();
        if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'plugsconfig.json'))) {
            preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'plugsconfig.json')));
        }
        Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
            const [Admin_Check_response, tglang_response] = values;
            if (Admin_Check_response) {
                let Restult_array = [];
                for (let i = 0; i < preisliste.conrolpers.length; i++) {
                    DB.write.plugs.addControler(preisliste.conrolpers[i].ControlerName, preisliste.conrolpers[i].token).then(function (response) {
                        for (let j = 0; j < preisliste.conrolpers[i].Plugs.length; j++) {
                            Restult_array.push(DB.write.plugs.addPlug(preisliste.conrolpers[i].Plugs[j].IP, i + 1))
                        }
                        Promise.all(Restult_array).then(function (response) {
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'loadplugs.Text', { Amount: Restult_array.length, ControlerAmount: preisliste.conrolpers.length, duration: TimeConvert(new Date().getTime() - run_start) }));
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                        })
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                    })
                }
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        })
    });
}