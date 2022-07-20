const path = require('path');
const DB = require('../../Web/lib/postgres');
const fs = require('fs');
const randomstring = require('randomstring');
let reqPath = path.join(__dirname, '../');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', 'lang'), ['de', 'en'], process.env.Fallback_Language);
const { log } = require('../../Web/lib/logger');

let mainconfig, preisliste;

log.info("All Systems Running!")

const Telebot = require('telebot');
const bot = new Telebot({
    token: process.env.Telegram_Bot_Token,
    limit: 1000,
    usePlugins: ['commandButton', 'askUser']
});

/* Import Config */
if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'mainconfig.json'))) {
    mainconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'mainconfig.json')));
}
if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json'))) {
    preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json')));
}

bot.on(/^\/start/i, (msg) => {
    if (msg.chat.type === "private") {
        DB.get.Guests.ByID(msg.from.id).then(function (User_response) {
            if (User_response.length <= 0 || parseInt(mainconfig.SudoUser) === msg.from.id) {
                let replyMarkup = bot.inlineKeyboard([
                    [
                        bot.inlineButton(newi18n.translate('de', 'Sprachen.Knöpfe.DE'), { callback: `R_${msg.from.id}_setlang_de` }),
                        bot.inlineButton(newi18n.translate('de', 'Sprachen.Knöpfe.EN'), { callback: `R_${msg.from.id}_setlang_en` }),
                        bot.inlineButton(newi18n.translate('de', 'Sprachen.Knöpfe.UA'), { callback: `R_${msg.from.id}_setlang_ua` }),
                        bot.inlineButton(newi18n.translate('de', 'Sprachen.Knöpfe.IT'), { callback: `R_${msg.from.id}_setlang_it` })
                    ],
                    [
                        bot.inlineButton(newi18n.translate('de', 'Knöpfe.Reg'), { callback: `R_${msg.from.id}_rules` })
                    ]
                ]);
                return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeMSG', { LanName: mainconfig.LanName }), { replyMarkup });
            } else {
                if (User_response[0].pyed_id !== null) {
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Knöpfe.Hauptmenu'), { callback: `/hauptmenu` })
                        ]
                    ]);
                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeMSGAR', { LanName: mainconfig.LanName }), { replyMarkup });
                } else {
                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeErr'));

                }
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Error.DBFehler'));
        })
    } else {
        return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Error.NotPrivate'));
    }
});

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
            ).catch(error => log.error('Error:', error));
        } else {
            bot.editMessageText(
                { chatId: chatId, messageId: messageId }, Message,
                { parseMode: 'html', replyMarkup }
            ).catch(error => log.error('Error:', error));
        }
    }).catch(function (error) {
        log.error(error)
        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
    });
});















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
                        bot.inlineButton(newi18n.translate(tglang_response, 'Hauptmenu.Knöpfe.Webpanel'), { url: `${process.env.WebPanelURL}/api/v1/login/login/${msg.from.id}` }),
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
        return bot.sendMessage(chatId, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
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
        let Kosten = CentToEuro(parseInt(mainconfig.LanDauer) * parseInt(preisliste.FixKostenProTag));
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
                Message = newi18n.translate(tglang_response, 'Inline.Donation', { price: CentToEuro(current_balance) , Company_Name: process.env.Company_Name, Company_Name_URL: process.env.Company_Name_URL});
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















bot.on(/^\/rules/i, (msg) => {
    Promise.all([DB.get.tglang.Get(msg.from.id), DB.get.Guests.ByID(msg.from.id)]).then(function (response) {
        const [tglang_response, Guest_response] = response;
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton(newi18n.translate(tglang_response, 'Moreinfo.Regeln.Exit'), { callback: `delete_this` })
            ]
        ]);
        let Message = []
        Message.push(newi18n.translate(tglang_response, 'Regeln.Text'))
        for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Regeln.RegelnAnzahl')); i++) {
            Message.push(newi18n.translate(tglang_response, `Regeln.Regeln.${i}`))
        }
        Message.push(newi18n.translate(tglang_response, `Moreinfo.Regeln.AcceptedDate`, { akteptiert: new Date(Guest_response[0].accepted_rules).toLocaleDateString('de-DE') }))
        Message = Message.join("\n")
        return bot.sendMessage(msg.message.chat.id, Message, { replyMarkup, parseMode: 'html' });
    }).catch(function (error) {
        log.error(error)
        return bot.sendMessage(msg.message.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
    })
});

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














//Admin Managment 
bot.on(/^\/admin( .+)*/i, (msg, props) => {
    let AvaibleModes = ['add', 'remove', 'rem', 'list']
    let CheckAtributes = AtrbutCheck(props);
    Promise.all([DB.get.tglang.Get(msg.from.id), DB.get.Guests.Check.Admin(msg.from.id)]).then(function (response) {
        const [tglang_response, Admin_Check_response] = response;
        if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
            if (CheckAtributes.hasAtributes) {
                if ('reply_to_message' in msg) {
                    if (AvaibleModes.includes(CheckAtributes.atributes[0])) {
                        let UserID = msg.reply_to_message.from.id
                        let username;
                        if ('username' in msg.reply_to_message.from) {
                            username = msg.reply_to_message.from.username.toString();
                        } else {
                            username = msg.reply_to_message.from.first_name.toString();
                        }

                        if (CheckAtributes.atributes[0] === "add") {
                            DB.write.Guests.UpdateCollumByID(UserID, 'admin', true).then(function (Admin_Update_response) {
                                if (Admin_Update_response.rowCount === 1) {
                                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.AddSuccsess', { Username: username, UserID: UserID }));
                                } else {
                                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.AddNoSuccsess'));
                                }
                            });
                        } else if (CheckAtributes.atributes[0] === "rem" || CheckAtributes.atributes[0] === "remove") {
                            DB.write.Guests.UpdateCollumByID(UserID, 'admin', false).then(function (Admin_Update_response) {
                                if (Admin_Update_response.rowCount === 1) {
                                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.RemSuccsess', { Username: username, UserID: UserID }));
                                } else {
                                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.RemNoSuccsess'));
                                }
                            });
                        }
                    } else {
                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustHaveAtributes', { Atributes: AvaibleModes.join(", ") }));
                    }
                } else {
                    if (CheckAtributes.atributes[0] === "list") {
                        DB.get.Guests.Admins().then(function (Admin_List_response) {
                            let AdminList = "";
                            Admin_List_response.map(Admin => {
                                AdminList = `${AdminList}\n- ${Admin.username}(${Admin.userid})`
                            });
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.list', { AdminList: AdminList }));
                        });
                    } else {
                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeReply'));
                    }
                }
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustHaveAtributes', { Atributes: AvaibleModes.join(", ") }));
            }
        } else {
            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
        }
    }).catch(function (error) {
        log.error(error)
        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
    })
});

bot.on(/^\/loadprice/i, (msg) => {
    var run_start = new Date().getTime();
    if (fs.existsSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json'))) {
        preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', 'config', 'preisliste.json')));
    }
    Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
        const [Admin_Check_response, tglang_response] = values;
        log.error(tglang_response)
        if (Admin_Check_response) {
            let Restul_array = [];
            for (const key in preisliste.SnackBar) {
                Restul_array.push(DB.write.Products.Add(preisliste.SnackBar[key]))
            }
            Promise.all(Restul_array).then(function (Insert_Response) {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'loadprice.Text', { Amount: Insert_Response.length, duration: TimeConvert(new Date().getTime() - run_start) }));
            }).catch(function (error) {
                log.error(error)
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
            })
        } else {
            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
        }
    }).catch(function (error) {
        log.error(error)
        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
    })
});










//Inline Buttons Hanlder
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
                    bot.deleteMessage(chatId, messageId).catch(error => log.error('Error:', error));
                }
            }
            if (data[0] === "lang") {
                DB.write.tglang.Set(msg.from.id, data[1]).then(function (lang_edit_response) {
                    bot.answerCallbackQuery(msg.id)
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'Sprachen.Knöpfe.DE'), { callback: `lang_de` }),
                            bot.inlineButton(newi18n.translate('en', 'Sprachen.Knöpfe.EN'), { callback: 'lang_en' }),
                            bot.inlineButton(newi18n.translate('en', 'Sprachen.Knöpfe.UA'), { callback: 'lang_ua' }),
                            bot.inlineButton(newi18n.translate('en', 'Sprachen.Knöpfe.IT'), { callback: 'lang_it' }),
                        ],
                        [
                            bot.inlineButton(newi18n.translate(data[1], 'Sprachen.Knöpfe.Zurück'), { callback: `/moreinfo` }),
                        ]
                    ]);

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
                        ).catch(error => log.error('Error:', error));
                    } else {
                        bot.editMessageText(
                            { chatId: chatId, messageId: messageId }, Message,
                            { parseMode: 'html', replyMarkup }
                        ).catch(error => log.error('Error:', error));
                    }
                });
            }
            if (data[0] === 'Buy') {
                if (data[1] === 'Main') {
                    DB.get.Products.Get(data[2]).then(function (product_response) {
                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Add'), { callback: `Buy_Add` }),
                                bot.inlineButton(`1/${product_response.rows[0].amount - product_response.rows[0].bought}`, { callback: `${data[2]}` }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Remove'), { callback: `Buy_Rem` })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Abbrechen'), { callback: `Buy_Escape` }),
                                bot.inlineButton(`${CentToEuro(product_response.rows[0].price)}`, { callback: `${product_response.rows[0].price}` }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Bestätigen'), { callback: `Buy_Confirm` })
                            ]
                        ]);

                        let Message = `${newi18n.translate(tglang_response, 'Inline.MainProgress')}`

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

                        return bot.sendMessage(msg.from.id, newi18n.translate(tglang_response, 'Inline.MainMessage', { price: CentToEuro(product_response.rows[0].price), storrage: product_response.rows[0].amount - product_response.rows[0].bought, produktname: product_response.rows[0].produktname, produktcompany: product_response.rows[0].produktcompany }), { parseMode: `html`, replyMarkup });
                    });
                }
                if (data[1] === 'Add') {
                    bot.answerCallbackQuery(msg.id);
                    let amount_split = msg.message.reply_markup.inline_keyboard[0][1].text.split("/")
                    let product = msg.message.reply_markup.inline_keyboard[0][1].callback_data;
                    let amount_to_buy = amount_split[0];
                    let amount_max = amount_split[1]
                    let price = msg.message.reply_markup.inline_keyboard[1][1].callback_data;

                    if (parseInt(amount_max) > parseInt(amount_to_buy)) {
                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Add'), { callback: `Buy_Add` }),
                                bot.inlineButton(`${parseInt(amount_to_buy) + 1}/${amount_max}`, { callback: `${product}` }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Remove'), { callback: `Buy_Rem` })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Abbrechen'), { callback: `Buy_Escape` }),
                                bot.inlineButton(`${CentToEuro(parseInt(price) * (parseInt(amount_to_buy) + 1))}`, { callback: `${price}` }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Bestätigen'), { callback: `Buy_Confirm` })
                            ]
                        ]);

                        if ('inline_message_id' in msg) {
                            bot.editMessageText(
                                { inlineMsgId: inlineId }, msg.message.text,
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error('Error:', error));
                        } else {
                            bot.editMessageText(
                                { chatId: chatId, messageId: messageId }, msg.message.text,
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error('Error:', error));
                        }
                    } else {
                        bot.answerCallbackQuery(msg.id, {
                            text: newi18n.translate(tglang_response, 'Inline.TooMutch'),
                            showAlert: true
                        });
                    }
                }
                if (data[1] === 'Rem') {
                    bot.answerCallbackQuery(msg.id);
                    let amount_split = msg.message.reply_markup.inline_keyboard[0][1].text.split("/")
                    let product = msg.message.reply_markup.inline_keyboard[0][1].callback_data;
                    let amount_to_buy = amount_split[0];
                    let amount_max = amount_split[1]
                    let price = msg.message.reply_markup.inline_keyboard[1][1].callback_data;

                    if (1 < parseInt(amount_to_buy)) {
                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Add'), { callback: `Buy_Add` }),
                                bot.inlineButton(`${parseInt(amount_to_buy) - 1}/${amount_max}`, { callback: `${product}` }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Remove'), { callback: `Buy_Rem` })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Abbrechen'), { callback: `Buy_Escape` }),
                                bot.inlineButton(`${CentToEuro(parseInt(price) * (parseInt(amount_to_buy) - 1))}`, { callback: `${price}` }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Bestätigen'), { callback: `Buy_Confirm` })
                            ]
                        ]);

                        if ('inline_message_id' in msg) {
                            bot.editMessageText(
                                { inlineMsgId: inlineId }, msg.message.text,
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error('Error:', error));
                        } else {
                            bot.editMessageText(
                                { chatId: chatId, messageId: messageId }, msg.message.text,
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error('Error:', error));
                        }
                    } else {
                        bot.answerCallbackQuery(msg.id, {
                            text: newi18n.translate(tglang_response, 'Inline.TooLitle'),
                            showAlert: true
                        });
                    }
                }
                if (data[1] === 'Escape') {
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            { inlineMsgId: inlineId }, newi18n.translate(tglang_response, 'Inline.Escape'),
                            { parseMode: 'html' }
                        ).catch(error => log.error('Error:', error));
                    } else {
                        bot.editMessageText(
                            { chatId: chatId, messageId: messageId }, newi18n.translate(tglang_response, 'Inline.Escape'),
                            { parseMode: 'html' }
                        ).catch(error => log.error('Error:', error));
                    }
                }
                if (data[1] === 'Confirm') {
                    let amount_split = msg.message.reply_markup.inline_keyboard[0][1].text.split("/")
                    let product = msg.message.reply_markup.inline_keyboard[0][1].callback_data;
                    let amount_to_buy = amount_split[0];
                    let price = msg.message.reply_markup.inline_keyboard[1][1].callback_data;

                    DB.get.Guests.ByID(msg.from.id).then(function (guest_response) {
                        if (guest_response[0].payed === true || guest_response[0].payed === "true") {
                            DB.get.Products.Get(product).then(function (product_response) {
                                if (product_response.rows.length >= 1) {
                                    if (parseInt(product_response.rows[0].amount) - parseInt(product_response.rows[0].bought) >= parseInt(amount_to_buy)) {
                                        DB.write.Products.UpdateBought(product, product_response.rows[0].bought, Number(product_response.rows[0].bought) + Number(amount_to_buy)).then(function (update_response) {
                                            if (update_response.rowCount === 1) {
                                                let SQLprodukt = {
                                                    produktname: product,
                                                    produktcompany: product_response.rows[0].produktcompany,
                                                    price: product_response.rows[0].price * amount_to_buy,
                                                    bought: amount_to_buy
                                                }

                                                let transaction_id = randomstring.generate({
                                                    length: mainconfig.RegTokenLength, //DO NOT CHANCE!!!
                                                    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                                                });

                                                DB.write.shopinglist.Buy(msg.from.id, msg.from.id, SQLprodukt, transaction_id).then(function (Write_Shoppinglist) { //Here Stuff needs to be chanced when subusers will be added!!
                                                    let MSG;
                                                    if (product === "Spende") {
                                                        MSG = newi18n.translate(tglang_response, 'Inline.Donation', { price: CentToEuro(price * amount_to_buy) })
                                                    } else {
                                                        if (amount_to_buy >= 2) {
                                                            MSG = newi18n.translate(tglang_response, 'Inline.ItemsBought', { produktname: product, produktcompany: product_response.rows[0].produktcompany, price: CentToEuro(price * amount_to_buy), amount: amount_to_buy })
                                                        } else {
                                                            MSG = newi18n.translate(tglang_response, 'Inline.ItemBought', { produktname: product, produktcompany: product_response.rows[0].produktcompany, price: CentToEuro(price * amount_to_buy), amount: amount_to_buy })
                                                        }
                                                    }
                                                    if ('inline_message_id' in msg) {
                                                        bot.editMessageText(
                                                            { inlineMsgId: inlineId }, MSG,
                                                            { parseMode: 'html' }
                                                        ).catch(error => log.error('Error:', error));
                                                    } else {
                                                        bot.editMessageText(
                                                            { chatId: chatId, messageId: messageId }, MSG,
                                                            { parseMode: 'html' }
                                                        ).catch(error => log.error('Error:', error));
                                                    }
                                                })
                                            } else {
                                                //Produkt wurde zeitgleich von jemand anderem gekauft
                                                return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.OtherBuy'));
                                            }
                                        });
                                    } else {
                                        //Produkt nicht in ausreichender Menge verfügbar
                                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.NotEnoth', { produktname: product, produktcompany: product_response.rows[0].produktcompany }));
                                    }
                                } else {
                                    //Produkt existiert nimmer
                                    return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.DoesNotExist', { produktname: product, produktcompany: product_response.rows[0].produktcompany }));
                                }
                            }).catch(function (error) {
                                log.error(error)
                                return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                            })
                        } else {
                            //Nutzer hat noch nicht gezahlt
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.NotPayed'));
                        }
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }
            }














            // Methods to handle the regestration Questions...
            if (data[0] === 'F') {
                if (data[1] === 'PC') //If quest has PC with him
                {
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "pc", data[2]).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${boolToText(data[2], tglang_response)}`
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

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton('1', { callback: 'F_DPC_1' }),
                                bot.inlineButton('2', { callback: 'F_DPC_2' }),
                                bot.inlineButton('3', { callback: 'F_DPC_3' })
                            ], [
                                bot.inlineButton('4', { callback: 'F_DPC_4' }),
                                bot.inlineButton('5', { callback: 'F_DPC_5' }),
                                bot.inlineButton('6', { callback: 'F_DPC_6' })
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.Displays'), { replyMarkup });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }

                if (data[1] === 'DPC') //How many Displays does he got (For Space Reasons)
                {
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "displays_count", data[2]).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${data[2]}`
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

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Ja'), { callback: 'F_LK_true' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Nein'), { callback: 'F_LK_false' })
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.LanKabel'), { replyMarkup });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }

                if (data[1] === 'LK') //Does the guest got a LAN cable that he will bring to the event
                {
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "network_cable", data[2]).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${boolToText(data[2], tglang_response)}`
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

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Ja'), { callback: 'F_VR_true' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Nein'), { callback: 'F_VR_false' })
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.VR'), { replyMarkup });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }

                if (data[1] === 'VR')  //Does teh guest got a VR-Headset (For Space resons)
                {
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "vr", data[2]).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${boolToText(data[2], tglang_response)}`
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

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Vollständig'), { callback: 'F_VC_Voll' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Teil'), { callback: 'F_VC_Teil' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.Nein'), { callback: 'F_VC_Nein' })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Antworten.NichtSagen'), { callback: 'F_VC_Secret' })
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.Vaccinated'), { replyMarkup });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }

                if (data[1] === 'VC')  //Is the guest Vaccinated
                {
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "vaccinated", data[2]).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Vaccinated.${data[2]}`)}`
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

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Arrivale.1_Voll'), { callback: 'F_EA_1' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Arrivale.2_Voll'), { callback: 'F_EA_2' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Arrivale.3_Voll'), { callback: 'F_EA_3' })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Arrivale.4_Voll'), { callback: 'F_EA_4' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Arrivale.5_Voll'), { callback: 'F_EA_5' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Arrivale.6_Voll'), { callback: 'F_EA_6' })
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.Arrivale'), { replyMarkup });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }

                if (data[1] === 'EA')  //Planned arrival time
                {
                    let DateArray = newi18n.translate(tglang_response, `Arrivale.${data[2]}`).split(".");
                    let newDateString = `${DateArray[1]}/${DateArray[0]}/${DateArray[2]}`;
                    let newDate = new Date(newDateString);
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "expected_arrival", newDate).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Arrivale.${data[2]}_Voll`)}`
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

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Depature.1_Voll'), { callback: 'F_ED_1' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Depature.2_Voll'), { callback: 'F_ED_2' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Depature.3_Voll'), { callback: 'F_ED_3' })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Depature.4_Voll'), { callback: 'F_ED_4' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Depature.5_Voll'), { callback: 'F_ED_5' }),
                                bot.inlineButton(newi18n.translate(tglang_response, 'Depature.6_Voll'), { callback: 'F_ED_6' })
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.Depature'), { replyMarkup });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }

                if (data[1] === 'ED') //Planned departure time
                {
                    let DateArray = newi18n.translate(tglang_response, `Depature.${data[2]}`).split(".");
                    let newDateString = `${DateArray[1]}/${DateArray[0]}/${DateArray[2]}`;
                    let newDate = new Date(newDateString);
                    DB.write.Guests.UpdateCollumByID(msg.from.id, "expected_departure", newDate).then(function (response) {
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate(tglang_response, `Depature.${data[2]}_Voll`)}`
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

                        let WebToken = randomstring.generate({
                            length: mainconfig.RegTokenLength, //DO NOT CHANCE!!!
                            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                        });

                        DB.write.RegToken.NewToken(msg.from.id, msg.from.username, WebToken).then(function (response) {

                            let replyMarkup = bot.inlineKeyboard([
                                [
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Knöpfe.WebReg'), { url: `${process.env.WebPanelURL}/api/v1/register/load/${WebToken}` })
                                ]
                            ]);

                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Fragen.WebReg'), { replyMarkup });

                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                        })


                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    })
                }
            }
        } else { //USER BOUNT QUESTIONS (May be executed first)
            if (data[0] === 'R') {
                if (data[2] === 'setlang') {
                    DB.write.tglang.Set(msg.from.id, data[3]).then(function (response) {
                        bot.answerCallbackQuery(msg.id)
                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton('🇩🇪', { callback: `R_${msg.from.id}_setlang_de` }),
                                bot.inlineButton('🇬🇧', { callback: `R_${msg.from.id}_setlang_en` }),
                                bot.inlineButton('🇺🇦', { callback: `R_${msg.from.id}_setlang_ua` }),
                                bot.inlineButton('🇮🇹', { callback: `R_${msg.from.id}_setlang_it` })
                            ],
                            [
                                bot.inlineButton(newi18n.translate(data[3], 'Knöpfe.Reg'), { callback: `R_${msg.from.id}_rules` })
                            ]
                        ]);

                        if ('inline_message_id' in msg) {
                            bot.editMessageText(
                                { inlineMsgId: inlineId }, newi18n.translate(data[3], 'WellcomeMSG', { LanName: mainconfig.LanName }),
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error('Error:', error));
                        } else {
                            bot.editMessageText(
                                { chatId: chatId, messageId: messageId }, newi18n.translate(data[3], 'WellcomeMSG', { LanName: mainconfig.LanName }),
                                { parseMode: 'html', replyMarkup }
                            ).catch(error => log.error('Error:', error));
                        }
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                    });
                }
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
                            for (i = 0; i < parseInt(newi18n.translate(tglang_response, 'Regeln.RegelnAnzahl')); i++) {
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

/* - - - - Telegram Inline Handler - - - - */
/* - - This is the live search function - - */

bot.on('inlineQuery', msg => {
    let query = msg.query.toLowerCase();
    let queryarr = query.split('');
    const answers = bot.answerList(msg.id, { cacheTime: 1 });
    DB.get.tglang.Get(msg.from.id).then(function (tglang_response) {
        if (queryarr.length === 0) {
            DB.get.Products.GetAll("produktname").then(function (AllProducts) {
                let ProductString = "";
                AllProducts.rows.map(Product => {
                    ProductString = `${ProductString}${Product.produktname} - Auf Lager: ${Product.amount - Product.bought} zum Preis von ${CentToEuro(Product.price)} pro Stück\n`
                })
                answers.addArticle({
                    id: `${newi18n.translate(tglang_response, `Inline.NoQuery.ID`)}`,
                    title: `${newi18n.translate(tglang_response, `Inline.NoQuery.Text`)}`,
                    description: msg.query,
                    message_text: (`${newi18n.translate(tglang_response, `Inline.NoQuery.Message`)}\n${ProductString}`),
                    parse_mode: 'html'
                });
                return bot.answerQuery(answers).catch(function (error) {
                    log.error(error)
                })
            });
        } else {
            DB.get.Products.LikeGet(query).then(function (Product_Response) {
                let rows = Product_Response.rows
                if (Object.entries(rows).length === 0) {
                    answers.addArticle({
                        id: `${newi18n.translate(tglang_response, `Inline.NotFound.ID`)}`,
                        title: `${newi18n.translate(tglang_response, `Inline.NotFound.Text`)}`,
                        description: msg.query,
                        message_text: (`${newi18n.translate(tglang_response, `Inline.NotFound.Message`)}`),
                        parse_mode: 'html'
                    });
                    return bot.answerQuery(answers).catch(function (error) {
                        log.error(error)
                    })
                } else {
                    idCount = 0;
                    for (i in rows) {

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Kaufen'), { callback: `Buy_Main_${rows[i].produktname}` })
                            ]
                        ]);

                        if (rows[i].amount - rows[i].bought > 0) {

                            answers.addArticle({
                                id: `${newi18n.translate(tglang_response, `Inline.Found.ID`, { ID: idCount })}`,
                                title: `${newi18n.translate(tglang_response, `Inline.Found.Text`, { Produkt: rows[i].produktname, Hersteller: rows[i].produktcompany })}`,
                                description: `${newi18n.translate(tglang_response, `Inline.Found.Beschreibung`, { Preis: CentToEuro(rows[i].price), Verfügbar: rows[i].amount - rows[i].bought })}`,
                                message_text: `${newi18n.translate(tglang_response, `Inline.Found.Message`, { price: CentToEuro(rows[i].price), storrage: rows[i].amount - rows[i].bought, produktname: rows[i].produktname, produktcompany: rows[i].produktcompany })}`,
                                reply_markup: replyMarkup,
                                parse_mode: 'html'
                            });
                            idCount++
                        }
                    }

                    if (idCount === 0) {
                        answers.addArticle({
                            id: `${newi18n.translate(tglang_response, `Inline.NotFound.ID`)}`,
                            title: `${newi18n.translate(tglang_response, `Inline.NotFound.Text`)}`,
                            description: msg.query,
                            message_text: (`${newi18n.translate(tglang_response, `Inline.NotFound.Message`)}`),
                            parse_mode: 'html'
                        });
                    }

                    return bot.answerQuery(answers).catch(function (error) {
                        log.error(error)
                    })
                }
            });
        }
    }).catch(function (error) {
        log.error(error)
    });
});

bot.start();

/* - - - - Telegram External Functions - - - - */

/**
 * This function will send a user the conferm message of his web reg
 * @param {number} ChatID
 * @returns Object
 */
let WebRegSendConfim = function (ChatID) {
    return new Promise(function (resolve, reject) {

        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton(newi18n.translate(tglang_response, 'Knöpfe.Hauptmenu'), { callback: '/hauptmenu' })
            ]
        ]);

        let Kosten = CentToEuro(parseInt(mainconfig.LanDauer) * parseInt(preisliste.FixKostenProTag));
        let PayCode = randomstring.generate({
            length: 8,
            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        });

        let Money_Amount = parseInt(mainconfig.LanDauer) * parseInt(preisliste.FixKostenProTag);
        DB.write.Guests.UpdateCollumByID(ChatID, 'payed_ammount', Money_Amount).then(function (money_edit_response) {
            DB.write.Guests.UpdateCollumByID(ChatID, 'pyed_id', PayCode).then(function (guest_edit_response) {
                bot.sendMessage(ChatID, newi18n.translate(tglang_response, 'PaySystem.Sucsess', { Bank: mainconfig.KontoBank, IBAN: mainconfig.KontoIban, Kontoinhaber: mainconfig.KontoInhaber, Verwendungszweg: mainconfig.Verwendungszweg, PayCode: PayCode, Kosten: Kosten }), { parseMode: 'html', replyMarkup }).then(function (msg_send) {
                    resolve(msg_send)
                }).catch(function (error) {
                    reject(error)
                })
            }).catch(function (error) {
                reject(error)
            })
        });
    });
}

/* - - - - Helper Functions - - - - */

/**
 * This function will translate bool to string
 * @param {boolean | string} bool
 * @param {string} tglang_response
 * @returns {string}
 */
function boolToText(bool, tglang_response) {
    if (bool === true || bool === "true") {
        return newi18n.translate(tglang_response, 'Antworten.Ja')
    } else {
        return newi18n.translate(tglang_response, 'Antworten.Nein')
    }
}

/**
 * This function will handle pops of telebot
 * @param {props} props
 * @returns {object}
 */
function AtrbutCheck(props) {
    let input = props.match.input.split(' ')
    if (input[0].endsWith(process.env.Telegram_Bot_Botname)) {
        let atributesWName = [];
        for (let i = 1; i <= input.length - 1; i++) {
            atributesWName.push(input[i])
        }
        if (atributesWName.length >= 1) {
            return { hasAtributes: true, atributes: atributesWName }
        } else {
            return { hasAtributes: false }
        }
    } else {
        if (typeof (props.match[1]) === 'undefined') {
            return { hasAtributes: false }
        } else {
            let atributeOName = [];
            let input = props.match[1].split(' ')
            for (let i = 1; i <= input.length - 1; i++) {
                atributeOName.push(input[i])
            }
            return { hasAtributes: true, atributes: atributeOName }
        }
    }
}

/**
 * This function will convert cents to Euro ISO 
 * @param {string} value
 * @returns {string}
 */
function CentToEuro(value) {
    var euro = value / 100;
    return euro.toLocaleString("de-De", { style: "currency", currency: "EUR" });
}

/**
 * This function will convert <nl> to \n
 * @param {string} value
 * @returns {string}
 */
function NLtoJSNL(value) {
    return value.split("<nl>").join("\n")
}

/**
 * This function will convert a timediff into a humane readable string
 * @param {number} timediff
 * @returns {string}
 */
function TimeConvert(timediff) {
    if (timediff >= 1000) {
        if (timediff / 1000 >= 60) {
            return `${timediff / 1000 * 60}m`
        }
        return `${timediff / 1000}s`
    } else {
        return `${timediff}ms`
    }
}

/* - - - - Database Event Checker - - - - */

/*

setInterval(function () {
    DB.message.GetAll().then(function (list) {
        if (list.rows.length >= 1) {
            list.rows.map(row => {
                if (row.type === "Function") { //Run all Funktions from here
                    if (row.message === "Web_Register") {
                        WebRegSendConfim(row.chatid).then(function (msg_send) {
                            DB.message.Delete(row.id).then(function (del_message) {
                                log.error(`Task for Telegram, with ID ${row.id} was prossesed.`)
                            });
                        }).catch(function (error) {
                            log.error(`Error while prossesing Task for Telegram, with ID ${row.id}:`)
                            log.error(error)
                        })
                    }
                } else if (row.type === "Message") {
                    bot.sendMessage(row.chatid, NLtoJSNL(row.message), { parseMode: 'html' }).then(function (sendMessage) {
                        DB.message.Delete(row.id).then(function (del_message) {
                            log.error(`Task for Telegram, with ID ${row.id} was prossesed.`)
                        });
                    }).catch(function (error) {
                        log.error(`Error while prossesing Task for Telegram, with ID ${row.id}:`)
                        log.error(error)
                    })
                }
            });
        }
    });
}, 5000);

*/