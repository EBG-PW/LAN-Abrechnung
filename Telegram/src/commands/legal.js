const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../','../', 'lang'), ['de', 'en', 'de-by'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/legal/i, (msg) => {
        Promise.all([DB.get.tglang.Get(msg.from.id), DB.get.Guests.ByID(msg.from.id)]).then(function (response) {
            const [tglang_response, Guest_response] = response;
            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Legal.Exit'), { callback: `delete_this` })
                ]
            ]);
            let Message = []
            Message.push(newi18n.translate(tglang_response, 'Legal.Text'))
            for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Legal.LegalAnzahl')); i++) {
                Message.push('- ' + newi18n.translate(tglang_response, `Legal.Legal.${i}`))
            }
            Message.push(newi18n.translate(tglang_response, `Moreinfo.Legal.AcceptedDate`, { akteptiert: new Date(Guest_response[0].accepted_legal).toLocaleDateString('de-DE') }))
            Message = Message.join("\n")
            return bot.sendMessage(msg.message.chat.id, Message, { replyMarkup, parseMode: 'html' });
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.message.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        })
    });
    
}