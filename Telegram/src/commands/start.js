const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'),  ['de', 'en', 'de-by', 'de-ooe', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/start/i, (msg) => {
        if (msg.chat.type === "private") {
            DB.get.Guests.ByID(msg.from.id).then(function (User_response) {
                if (User_response.length <= 0 || parseInt(mainconfig.SudoUser) === msg.from.id) {
                    let inlineKeyboard = []
                    const text_array = msg.text.split('_');
                    if (text_array.length === 2) {
                        if (text_array[0].includes('SubGuest')) {
                            DB.get.Guests.ByID(text_array[1]).then(function (HauptGuest_response) {
                                if (HauptGuest_response.length > 0) {
                                    //Push Base Language Buttons
                                    inlineKeyboard.push([
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.DE'), { callback: `RSU_${msg.from.id}_setlang_de_${text_array[1]}` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.EN'), { callback: `RSU_${msg.from.id}_setlang_en_${text_array[1]}` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.UA'), { callback: `RSU_${msg.from.id}_setlang_ua_${text_array[1]}` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.IT'), { callback: `RSU_${msg.from.id}_setlang_it_${text_array[1]}` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.FR'), { callback: `RSU_${msg.from.id}_setlang_fr_${text_array[1]}` }),
                                    ])
                                    //Push Slang Buttons for German
                                    inlineKeyboard.push([
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE'), { callback: `RSU_${msg.from.id}_setlang_de_${text_array[1]}` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-BY'), { callback: `RSU_${msg.from.id}_setlang_de-by_${text_array[1]}` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-OOE'), { callback: `RSU_${msg.from.id}_setlang_de-ooe_${text_array[1]}` }),
                                    ])
                                    //Push Rules Button to enter registration
                                    inlineKeyboard.push([
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Knöpfe.Reg'), { callback: `RSU_${msg.from.id}_rules_${text_array[1]}` })
                                    ])
                                    let replyMarkup = bot.inlineKeyboard(inlineKeyboard);
                                    return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'WellcomeMSGSubGuest', { LanName: mainconfig.LanName, Username: HauptGuest_response[0].username }), { replyMarkup, parseMode: 'html' });
                                } else { // Fallback in case something went wrong, return normal invite response
                                    //Push Base Language Buttons
                                    inlineKeyboard.push([
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.EN'), { callback: `R_${msg.from.id}_setlang_en` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.UA'), { callback: `R_${msg.from.id}_setlang_ua` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.IT'), { callback: `R_${msg.from.id}_setlang_it` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.FR'), { callback: `R_${msg.from.id}_setlang_fr` }),
                                    ])
                                    //Push Slang Buttons for German
                                    inlineKeyboard.push([
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-BY'), { callback: `R_${msg.from.id}_setlang_de-by` }),
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-OOE'), { callback: `R_${msg.from.id}_setlang_de-ooe` }),
                                    ])
                                    //Push Rules Button to enter registration
                                    inlineKeyboard.push([
                                        bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Knöpfe.Reg'), { callback: `R_${msg.from.id}_rules` })
                                    ])
                                    let replyMarkup = bot.inlineKeyboard(inlineKeyboard);
                                    return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'WellcomeMSG', { LanName: mainconfig.LanName }), { replyMarkup, parseMode: 'html' });
                                }
                            });
                        }
                    } else {
                        //Push Base Language Buttons
                        inlineKeyboard.push([
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.EN'), { callback: `R_${msg.from.id}_setlang_en` }),
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.UA'), { callback: `R_${msg.from.id}_setlang_ua` }),
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.IT'), { callback: `R_${msg.from.id}_setlang_it` }),
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.FR'), { callback: `R_${msg.from.id}_setlang_fr` }),
                        ])
                        //Push Slang Buttons for German
                        inlineKeyboard.push([
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-BY'), { callback: `R_${msg.from.id}_setlang_de-by` }),
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Sprachen.Knöpfe.Full.DE-OOE'), { callback: `R_${msg.from.id}_setlang_de-ooe` }),
                        ])
                        //Push Rules Button to enter registration
                        inlineKeyboard.push([
                            bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'Knöpfe.Reg'), { callback: `R_${msg.from.id}_rules` })
                        ])
                        let replyMarkup = bot.inlineKeyboard(inlineKeyboard);
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language, 'WellcomeMSG', { LanName: mainconfig.LanName }), { replyMarkup });
                    }
                } else {
                    if (User_response[0].pyed_id !== null || User_response[0].hauptgast_userid !== null) {
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