const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'),  ['de', 'en', 'de-by', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { CentToEuro } = require('../../lib/utils');
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

            if (parseInt(data[1], 10) === msg.from.id) {
                if (data[0] === "R") { // Handle regestration for normal guests
                    if (data[2] === 'rules') //If Rules are accepted
                    {
                        if (data.length === 3) {
                            // IF user didn´t awnser yet
                            let UserLang = msg.from.language_code || mainconfig.DefaultLang
                            DB.write.Guests.NewUser(msg.from.id, msg.from.username, UserLang).then(function (response) {

                                let replyMarkup = bot.inlineKeyboard([
                                    [
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Regeln.Knöpfe.Zustimmen'), { callback: `R_${msg.from.id}_rules_true` }),
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Regeln.Knöpfe.Ablehnen'), { callback: `R_${msg.from.id}_rules_false` })
                                    ]
                                ]);

                                let Message = []
                                Message.push(newi18n.translate(tglang_response, 'Regeln.Text'))
                                for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Regeln.RegelnAnzahl'), 10); i++) {
                                    Message.push(newi18n.translate(tglang_response, `Regeln.Regeln.${i}`))
                                }

                                Message = Message.join("\n")

                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, Message,
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, Message,
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                }

                            }).catch(function (error) {
                                log.error(error)
                                return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                            })
                        } else {
                            if (data[3] === "true") {
                                //If user accepted rules, then gets forwarted to leagal stuff
                                let newDate = new Date(Date.now());
                                DB.write.Guests.UpdateCollumByID(msg.from.id, "accepted_rules", newDate).then(function (response) {
                                    let replyMarkup = bot.inlineKeyboard([
                                        [
                                            bot.inlineButton(newi18n.translate(tglang_response, 'Legal.Knöpfe.Zustimmen'), { callback: `R_${msg.from.id}_legal_true` }),
                                            bot.inlineButton(newi18n.translate(tglang_response, 'Legal.Knöpfe.Ablehnen'), { callback: `R_${msg.from.id}_legal_false` })
                                        ]
                                    ]);

                                    let Message = []
                                    Message.push(newi18n.translate(tglang_response, 'Legal.Text'))
                                    for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Legal.LegalAnzahl')); i++) {
                                        Message.push(newi18n.translate(tglang_response, `Legal.Legal.${i}`))
                                    }

                                    Message.push(`\n\n${newi18n.translate(tglang_response, `Legal.Preisliste`)}`)
                                    for (var key in preisliste.PauschalKosten) {
                                        Message.push(`<b>${CentToEuro(preisliste.PauschalKosten[key].Preis)}</b> für <i>${newi18n.translate(tglang_response, `Preisliste.PauschalKosten.${preisliste.PauschalKosten[key].Beschreibung}`)}</i>`)
                                    }

                                    Message = Message.join("\n")

                                    if ('inline_message_id' in msg) {
                                        bot.editMessageText(
                                            { inlineMsgId: inlineId }, Message,
                                            { parseMode: 'html', replyMarkup }
                                        ).catch(error => log.error('Error:', error));
                                    } else {
                                        bot.editMessageText(
                                            { chatId: chatId, messageId: messageId }, Message,
                                            { parseMode: 'html', replyMarkup }
                                        ).catch(error => log.error('Error:', error));
                                    }
                                });
                            } else {
                                //User did not accept rules, so it ends here
                                let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Regeln.Antworten.Ablehnen`)}`
                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, Message,
                                        { parseMode: 'html' }
                                    ).catch(error => log.error('Error:', error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, Message,
                                        { parseMode: 'html' }
                                    ).catch(error => log.error('Error:', error));
                                }
                            }
                        }
                    }

                    if (data[2] === 'legal') {
                        if (data[3] === "true") {
                            //If user accepted legal, then gets forwarted to questions
                            let newDate = new Date(Date.now());
                            DB.write.Guests.UpdateCollumByID(msg.from.id, "accepted_legal", newDate).then(function (response) {
                                let replyMarkup = bot.inlineKeyboard([
                                    [
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Ja'), { callback: 'F_PC_true' }),
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Nein'), { callback: 'F_PC_false' })
                                    ]
                                ]);
                                let Message = newi18n.translate(tglang_response, 'Fragen.PC');

                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, Message,
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, Message,
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                }
                            });
                        } else {
                            //User did not accept legal, so it ends here
                            let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Legal.Antworten.Ablehnen`)}`
                            if ('inline_message_id' in msg) {
                                bot.editMessageText(
                                    { inlineMsgId: inlineId }, Message,
                                    { parseMode: 'html' }
                                ).catch(error => log.error('Error:', error));
                            } else {
                                bot.editMessageText(
                                    { chatId: chatId, messageId: messageId }, Message,
                                    { parseMode: 'html' }
                                ).catch(error => log.error('Error:', error));
                            }
                        }
                    }
                } else if (data[0] === 'RSU') { // Handle regestration for sub users
                    if (data[2] === 'rules') //If Rules are accepted
                    {
                        if (data.length === 4) { // IF user didn´t awnser yet
                            let UserLang = msg.from.language_code || mainconfig.DefaultLang
                            DB.write.Guests.NewSubUser(msg.from.id, data[3], msg.from.username, UserLang).then(function (response) {

                                let replyMarkup = bot.inlineKeyboard([
                                    [
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Regeln.Knöpfe.Zustimmen'), { callback: `RSU_${msg.from.id}_rules_${data[3]}_true` }),
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Regeln.Knöpfe.Ablehnen'), { callback: `RSU_${msg.from.id}_rules_${data[3]}_false` })
                                    ]
                                ]);

                                let Message = []
                                Message.push(newi18n.translate(tglang_response, 'Regeln.Text'))
                                for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Regeln.RegelnAnzahl'), 10); i++) {
                                    Message.push(newi18n.translate(tglang_response, `Regeln.Regeln.${i}`))
                                }

                                Message = Message.join("\n")

                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, Message,
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, Message,
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                }

                            }).catch(function (error) {
                                log.error(error)
                                return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                            })
                        } else {
                            if (data[4] === "true") {
                                //If user accepted rules, then gets forwarted to leagal stuff
                                let newDate = new Date(Date.now());
                                DB.write.Guests.UpdateCollumByID(msg.from.id, "accepted_rules", newDate).then(function (response) {
                                    let replyMarkup = bot.inlineKeyboard([
                                        [
                                            bot.inlineButton(newi18n.translate(tglang_response, 'Legal.Knöpfe.Zustimmen'), { callback: `RSU_${msg.from.id}_legal_${data[3]}_true` }),
                                            bot.inlineButton(newi18n.translate(tglang_response, 'Legal.Knöpfe.Ablehnen'), { callback: `RSU_${msg.from.id}_legal_${data[3]}_false` })
                                        ]
                                    ]);

                                    let Message = []
                                    Message.push(newi18n.translate(tglang_response, 'Legal.Text'))
                                    for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Legal.LegalAnzahl')); i++) {
                                        Message.push(newi18n.translate(tglang_response, `Legal.Legal.${i}`))
                                    }

                                    Message.push(`\n\n${newi18n.translate(tglang_response, `Legal.Preisliste`)}`)
                                    for (var key in preisliste.PauschalKosten) {
                                        Message.push(`<b>${CentToEuro(preisliste.PauschalKosten[key].Preis)}</b>: <i>${newi18n.translate(tglang_response, `Preisliste.PauschalKosten.${preisliste.PauschalKosten[key].Beschreibung}`)}</i>`)
                                    }

                                    Message = Message.join("\n")

                                    if ('inline_message_id' in msg) {
                                        bot.editMessageText(
                                            { inlineMsgId: inlineId }, Message,
                                            { parseMode: 'html', replyMarkup }
                                        ).catch(error => log.error('Error:', error));
                                    } else {
                                        bot.editMessageText(
                                            { chatId: chatId, messageId: messageId }, Message,
                                            { parseMode: 'html', replyMarkup }
                                        ).catch(error => log.error('Error:', error));
                                    }
                                });
                            } else {
                                //User did not accept rules, so it ends here
                                let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Regeln.Antworten.Ablehnen`)}`
                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, Message,
                                        { parseMode: 'html' }
                                    ).catch(error => log.error('Error:', error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, Message,
                                        { parseMode: 'html' }
                                    ).catch(error => log.error('Error:', error));
                                }
                            }
                        }
                    }

                    if (data[2] === 'legal') {
                        if (data[4] === "true") {
                            //If user accepted legal, then gets forwarted to questions
                            let newDate = new Date(Date.now());
                            DB.write.Guests.UpdateCollumByID(msg.from.id, "accepted_legal", newDate).then(function (response) {
                                let replyMarkup = bot.inlineKeyboard([
                                    [
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Vollständig'), { callback: 'F_VC_Voll' }),
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Teil'), { callback: 'F_VC_Teil' }),
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Nein'), { callback: 'F_VC_Nein' })
                                    ], [
                                        bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.NichtSagen'), { callback: 'F_VC_Secret' })
                                    ]
                                ]);

                                if ('inline_message_id' in msg) {
                                    bot.editMessageText(
                                        { inlineMsgId: inlineId }, newi18n.translate(tglang_response, 'Fragen.Vaccinated'),
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                } else {
                                    bot.editMessageText(
                                        { chatId: chatId, messageId: messageId }, newi18n.translate(tglang_response, 'Fragen.Vaccinated'),
                                        { parseMode: 'html', replyMarkup }
                                    ).catch(error => log.error('Error:', error));
                                }
                            });
                        } else {
                            //User did not accept legal, so it ends here
                            let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Legal.Antworten.Ablehnen`)}`
                            if ('inline_message_id' in msg) {
                                bot.editMessageText(
                                    { inlineMsgId: inlineId }, Message,
                                    { parseMode: 'html' }
                                ).catch(error => log.error('Error:', error));
                            } else {
                                bot.editMessageText(
                                    { chatId: chatId, messageId: messageId }, Message,
                                    { parseMode: 'html' }
                                ).catch(error => log.error('Error:', error));
                            }
                        }
                    }
                }
            }
        }).catch(function (error) {
            log.error(error)
            if ('inline_message_id' in msg) {
                bot.editMessageText(
                    { inlineMsgId: inlineId }, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'),
                    { parseMode: 'html' }
                ).catch(error => log.error('Error:', error));
            } else {
                bot.editMessageText(
                    { chatId: chatId, messageId: messageId }, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'),
                    { parseMode: 'html' }
                ).catch(error => log.error('Error:', error));
            }
        });
    });
}