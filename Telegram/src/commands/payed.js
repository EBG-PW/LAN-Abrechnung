const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'), ['de', 'en', 'de-by', 'ua', 'it'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');
const { CentToEuro } = require('../../lib/utils');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/payed/i, (msg) => {
        //THIS WILL ONLY WORK WHEN CALLED BY INLINE FUNCTION
        if ('inline_message_id' in msg) {
            var inlineId = msg.inline_message_id;
        } else {
            var chatId = msg.message.chat.id;
            var messageId = msg.message.message_id;
        }

        Promise.all([DB.get.Guests.ByID(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (response) {
            const [Guest_response, tglang_response] = response;
            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Knöpfe.Hauptmenu'), { callback: `/maincallback` })
                ]
            ]);
            let username;
            if ('username' in msg.from) {
                username = msg.from.username.toString();
            } else {
                username = msg.from.first_name.toString();
            }
            let Kosten = CentToEuro(parseInt(Guest_response[0].payed_ammount));

            let Status_String = ""
            if (Guest_response[0].payed === true) {
                Status_String = newi18n.translate(tglang_response, 'Payed.True')
            } else {
                Status_String = newi18n.translate(tglang_response, 'Payed.False')
            }
            let Message = newi18n.translate(tglang_response, 'Payed.Text', { Username: username, Status_String: Status_String, money: Kosten, PayedID: Guest_response[0].pyed_id })
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
            return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });
}