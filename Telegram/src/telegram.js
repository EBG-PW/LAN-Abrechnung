const path = require('path');
const DB = require('../../Web/lib/postgres');
const fs = require('fs');
const randomstring = require('randomstring');
let reqPath = path.join(__dirname, '../');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', 'lang'),  ['de', 'en', 'de-by', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { log } = require('../../Web/lib/logger');
const { CentToEuro } = require('../lib/utils');
const pm2ctl = require('pm2-ctl');
const ecosystem = require('../../ecosystem.config.js');
const PlugsServer_Process_Name = ecosystem.apps[2].name;

setInterval(function () {
    pm2ctl.SendEvent.ToProcess(PlugsServer_Process_Name, { event: 'KeepAliveNotify', data: { name: "TelegramBot" } })
}, 55 * 1000);

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

const command_Plugins = []

// Import all commands and callbackQuery Menues
fs.readdirSync(path.join(__dirname, 'commands')).forEach(function (file) {
    if (file.match(/\.js$/) !== null && file !== 'telegram.js') {
        let name = file.replace('.js', '');
        command_Plugins[name] = require(path.join(__dirname, 'commands', file));
        console.log(`[bot.plugin] loaded '${name}' command`);
        command_Plugins[name](bot, mainconfig, preisliste);
    }
});

// Import all callbackQuerys
fs.readdirSync(path.join(__dirname, 'callbackQuery')).forEach(function (file) {
    if (file.match(/\.js$/) !== null && file !== 'telegram.js') {
        let name = file.replace('.js', '');
        command_Plugins[name] = require(path.join(__dirname, 'callbackQuery', file));
        console.log(`[bot.plugin] loaded '${name}' callbackQuery`);
        command_Plugins[name](bot, mainconfig, preisliste);
    }
});

/* - - - - Telegram Inline Handler - - - - */
/* - - This is the live search function - - */

bot.on('inlineQuery', msg => {
    let query = msg.query.toLowerCase();
    let queryarr = query.split('');
    let queryarr2 = query.split('_');
    const answers = bot.answerList(msg.id, { cacheTime: 1 });
    DB.get.tglang.Get(msg.from.id).then(function (tglang_response) {
        if (queryarr2[0] === "subguest") {
            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.SubUserInvite'), { url: `https://t.me/${process.env.Telegram_Bot_Botname}?start=SubGuest_${queryarr2[1]}` })
                ]
            ]);
            answers.addArticle({
                id: `000`,
                title: `${newi18n.translate(tglang_response, `Inline.SubUserInvite.Title`)}`,
                description: `${newi18n.translate(tglang_response, `Inline.SubUserInvite.Description`)}`,
                message_text: (`${newi18n.translate(tglang_response, `Inline.SubUserInvite.Text`)}`),
                reply_markup: replyMarkup,
                parse_mode: 'html'
            });
            return bot.answerQuery(answers).catch(function (error) {
                log.error(error)
            })
        } else {
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
                        const message = newi18n.translate(tglang_response, `Inline.NotFound.Message`, {Article: msg.query});
                        answers.addArticle({
                            id: `${newi18n.translate(tglang_response, `Inline.NotFound.ID`)}`,
                            title: `${newi18n.translate(tglang_response, `Inline.NotFound.Text`)}`,
                            description: msg.query,
                            message_text: message,
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
                            const message = newi18n.translate(tglang_response, `Inline.NotFound.Message`, {Article: "msg.query"});
                            answers.addArticle({
                                id: `${newi18n.translate(tglang_response, `Inline.NotFound.ID`)}`,
                                title: `${newi18n.translate(tglang_response, `Inline.NotFound.Text`)}`,
                                description: msg.query,
                                message_text: message,
                                parse_mode: 'html'
                            });
                        }

                        return bot.answerQuery(answers).catch(function (error) {
                            log.error(error)
                        })
                    }
                });
            }
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
const WebRegSendConfim = (ChatID) => {
    return new Promise(function (resolve, reject) {
        DB.get.tglang.Get(ChatID).then(function (tglang_response) {
            let replyMarkupSubGuest = bot.inlineKeyboard([
                [
                    bot.inlineButton(newi18n.translate(tglang_response, 'Knöpfe.Hauptmenu'), { callback: '/hauptmenu' })
                ]
            ]);

            let PayCode = randomstring.generate({
                length: 8,
                charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
            });
            DB.get.Guests.ByID(ChatID).then(function (Guest_Response) {
                if (Guest_Response[0].hauptgast_userid === null) {
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate(tglang_response, 'Knöpfe.SubGuest'), { inline: `SubGuest_${ChatID}` })
                        ], [
                            bot.inlineButton(newi18n.translate(tglang_response, 'Knöpfe.Hauptmenu'), { callback: '/hauptmenu' })
                        ]
                    ]);
                    // No Hauptgast ID is set, so its normal registration
                    const expected_arrival = new Date(Guest_Response[0].expected_arrival);
                    const expected_departure = new Date(Guest_Response[0].expected_departure);
                    const diffTime = Math.abs(expected_departure - expected_arrival);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    let Money_Amount = parseInt(diffDays) * parseInt(preisliste.FixKostenProTag);
                    DB.write.Guests.UpdateCollumByID(ChatID, 'payed_ammount', Money_Amount).then(function (money_edit_response) {
                        DB.write.Guests.UpdateCollumByID(ChatID, 'pyed_id', PayCode).then(function (guest_edit_response) {
                            bot.sendMessage(ChatID, newi18n.translate(tglang_response, 'PaySystem.Success', {
                                Bank: mainconfig.KontoBank,
                                IBAN: mainconfig.KontoIban,
                                Kontoinhaber: mainconfig.KontoInhaber,
                                Verwendungszweg: mainconfig.Verwendungszweg,
                                PayCode: PayCode,
                                Kosten: CentToEuro(Money_Amount),
                                DiffDays: diffDays
                            }), { parseMode: 'html', replyMarkup }).then(function (msg_send) {
                                resolve(msg_send)
                            }).catch(function (error) {
                                reject(error)
                            })
                        }).catch(function (error) {
                            reject(error)
                        })
                    });
                } else {
                    Promise.all([DB.get.tglang.Get(Guest_Response[0].hauptgast_userid), DB.get.Guests.ByID(Guest_Response[0].hauptgast_userid)]).then(function (HauptUser_Response_main) {
                        const [tglang_response_haupt, HauptUser_Response] = HauptUser_Response_main;
                        // Hauptgast ID is set, so its a sub guest registration
                        const expected_arrival = new Date(Guest_Response[0].expected_arrival);
                        const expected_departure = new Date(Guest_Response[0].expected_departure);
                        const diffTime = Math.abs(expected_departure - expected_arrival);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        let Money_Amount = parseInt(diffDays) * (parseInt(preisliste.FixKostenProTag) / 1.7);

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate(tglang_response_haupt, 'Knöpfe.SubGuest'), { inline: `SubGuest_${Guest_Response[0].hauptgast_userid}` })
                            ], [
                                bot.inlineButton(newi18n.translate(tglang_response_haupt, 'Knöpfe.Hauptmenu'), { callback: '/hauptmenu' })
                            ]
                        ]);

                        Promise.all([DB.write.Guests.UpdateCollumByID(HauptUser_Response[0].userid, 'payed', false), DB.write.Guests.UpdateCollumByID(HauptUser_Response[0].userid, 'payed_ammount', parseInt(HauptUser_Response[0].payed_ammount) + parseInt(Money_Amount)), DB.write.Guests.UpdateCollumByID(ChatID, 'payed_ammount', parseInt(Money_Amount))]).then(function (money_edit_response) {
                            Promise.all([bot.sendMessage(ChatID, newi18n.translate(tglang_response, 'PaySystem.SuccessSubUser', {
                                DiffDays: diffDays,
                                Username: HauptUser_Response[0].username
                            }), { parseMode: 'html', replyMarkup: replyMarkupSubGuest }),

                            bot.sendMessage(HauptUser_Response[0].userid, newi18n.translate(tglang_response_haupt, 'PaySystem.PushMessageHauptGast', {
                                Bank: mainconfig.KontoBank,
                                IBAN: mainconfig.KontoIban,
                                Kontoinhaber: mainconfig.KontoInhaber,
                                Verwendungszweg: mainconfig.Verwendungszweg,
                                PayCode: HauptUser_Response[0].pyed_id,
                                DiffDays: diffDays,
                                Subguest: Guest_Response[0].username,
                                Zusatzkosten: CentToEuro(Money_Amount),
                                Kosten: CentToEuro(parseInt(HauptUser_Response[0].payed_ammount) + parseInt(Money_Amount))
                            }), { parseMode: 'html', replyMarkup })])
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(ChatID, newi18n.translate(process.env.Fallback_Language, 'Error.DBFehler'));
                        });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(ChatID, newi18n.translate(process.env.Fallback_Language, 'Error.DBFehler'));
                    });
                }
            });
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(ChatID, newi18n.translate(process.env.Fallback_Language, 'Error.DBFehler'));
        });
    });
}

/**
 * Send notification to Telegram Chanel
 * @param {String} EssenListe 
 * @param {String} Zeit 
 * @param {String} ID 
 * @param {String} WebPanelURL 
 * @returns 
 */
const SendNewOrderMessage = (EssenListe, Zeit, ID, WebPanelURL) => {
    return new Promise(function (resolve, reject) {
        let PromiseArray = [];
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton(newi18n.translate(process.env.Fallback_Language, 'PushNotification.Buttons.Webpanel'), { url: `${WebPanelURL}/UserBestellungen?${ID}` })
            ]
        ]);

        const Message = newi18n.translate(process.env.Fallback_Language, 'PushNotification.NewOrder', { EssenListe: EssenListe, Zeit: Zeit, ID: ID, WebPanelURL: WebPanelURL });

        PromiseArray.push(bot.sendMessage(mainconfig.LanChat, Message, { parseMode: 'html', replyMarkup }));

        DB.get.Guests.AllSave().then(function (rows) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].lang !== process.env.Fallback_Language) {
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate(rows[i].lang, 'PushNotification.Buttons.Webpanel'), { url: `${WebPanelURL}/UserBestellungen?${ID}` })
                        ]
                    ]);

                    const Message = newi18n.translate(rows[i].lang, 'PushNotification.NewOrder', { EssenListe: EssenListe, Zeit: Zeit, ID: ID, WebPanelURL: WebPanelURL });

                    PromiseArray.push(bot.sendMessage(rows[i].userid, Message, { parseMode: 'html', replyMarkup }));
                }
            }
            Promise.all(PromiseArray).then(function (msg_send) {
                resolve(msg_send)
            }).catch(function (error) {
                reject(error)
            });
        }).catch(function (error) {
            log.error(error)
            reject(error)
        });
    });
}

/* Events */

process.on('message', function (packet) {
    const { data } = packet;
    const { event, message } = data;
    if (event === 'NewOrder') {
        SendNewOrderMessage(message.EssenListe, message.Zeit, message.ID, message.WebPanelURL).catch(function (error) {
            log.error(error)
        });
    } else if (event === 'NewRegestration') {
        WebRegSendConfim(message.chatid).catch(function (error) {
            log.error(error)
        });
    }
})