require('dotenv').config();
const path = require('path');
const DB = require('./lib/postgres');
const fs = require('fs');
const randomstring = require('randomstring');
let reqPath = path.join(__dirname, '../');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(reqPath, process.env.Sprache), ["de"], "de");

let mainconfig;

const Telebot = require('telebot');
const bot = new Telebot({
	token: process.env.Telegram_Bot_Token,
	limit: 1000,
        usePlugins: ['commandButton', 'askUser']
});

/* Import Config */
if(fs.existsSync(`${reqPath}${process.env.Config}/mainconfig.json`)) {
	mainconfig = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.Config}/mainconfig.json`));
}

bot.on(/^\/start/i, (msg) => {
    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Regestrieren', {callback: '/reg'})
        ]
    ]);
    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeMSG', {LanName: mainconfig.LanName}), {replyMarkup});
});

bot.on(/^\/reg/i, (msg) => {
    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton(newi18n.translate('de', 'Antworten.Ja'), {callback: 'F_PC_true'}),
            bot.inlineButton(newi18n.translate('de', 'Antworten.Nein'), {callback: 'F_PC_false'})
        ]
    ]);
    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.PC'), {replyMarkup});
});

bot.start();