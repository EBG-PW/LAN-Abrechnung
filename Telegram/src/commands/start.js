const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'), ['de', 'en', 'de-by'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/start/i, (msg) => {
        if (msg.chat.type === "private") {
            DB.get.Guests.ByID(msg.from.id).then(function (User_response) {
                if (User_response.length <= 0 || parseInt(mainconfig.SudoUser) === msg.from.id) {
                    let inlineKeyboard = []
                    //Push Base Language Buttons
                    inlineKeyboard.push([
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.EN'), { callback: `R_${msg.from.id}_setlang_en` }),
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.UA'), { callback: `R_${msg.from.id}_setlang_ua` }),
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.IT'), { callback: `R_${msg.from.id}_setlang_it` }),
                    ])
                    //Push Slang Buttons for German
                    inlineKeyboard.push([
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-BY'), { callback: `R_${msg.from.id}_setlang_de-by` }),
                    ])
                    //Push Rules Button to enter registration
                    inlineKeyboard.push([
                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Knöpfe.Reg'), { callback: `R_${msg.from.id}_rules` })
                    ])
                    let replyMarkup = bot.inlineKeyboard(inlineKeyboard);
                    return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'WellcomeMSG', { LanName: mainconfig.LanName }), { replyMarkup });
                } else {
                    if (User_response[0].pyed_id !== null) {
                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Knöpfe.Hauptmenu'), { callback: `/hauptmenu` })
                            ]
                        ]);
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'WellcomeMSGAR', { LanName: mainconfig.LanName }), { replyMarkup });
                    } else {
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'WellcomeErr'));

                    }
                }
            }).catch(function (error) {
                log.error(error)
                return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'Error.DBFehler'));
            })
        } else {
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'Error.NotPrivate'));
        }
    });
}