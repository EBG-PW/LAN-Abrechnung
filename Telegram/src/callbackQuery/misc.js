const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'),  ['de', 'en', 'de-by', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const DE_SLANG = ["de-by"] //Used to store the diffrent slangs of german. 
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on('callbackQuery', (msg) => {
        DB.get.tglang.Get(msg.from.id).then(function (tglang_response) {
            if ('inline_message_id' in msg) {
                var inlineId = msg.inline_message_id;
            } else {
                var chatId = msg.message.chat.id;
                var messageId = msg.message.message_id;
            }

            var data = msg.data.split("_")

            if (parseInt(data[1]) !== msg.from.id) //Execute always, not user bound
            {
                if (data[0] === 'delete') {
                    if (data[1] === 'this') {
                        //delete message here!
                        bot.deleteMessage(chatId, messageId).catch(error => log.error(error));
                    }
                }
                if (data[0] === "lang") { // Language change from after registration
                    DB.write.tglang.Set(msg.from.id, data[1]).then(function (lang_edit_response) {
                        bot.answerCallbackQuery(msg.id)
                        let inlineKeyboard = []
                        //Push Base Language Buttons
                        inlineKeyboard.push([
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.DE'), { callback: `lang_de` }),
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.EN'), { callback: 'lang_en' }),
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.UA'), { callback: 'lang_ua' }),
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.IT'), { callback: 'lang_it' }),
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.FR'), { callback: 'lang_fr' }),
                        ])
                        //Push Slang Buttons for German
                        if (data[1] === 'de' || DE_SLANG.includes(data[1])) {
                            inlineKeyboard.push([
                                bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.Full.DE'), { callback: `lang_de` }),
                                bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.Full.DE-BY'), { callback: 'lang_de-by' }),
                            ])
                        }
                        //Push Rules Button to enter registration
                        inlineKeyboard.push([
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.Zurück'), { callback: `/moreinfo` }),
                        ])
                        let replyMarkup = bot.inlineKeyboard(inlineKeyboard);

                        let username;
                        if ('username' in msg.from) {
                            username = msg.from.username.toString();
                        } else {
                            username = msg.from.first_name.toString();
                        }

                        let Message = newi18n.translate(data[1], 'Sprachen.Text', { Username: username })

                        if ('inline_message_id' in msg) {
                            bot.editMessageText(
                                { inlineMsgId: inlineId }, Message,
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error(error));
                        } else {
                            bot.editMessageText(
                                { chatId: chatId, messageId: messageId }, Message,
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error(error));
                        }
                    });
                }
            } else { //Execute only if user bound
                if (data[0] === "R") { //R for Registration (Set Language)
                    if (data[2] === 'setlang') {
                        DB.write.tglang.Set(msg.from.id, data[3]).then(function (response) {
                            bot.answerCallbackQuery(msg.id)
                            let inlineKeyboard = []
                            //Push Base Language Buttons
                            inlineKeyboard.push([
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.EN'), { callback: `R_${msg.from.id}_setlang_en` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.UA'), { callback: `R_${msg.from.id}_setlang_ua` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.IT'), { callback: `R_${msg.from.id}_setlang_it` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.FR'), { callback: `R_${msg.from.id}_setlang_fr` }),
                            ])
                            //Push Slang Buttons for German
                            if (data[3] === 'de' || DE_SLANG.includes(data[3])) {
                                inlineKeyboard.push([
                                    bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.Full.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                                    bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.Full.DE-BY'), { callback: `R_${msg.from.id}_setlang_de-by` }),
                                ])
                            }
                            //Push Rules Button to enter registration
                            inlineKeyboard.push([
                                bot.inlineButton(newi18n.translate(data[3], 'Knöpfe.Reg'), { callback: `R_${msg.from.id}_rules` })
                            ])
                            let replyMarkup = bot.inlineKeyboard(inlineKeyboard);


                            if ('inline_message_id' in msg) {
                                bot.editMessageText(
                                    { inlineMsgId: inlineId }, newi18n.translate(data[3], 'WellcomeMSG', { LanName: mainconfig.LanName }),
                                    { parseMode: 'html', replyMarkup }
                                ).catch(error => log.error(error));
                            } else {
                                bot.editMessageText(
                                    { chatId: chatId, messageId: messageId }, newi18n.translate(data[3], 'WellcomeMSG', { LanName: mainconfig.LanName }),
                                    { parseMode: 'html', replyMarkup }
                                ).catch(error => log.error(error));
                            }
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                        });
                    }
                }

                if (data[0] === "RSU") { //RSU for Registration (Set Language)
                    if (data[2] === 'setlang') {
                        DB.write.tglang.Set(msg.from.id, data[3]).then(function (response) {
                            bot.answerCallbackQuery(msg.id)
                            let inlineKeyboard = []
                            //Push Base Language Buttons
                            inlineKeyboard.push([
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.DE'), { callback: `RSU_${msg.from.id}_setlang_de_${data[4]}` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.EN'), { callback: `RSU_${msg.from.id}_setlang_en_${data[4]}` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.UA'), { callback: `RSU_${msg.from.id}_setlang_ua_${data[4]}` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.IT'), { callback: `RSU_${msg.from.id}_setlang_it_${data[4]}` }),
                                bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.FR'), { callback: `RSU_${msg.from.id}_setlang_fr_${data[4]}` }),
                            ])
                            //Push Slang Buttons for German
                            if (data[3] === 'de' || DE_SLANG.includes(data[3])) {
                                inlineKeyboard.push([
                                    bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.Full.DE'), { callback: `RSU_${msg.from.id}_setlang_de_${data[4]}` }),
                                    bot.inlineButton(newi18n.translate(data[3], 'Sprachen.Knöpfe.Full.DE-BY'), { callback: `RSU_${msg.from.id}_setlang_de-by_${data[4]}` }),
                                ])
                            }
                            //Push Rules Button to enter registration
                            inlineKeyboard.push([
                                bot.inlineButton(newi18n.translate(data[3], 'Knöpfe.Reg'), { callback: `RSU_${msg.from.id}_rules_${data[4]}` })
                            ])
                            let replyMarkup = bot.inlineKeyboard(inlineKeyboard);

                            DB.get.Guests.ByID(data[4]).then(function (Hauptguest) {
                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, newi18n.translate(data[3], 'WellcomeMSGSubGuest', { LanName: mainconfig.LanName, Username: Hauptguest[0].username }),
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error(error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, newi18n.translate(data[3], 'WellcomeMSGSubGuest', { LanName: mainconfig.LanName, Username: Hauptguest[0].username }),
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error(error));
                                }
                            }).catch(function (error) {
                                log.error(error)
                                return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                            });
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                        });
                    }
                }
            }
        }).catch(function (error) {
            log.error(error)
            if ('inline_message_id' in msg) {
                bot.editMessageText(
                    { inlineMsgId: inlineId }, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'),
                    { parseMode: 'html' }
                ).catch(error => log.error(error));
            } else {
                bot.editMessageText(
                    { chatId: chatId, messageId: messageId }, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'),
                    { parseMode: 'html' }
                ).catch(error => log.error(error));
            }
        });
    });
}