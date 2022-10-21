const path = require('path');
const DB = require('../../../Web/lib/postgres');
const { default: i18n } = require('new-i18n')
const randomstring = require('randomstring');
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'),  ['de', 'en', 'de-by', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');
const { CentToEuro } = require('../../lib/utils');

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

            if (parseInt(data[1]) !== msg.from.id) //Execute always, not user bound
            {
                if (data[0] === 'Buy') {
                    if (data[1] === 'Main') {
                        DB.get.Products.Get(data[2]).then(function (product_response) {
                            let replyMarkup = bot.inlineKeyboard([
                                [
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Remove'), { callback: `Buy_Rem` }),
                                    bot.inlineButton(`1/${product_response.rows[0].amount - product_response.rows[0].bought}`, { callback: `${data[2]}` }),
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Add'), { callback: `Buy_Add` })
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
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Remove'), { callback: `Buy_Rem` }),
                                    bot.inlineButton(`${parseInt(amount_to_buy) + 1}/${amount_max}`, { callback: `${product}` }),
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Add'), { callback: `Buy_Add` })
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
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Remove'), { callback: `Buy_Rem` }),
                                    bot.inlineButton(`${parseInt(amount_to_buy) - 1}/${amount_max}`, { callback: `${product}` }),
                                    bot.inlineButton(newi18n.translate(tglang_response, 'Inline.Knöpfe.Add'), { callback: `Buy_Add` })
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
                            if (guest_response[0].hauptgast_userid !== null) { // Detect Hauptguests
                                //User is SubGuest
                                DB.get.Guests.ByID(guest_response[0].hauptgast_userid).then(function (all_response) {
                                    const [hauptgast] = all_response;
                                    if (hauptgast.payed === true || hauptgast.payed === "true") { // check if main guest has payed
                                        if (guest_response[0].payed === true || guest_response[0].payed === "true") { // Check if user is allowed to buy from buffet
                                            DB.get.Guests.ShopingSpend(msg.from.id).then(function (shoping_response) {
                                                if (shoping_response.rows[0].sum < guest_response[0].payed_ammount) { // Check if user is still within his limit
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
                
                                                                        DB.write.shopinglist.Buy(hauptgast.userid, msg.from.id, SQLprodukt, transaction_id).then(function (Write_Shoppinglist) { //Here Stuff needs to be chanced when subusers will be added!!
                                                                            let MSG;
                                                                            if (product === "Spende") {
                                                                                MSG = newi18n.translate(tglang_response, 'Inline.Donation', { price: CentToEuro(price * amount_to_buy), Company_Name_URL: process.env.Company_Name_Url, Company_Name: process.env.Company_Name });
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
                                                    return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.OverLimit', {limit: CentToEuro(guest_response[0].payed_ammount)}));
                                                }
                                            }).catch(function (error) {
                                                log.error(error);
                                                return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                                            });
                                        } else {
                                            //Nutzer isn´t allowed to buy (SubGuest Only)
                                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.NotAllowedToPay'));
                                        }
                                    } else {
                                        //Main user didn´t pay yet, either for hims elf or for his subguests
                                        return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Inline.Confirm.NotPayed'));
                                    }
                                }).catch(function (error) {
                                    log.error(error)
                                    return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                                })
                            } else {
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
                                                                MSG = newi18n.translate(tglang_response, 'Inline.Donation', { price: CentToEuro(price * amount_to_buy), Company_Name_URL: process.env.Company_Name_Url, Company_Name: process.env.Company_Name });
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
                            }
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate(tglang_response, 'Error.DBFehler'));
                        })
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