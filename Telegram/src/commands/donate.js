const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const randomstring = require('randomstring');
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'), ['de', 'en', 'de-by', 'ua', 'it'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');
const { CentToEuro } = require('../../lib/utils');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/donate/i, (msg) => {
        //THIS WILL ONLY WORK WHEN CALLED BY INLINE FUNCTION
        if ('inline_message_id' in msg) {
            var inlineId = msg.inline_message_id;
        } else {
            var chatId = msg.message.chat.id;
            var messageId = msg.message.message_id;
        }

        DB.get.tglang.Get(msg.from.id).then(function (tglang_response) {
            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Spenden.Knöpfe.Spenden'), { inlineCurrent: 'spende' })
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Spenden.Knöpfe.SpendeAlles'), { callback: '/alldonate' })
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Knöpfe.Hauptmenu'), { callback: `/maincallback` })
                ]
            ]);
            let Message = newi18n.translate(tglang_response, 'Spenden.Text')

            if ('inline_message_id' in msg) {
                bot.editMessageText(
                    { inlineMsgId: inlineId }, Message,
                    { parseMode: 'html', replyMarkup }
                ).catch(error => log.error('Error (editMessageText):', error));
            } else {
                bot.editMessageText(
                    { chatId: chatId, messageId: messageId }, Message,
                    { parseMode: 'html', replyMarkup }
                ).catch(error => log.error('Error (editMessageText):', error));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });

    bot.on(/^\/alldonate/i, (msg) => {
        //THIS WILL ONLY WORK WHEN CALLED BY INLINE FUNCTION
        try {
            if ('inline_message_id' in msg) {
                var inlineId = msg.inline_message_id;
            } else {
                var chatId = msg.message.chat.id;
                var messageId = msg.message.message_id;
            }

            Promise.all([DB.get.Guests.ByID(msg.from.id), DB.get.plugs.power.kwh(msg.from.id), DB.get.shopinglist.Get(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (response) {
                const [Guest_response, plugs_response, shoppinglist_response, tglang_response] = response;
                let total_shopping = 0;
                const total_powercost = plugs_response.rows[0]?.diff?.toFixed(2) * preisliste.PauschalKosten.StromKWH.Preis || 0;
                const bool_payed = Guest_response[0]?.payed || false;
                const total_payed = Guest_response[0]?.payed_ammount || 0;

                shoppinglist_response.rows.map(row => {
                    total_shopping = total_shopping + row.price
                })

                const current_balance = Number(total_payed) - (Number(total_shopping) + Number(total_powercost));

                let Message, replyMarkup;

                if (bool_payed && current_balance > 0) {
                    replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'SpendenAll.Knöpfe.Ja'), { callback: '/allyesdonate' }),
                            bot.inlineButton(newi18n.translate(tglang_response, 'SpendenAll.Knöpfe.Nein'), { callback: '/maincallback' })
                        ]
                    ]);

                    Message = newi18n.translate(tglang_response, 'SpendenAll.Text', { current_balance: CentToEuro(current_balance.toFixed(2) || 0) })
                } else {
                    replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'SpendenAll.Knöpfe.Hauptmenu'), { callback: '/maincallback' }),
                        ]
                    ]);

                    Message = newi18n.translate(tglang_response, 'SpendenAll.Fehler.NoMoney');
                }

                if ('inline_message_id' in msg) {
                    bot.editMessageText(
                        { inlineMsgId: inlineId }, Message,
                        { parseMode: 'html', replyMarkup }
                    ).catch(error => log.error('Error (editMessageText):', error));
                } else {
                    bot.editMessageText(
                        { chatId: chatId, messageId: messageId }, Message,
                        { parseMode: 'html', replyMarkup }
                    ).catch(error => log.error('Error (editMessageText):', error));
                }
            }).catch(function (error) {
                log.error('Promise: ' + error)
                return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
            });
        } catch (error) {
            log.error('TryCatch: ' + error)
        }
    });

    bot.on(/^\/allyesdonate/i, (msg) => {
        //THIS WILL ONLY WORK WHEN CALLED BY INLINE FUNCTION
        if ('inline_message_id' in msg) {
            var inlineId = msg.inline_message_id;
        } else {
            var chatId = msg.message.chat.id;
            var messageId = msg.message.message_id;
        }

        Promise.all([DB.get.Guests.ByID(msg.from.id), DB.get.plugs.power.kwh(msg.from.id), DB.get.shopinglist.Get(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (response) {
            const [Guest_response, plugs_response, shoppinglist_response, tglang_response] = response;
            let total_shopping = 0;
            const total_powercost = plugs_response.rows[0]?.diff?.toFixed(2) * preisliste.PauschalKosten.StromKWH.Preis || 0;
            const bool_payed = Guest_response[0]?.payed || false;
            const total_payed = Guest_response[0]?.payed_ammount || 0;

            shoppinglist_response.rows.map(row => {
                total_shopping = total_shopping + row.price
            })

            const current_balance = Number(total_payed) - (Number(total_shopping) + Number(total_powercost));

            let Message, replyMarkup;

            replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'SpendenAll.Knöpfe.Hauptmenu'), { callback: '/maincallback' }),
                ]
            ]);

            if (bool_payed && current_balance > 0) {
                let SQLprodukt = {
                    produktname: "Spende",
                    produktcompany: process.env.Company_Name,
                    price: current_balance,
                    bought: 1
                }

                let transaction_id = randomstring.generate({
                    length: mainconfig.RegTokenLength, //DO NOT CHANCE!!!
                    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                });

                DB.write.shopinglist.Buy(msg.from.id, msg.from.id, SQLprodukt, transaction_id).then(function (Write_Shoppinglist) { //Here Stuff needs to be chanced when subusers will be added!!
                    Message = newi18n.translate(tglang_response, 'Inline.Donation', { price: CentToEuro(current_balance), Company_Name: process.env.Company_Name, Company_Name_URL: process.env.Company_Name_URL });
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
                })
            } else {

            }
        }).catch(function (error) {
            log.error('Promise: ' + error)
            return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });
}