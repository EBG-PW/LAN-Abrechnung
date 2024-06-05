const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'),  ['de', 'en', 'de-by', 'de-ooe', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/hauptmenu/i, (msg) => {
        let private;
        if (msg.chat) {
            if (msg.chat.type === "private") { private = true }
        } else {
            if (msg.message.chat.type === "private") { private = true }
        }
        Promise.all([DB.get.Guests.ByID(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (response) {
            const [User_response, tglang_response] = response;
            if (User_response.length > 0) {
                if (private) {
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Zahlung'), { callback: '/payed' }),
                            bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Artikel'), { inlineCurrent: '' })
                        ],
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Spenden'), { callback: '/donate' }),
                            bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Other'), { callback: '/moreinfo' })
                        ],
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Webpanel'), { url: `${process.env.WebPanelURL}/oauth/forward` }),
                        ]
                    ]);

                    let username;
                    if ('username' in msg.from) {
                        username = msg.from.username.toString();
                    } else {
                        username = msg.from.first_name.toString();
                    }

                    if (msg.chat) {
                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Hauptmenu.Text', { Username: username }), { parseMode: 'html', replyMarkup });
                    } else {
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Hauptmenu.Text', { Username: username }), { parseMode: 'html', replyMarkup });
                    }
                } else {
                    if (msg.chat) {
                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Error.NotPrivate'));
                    } else {
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.NotPrivate'));
                    }
                }
            } else {
                log.info(`${msg.from.id} ist nicht registriert`);
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.from.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });

    bot.on(/^\/maincallback/i, (msg) => {
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
                    bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Zahlung'), { callback: '/payed' }),
                    bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Artikel'), { inlineCurrent: '' })
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Spenden'), { callback: '/donate' }),
                    bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Other'), { callback: '/moreinfo' })
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Webpanel'), { url: `${process.env.WebPanelURL}/api/v1/login/login/${msg.from.id}` }),
                ]
            ]);
    
            let username;
            if ('username' in msg.from) {
                username = msg.from.username.toString();
            } else {
                username = msg.from.first_name.toString();
            }
    
            let Message = newi18n.translate(tglang_response, 'Hauptmenu.Text', { Username: username })
    
            if ('inline_message_id' in msg) {
                bot.editMessageText(
                    { inlineMsgId: inlineId }, Message,
                    { parseMode: 'html', replyMarkup }
                ).catch(error => log.error('Error:' + error));
            } else {
                bot.editMessageText(
                    { chatId: chatId, messageId: messageId }, Message,
                    { parseMode: 'html', replyMarkup }
                ).catch(error => log.error('Error:' + error));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });
}