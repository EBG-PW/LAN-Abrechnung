const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'), ['de', 'en', 'de-by', 'ua', 'it'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/lang/i, (msg) => {
        //THIS WILL ONLY WORK WHEN CALLED BY INLINE FUNCTION
        if ('inline_message_id' in msg) {
            var inlineId = msg.inline_message_id;
        } else {
            var chatId = msg.message.chat.id;
            var messageId = msg.message.message_id;
        }
    
        let username;
        if ('username' in msg.from) {
            username = msg.from.username.toString();
        } else {
            username = msg.from.first_name.toString();
        }
    
        DB.get.tglang.Get(msg.from.id).then(function (tglang_response) {
    
            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Sprachen.Knöpfe.DE'), { callback: `lang_de` }),
                    bot.inlineButton(newi18n.translate('en', 'Sprachen.Knöpfe.EN'), { callback: 'lang_en' }),
                    bot.inlineButton(newi18n.translate('en', 'Sprachen.Knöpfe.UA'), { callback: 'lang_ua' }),
                    bot.inlineButton(newi18n.translate('en', 'Sprachen.Knöpfe.IT'), { callback: 'lang_it' }),
                ],
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Sprachen.Knöpfe.Zurück'), { callback: `/moreinfo` }),
                ]
            ]);
    
            let Message = newi18n.translate(tglang_response, 'Sprachen.Text', { Username: username })
    
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
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });
}