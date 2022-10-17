const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'),  ['de', 'en', 'de-by', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/moreinfo/i, (msg) => {
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
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Knöpfe.Rules'), { callback: '/rules' }),
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Knöpfe.Legal'), { callback: `/legal` })
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Knöpfe.Sprache'), { callback: `/lang` }),
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Knöpfe.Hauptmenu'), { callback: `/maincallback` }),
                ]
            ]);

            let username;
            if ('username' in msg.from) {
                username = msg.from.username.toString();
            } else {
                username = msg.from.first_name.toString();
            }

            let Message = newi18n.translate(tglang_response, 'Moreinfo.Text', { Username: username })

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
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });
}