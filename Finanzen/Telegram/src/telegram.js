require('dotenv').config();
const path = require('path');
const DB = require('./lib/postgres');
const fs = require('fs');
const util = require('util')
const randomstring = require('randomstring');
let reqPath = path.join(__dirname, '../');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(reqPath, process.env.Sprache), ["de"], "de");

let mainconfig, preisliste;

console.log("All Systems Running!")

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
if(fs.existsSync(`${reqPath}${process.env.Config}/preisliste.json`)) {
	preisliste = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.Config}/preisliste.json`));
}

bot.on(/^\/loadprice/i, (msg) => {
    var run_start = new Date().getTime();
    DB.get.Guests.Check.Admin(msg.from.id).then(function(Admin_Check_response) {
        if(Admin_Check_response){
            let Restul_array = [];
            for (var key in preisliste.SnackBar) {
                Restul_array.push(DB.write.Products.Add(preisliste.SnackBar[key]))
            }
            Promise.all(Restul_array).then(function(Insert_Response) {
                return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'loadprice.Text', {Amount: Insert_Response.length, duration: TimeConvert(new Date().getTime()-run_start)}));
            }).catch(function(error){
                console.log(error)
                return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Error.DBFehler'));
            })
        }else{
            return bot.sendMessage(msg.chat.id,newi18n.translate('de', 'Admin.MustBeAdmin'));
        }
    }).catch(function(error){
        console.log(error)
        return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Error.DBFehler'));
    })
});

bot.on(/^\/start/i, (msg) => {
    if(msg.chat.type === "private"){
        DB.get.Guests.ByID(msg.from.id).then(function(User_response) {
            if(User_response.length <= 0 || parseInt(mainconfig.SudoUser) === msg.from.id){
                let replyMarkup = bot.inlineKeyboard([
                    [
                        bot.inlineButton(newi18n.translate('de', 'Knöpfe.Reg'), {callback: `R_${msg.from.id}_rules`})
                    ]
                ]);
                return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeMSG', {LanName: mainconfig.LanName}), {replyMarkup});
            }else{
                if(User_response.pyed_id !== null){
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Knöpfe.Hauptmenu'), {callback: `/hauptmenu`})
                        ]
                    ]);
                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeMSGAR', {LanName: mainconfig.LanName}), {replyMarkup});
                }else{
                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeErr'));
                    
                }
            }
        });
    }else{
        return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Error.NotPrivate'));
    }
});

bot.on(/^\/hauptmenu/i, (msg) => {
    let private;
    if(msg.chat){
        if(msg.chat.type === "private"){private = true}
    }else{
        if(msg.message.chat.type === "private"){private = true}
    }
    if(private){
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton(newi18n.translate('de', 'Hauptmenu.Knöpfe.Zahlung'), {callback: 'M_Pay'}),
                bot.inlineButton(newi18n.translate('de', 'Hauptmenu.Knöpfe.Artikel'), {inlineCurrent: ''})
            ],
            [
                bot.inlineButton(newi18n.translate('de', 'Hauptmenu.Knöpfe.Spenden'), {inlineCurrent: 'spende'}),
                bot.inlineButton(newi18n.translate('de', 'Hauptmenu.Knöpfe.WebSession'), {callback: 'M_WebS'})
            ],
            [
                bot.inlineButton(newi18n.translate('de', 'Hauptmenu.Knöpfe.Webpanel'), {url: `${process.env.WebPanelURL}`}),
            ]
        ]);

        let username;
        if ('username' in msg.from) {
             username = msg.from.username.toString();
        }else{
            username = msg.from.first_name.toString();
        }

        if(msg.chat){
            return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Hauptmenu.Text', {Username: username}), {replyMarkup});
        }else{
            return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Hauptmenu.Text', {Username: username}), {replyMarkup});
        }
    }else{
        if(msg.chat){
            return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Error.NotPrivate'));
        }else{
            return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.NotPrivate'));
        }
    }
});

bot.on(/^\/admin( .+)*/i, (msg, props) => {
    let AvaibleModes = ['add','remove','rem', 'list']
    let CheckAtributes = AtrbutCheck(props);
    DB.get.Guests.Check.Admin(msg.from.id).then(function(Admin_Check_response) {
        if(Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id){
            if(CheckAtributes.hasAtributes){
                if ('reply_to_message' in msg) {
                    if(AvaibleModes.includes(CheckAtributes.atributes[0])){
                        let UserID = msg.reply_to_message.from.id
                        let username;
                        if ('username' in msg.reply_to_message.from) {
                            username = msg.reply_to_message.from.username.toString();
                        }else{
                            username = msg.reply_to_message.from.first_name.toString();
                        }

                        if(CheckAtributes.atributes[0] === "add"){
                            DB.write.Guests.UpdateCollumByID(UserID, 'admin', true).then(function(Admin_Update_response) {
                                if(Admin_Update_response.rowCount === 1){
                                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.AddSuccsess', {Username: username, UserID: UserID}));
                                }else{
                                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.AddNoSuccsess'));
                                }
                            });
                        }else if(CheckAtributes.atributes[0] === "rem" || CheckAtributes.atributes[0] === "remove"){
                            DB.write.Guests.UpdateCollumByID(UserID, 'admin', false).then(function(Admin_Update_response) {
                                if(Admin_Update_response.rowCount === 1){
                                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.RemSuccsess', {Username: username, UserID: UserID}));
                                }else{
                                    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.RemNoSuccsess'));
                                }
                            });
                        }
                    }else{
                        return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.MustHaveAtributes', {Atributes: AvaibleModes.join(", ")}));
                    }
                }else{
                    if(CheckAtributes.atributes[0] === "list"){
                        DB.get.Guests.Admins().then(function(Admin_List_response){
                            let AdminList = "";
                            Admin_List_response.map(Admin => {
                                AdminList = `\n${AdminList}- ${Admin.username}(${Admin.userid})`
                            });
                            return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.list', {AdminList: AdminList}));
                        });
                    }else{
                        return bot.sendMessage(msg.chat.id,newi18n.translate('de', 'Admin.MustBeReply'));
                    }
                }
            }else{
                return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'Admin.MustHaveAtributes', {Atributes: AvaibleModes.join(", ")}));
            }
        }else{
            return bot.sendMessage(msg.chat.id,newi18n.translate('de', 'Admin.MustBeAdmin'));
        }
    }).catch(function(error){
        console.log(error)
        return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
    })
});

bot.on('callbackQuery', (msg) => {
	if ('inline_message_id' in msg) {	
		var inlineId = msg.inline_message_id;
	}else{
		var chatId = msg.message.chat.id;
		var messageId = msg.message.message_id;
	}

	var data = msg.data.split("_")

    if(parseInt(data[1]) !== msg.from.id) //Execute always, not user bound
	{   
        if(data[0] === 'Buy')
		{
            if(data[1] === 'Main')
            {
                DB.get.Products.Get(data[2]).then(function(product_response) {
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Add'), {callback: `Buy_Add`}),
                            bot.inlineButton(`1/${product_response.rows[0].amount-product_response.rows[0].bought}`, {callback: `${data[2]}`}),
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Remove'), {callback: `Buy_Rem`})
                        ],[
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Abbrechen'), {callback: `Buy_Escape`}),
                            bot.inlineButton(`${CentToEuro(product_response.rows[0].price)}`, {callback: `${product_response.rows[0].price}`}),
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Bestätigen'), {callback: `Buy_Confirm`})
                        ]
                    ]);

                    let Message = `${newi18n.translate('de', 'Inline.MainProgress')}`

                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    return bot.sendMessage(msg.from.id, newi18n.translate('de', 'Inline.MainMessage', {price: CentToEuro(product_response.rows[0].price), storrage: product_response.rows[0].amount-product_response.rows[0].bought, produktname: product_response.rows[0].produktname, produktcompany: product_response.rows[0].produktcompany}), {parseMode: `html`,replyMarkup});
                });
            }
            if(data[1] === 'Add')
            {
                let amount_split = msg.message.reply_markup.inline_keyboard[0][1].text.split("/")
                let product = msg.message.reply_markup.inline_keyboard[0][1].callback_data;
                let amount_to_buy = amount_split[0];
                let amount_max = amount_split[1]
                let price = msg.message.reply_markup.inline_keyboard[1][1].callback_data;

                if(parseInt(amount_max) > parseInt(amount_to_buy)){
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Add'), {callback: `Buy_Add`}),
                            bot.inlineButton(`${parseInt(amount_to_buy)+1}/${amount_max}`, {callback: `${product}`}),
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Remove'), {callback: `Buy_Rem`})
                        ],[
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Abbrechen'), {callback: `Buy_Escape`}),
                            bot.inlineButton(`${CentToEuro(parseInt(price)*(parseInt(amount_to_buy)+1))}`, {callback: `${price}`}),
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Bestätigen'), {callback: `Buy_Confirm`})
                        ]
                    ]);
    
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, msg.message.text,
                            {parseMode: 'html', replyMarkup}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, msg.message.text,
                            {parseMode: 'html', replyMarkup}
                        ).catch(error => console.log('Error:', error));
                    }
                }else{
                    bot.answerCallbackQuery(msg.id,{
                        text: newi18n.translate('de', 'Inline.TooMutch'),
                        showAlert: true
                    });
                }
            }
            if(data[1] === 'Rem')
            {   
                let amount_split = msg.message.reply_markup.inline_keyboard[0][1].text.split("/")
                let product = msg.message.reply_markup.inline_keyboard[0][1].callback_data;
                let amount_to_buy = amount_split[0];
                let amount_max = amount_split[1]
                let price = msg.message.reply_markup.inline_keyboard[1][1].callback_data;

                if(1 < parseInt(amount_to_buy)){
                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Add'), {callback: `Buy_Add`}),
                            bot.inlineButton(`${parseInt(amount_to_buy)-1}/${amount_max}`, {callback: `${product}`}),
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Remove'), {callback: `Buy_Rem`})
                        ],[
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Abbrechen'), {callback: `Buy_Escape`}),
                            bot.inlineButton(`${CentToEuro(parseInt(price)*(parseInt(amount_to_buy)-1))}`, {callback: `${price}`}),
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Bestätigen'), {callback: `Buy_Confirm`})
                        ]
                    ]);
    
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, msg.message.text,
                            {parseMode: 'html', replyMarkup}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, msg.message.text,
                            {parseMode: 'html', replyMarkup}
                        ).catch(error => console.log('Error:', error));
                    }
                }else{
                    bot.answerCallbackQuery(msg.id,{
                        text: newi18n.translate('de', 'Inline.TooLitle'),
                        showAlert: true
                    });
                }
            }
            if(data[1] === 'Escape')
            {   
                if ('inline_message_id' in msg) {
                    bot.editMessageText(
                        {inlineMsgId: inlineId}, newi18n.translate('de', 'Inline.Escape'),
                        {parseMode: 'html'}
                    ).catch(error => console.log('Error:', error));
                }else{
                    bot.editMessageText(
                        {chatId: chatId, messageId: messageId}, newi18n.translate('de', 'Inline.Escape'),
                        {parseMode: 'html'}
                    ).catch(error => console.log('Error:', error));
                }
            }
            if(data[1] === 'Confirm')
            {   
                let amount_split = msg.message.reply_markup.inline_keyboard[0][1].text.split("/")
                let product = msg.message.reply_markup.inline_keyboard[0][1].callback_data;
                let amount_to_buy = amount_split[0];
                let price = msg.message.reply_markup.inline_keyboard[1][1].callback_data;

                DB.get.Guests.Check.Payed(msg.from.id).then(function(payed_response) {
                    if(payed_response === true || payed_response === "true"){
                        DB.get.Products.Get(product).then(function(product_response) {
                            if(product_response.rows.length >= 1) {
                                if(parseInt(product_response.rows[0].amount)-parseInt(product_response.rows[0].bought) >= parseInt(amount_to_buy)){
                                    console.log("Buchung...")
                                }else{
                                    //Produkt nicht in ausreichender Menge verfügbar
                                    console.log("Produkt nicht in ausreichender Menge verfügbar")
                                }
                            }else{
                                //Produkt existiert nimmer
                                console.log("Produkt existiert nimmer")
                            }
                        }).catch(function(error){
                            console.log(error)
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                        })
                    }else{
                        //Nutzer hat noch nicht gezahlt
                        console.log("Nutzer hat noch nicht gezahlt")
                    }
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }
        }
		if(data[0] === 'F')
		{
            if(data[1] === 'PC')
            {
                DB.write.Guests.UpdateCollumByID(msg.from.id, "pc", data[2]).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${boolToText(data[2])}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton('1', {callback: 'F_DPC_1'}),
                            bot.inlineButton('2', {callback: 'F_DPC_2'}),
                            bot.inlineButton('3', {callback: 'F_DPC_3'})
                        ],[
                            bot.inlineButton('4', {callback: 'F_DPC_4'}),
                            bot.inlineButton('5', {callback: 'F_DPC_5'}),
                            bot.inlineButton('6', {callback: 'F_DPC_6'})
                        ]
                    ]);

                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.Displays'), {replyMarkup});
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }

            if(data[1] === 'DPC')
            {
                DB.write.Guests.UpdateCollumByID(msg.from.id, "displays_count", data[2]).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${data[2]}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Ja'), {callback: 'F_LK_true'}),
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Nein'), {callback: 'F_LK_false'})
                        ]
                    ]);

                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.LanKabel'), {replyMarkup});
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }

            if(data[1] === 'LK')
            {
                DB.write.Guests.UpdateCollumByID(msg.from.id, "network_cable", data[2]).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${boolToText(data[2])}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Ja'), {callback: 'F_VR_true'}),
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Nein'), {callback: 'F_VR_false'})
                        ]
                    ]);

                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.VR'), {replyMarkup});
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }

            if(data[1] === 'VR')
            {
                DB.write.Guests.UpdateCollumByID(msg.from.id, "vr", data[2]).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${boolToText(data[2])}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Vollständig'), {callback: 'F_VC_Voll'}),
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Teil'), {callback: 'F_VC_Teil'}),
                            bot.inlineButton(newi18n.translate('de', 'Antworten.Nein'), {callback: 'F_VC_Nein'})
                        ],[
                            bot.inlineButton(newi18n.translate('de', 'Antworten.NichtSagen'), {callback: 'F_VC_Secret'})
                        ]
                    ]);

                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.Vaccinated'), {replyMarkup});
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }

            if(data[1] === 'VC')
            {
                DB.write.Guests.UpdateCollumByID(msg.from.id, "vaccinated", data[2]).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate('de', `Vaccinated.${data[2]}`)}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Arrivale.1'), {callback: 'F_EA_1'}),
                            bot.inlineButton(newi18n.translate('de', 'Arrivale.2'), {callback: 'F_EA_2'}),
                            bot.inlineButton(newi18n.translate('de', 'Arrivale.3'), {callback: 'F_EA_3'})
                        ],[
                            bot.inlineButton(newi18n.translate('de', 'Arrivale.4'), {callback: 'F_EA_4'}),
                            bot.inlineButton(newi18n.translate('de', 'Arrivale.5'), {callback: 'F_EA_5'}),
                            bot.inlineButton(newi18n.translate('de', 'Arrivale.6'), {callback: 'F_EA_6'})
                        ]
                    ]);

                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.Arrivale'), {replyMarkup});
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }

            if(data[1] === 'EA')
            {
                let DateArray = newi18n.translate('de', `Arrivale.${data[2]}`).split(".");
                let newDateString = `${DateArray[1]}/${DateArray[0]}/${DateArray[2]}`;
                let newDate = new Date(newDateString);
                DB.write.Guests.UpdateCollumByID(msg.from.id, "expected_arrival", newDate).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate('de', `Arrivale.${data[2]}_Voll`)}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Depature.1'), {callback: 'F_ED_1'}),
                            bot.inlineButton(newi18n.translate('de', 'Depature.2'), {callback: 'F_ED_2'}),
                            bot.inlineButton(newi18n.translate('de', 'Depature.3'), {callback: 'F_ED_3'})
                        ],[
                            bot.inlineButton(newi18n.translate('de', 'Depature.4'), {callback: 'F_ED_4'}),
                            bot.inlineButton(newi18n.translate('de', 'Depature.5'), {callback: 'F_ED_5'}),
                            bot.inlineButton(newi18n.translate('de', 'Depature.6'), {callback: 'F_ED_6'})
                        ]
                    ]);

                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.Depature'), {replyMarkup});
                }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }

            if(data[1] === 'ED')
            {
                let DateArray = newi18n.translate('de', `Depature.${data[2]}`).split(".");
                let newDateString = `${DateArray[1]}/${DateArray[0]}/${DateArray[2]}`;
                let newDate = new Date(newDateString);
                DB.write.Guests.UpdateCollumByID(msg.from.id, "expected_departure", newDate).then(function(response) {
                    let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate('de', `Depature.${data[2]}_Voll`)}`
                    if ('inline_message_id' in msg) {
                        bot.editMessageText(
                            {inlineMsgId: inlineId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }else{
                        bot.editMessageText(
                            {chatId: chatId, messageId: messageId}, Message,
                            {parseMode: 'html'}
                        ).catch(error => console.log('Error:', error));
                    }

                    let WebToken = randomstring.generate({
                        length: mainconfig.RegTokenLength, //DO NOT CHANCE!!!
                        charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!'
                    });

                    DB.write.RegToken.NewToken(msg.from.id, msg.from.username, WebToken).then(function(response) {

                        let replyMarkup = bot.inlineKeyboard([
                            [
                                bot.inlineButton(newi18n.translate('de', 'Knöpfe.WebReg'), {url: `${process.env.WebPanelURL}/api/v1/register/load/${WebToken}`})
                            ]
                        ]);

                        return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.WebReg'), {replyMarkup});
                        
                    }).catch(function(error){
                        console.log(error)
                        return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                    })


                    }).catch(function(error){
                    console.log(error)
                    return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                })
            }
        }
    }else{
        if(data[0] === 'R')
            {
                if(data[2] === 'rules')
                {
                    if(data.length === 3){
                        DB.write.Guests.NewUser(msg.from.id, msg.from.username).then(function(response) {

                            let replyMarkup = bot.inlineKeyboard([
                                [
                                    bot.inlineButton(newi18n.translate('de', 'Regeln.Knöpfe.Zustimmen'), {callback: `R_${msg.from.id}_rules_true`}),
                                    bot.inlineButton(newi18n.translate('de', 'Regeln.Knöpfe.Ablehnen'), {callback: `R_${msg.from.id}_rules_false`})
                                ]
                            ]);
                            
                            let Message = []
                            Message.push(newi18n.translate('de', 'Regeln.Text'))
                            for (i = 0; i < parseInt(newi18n.translate('de', 'Regeln.RegelnAnzahl')); i++) { 
                                Message.push(newi18n.translate('de', `Regeln.Regeln.${i}`))
                            }

                            Message = Message.join("\n")

                        if ('inline_message_id' in msg) {
                            bot.editMessageText(
                                {inlineMsgId: inlineId}, Message,
                                {parseMode: 'html', replyMarkup}
                            ).catch(error => console.log('Error:', error));
                        }else{
                            bot.editMessageText(
                                {chatId: chatId, messageId: messageId}, Message,
                                {parseMode: 'html', replyMarkup}
                            ).catch(error => console.log('Error:', error));
                        }

                        }).catch(function(error){
                            console.log(error)
                            return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
                        })
                    }else{
                        if(data[3] === "true"){
                            let newDate = new Date(Date.now());
                            DB.write.Guests.UpdateCollumByID(msg.from.id, "accepted_rules", newDate).then(function(response) {
                                let replyMarkup = bot.inlineKeyboard([
                                    [
                                        bot.inlineButton(newi18n.translate('de', 'Legal.Knöpfe.Zustimmen'), {callback: `R_${msg.from.id}_legal_true`}),
                                        bot.inlineButton(newi18n.translate('de', 'Legal.Knöpfe.Ablehnen'), {callback: `R_${msg.from.id}_legal_false`})
                                    ]
                                ]);
                                
                                let Message = []
                                Message.push(newi18n.translate('de', 'Legal.Text'))
                                for (i = 0; i < parseInt(newi18n.translate('de', 'Legal.LegalAnzahl')); i++) { 
                                    Message.push(newi18n.translate('de', `Legal.Legal.${i}`))
                                }

                                Message.push(`\n\n${newi18n.translate('de', `Legal.Preisliste`)}`)
                                for (var key in preisliste.PauschalKosten) {
                                    Message.push(`<b>${CentToEuro(preisliste.PauschalKosten[key].Preis)}</b> für <i>${preisliste.PauschalKosten[key].Beschreibung}</i>`)
                                }
    
                                Message = Message.join("\n")
    
                            if ('inline_message_id' in msg) {
                                bot.editMessageText(
                                    {inlineMsgId: inlineId}, Message,
                                    {parseMode: 'html', replyMarkup}
                                ).catch(error => console.log('Error:', error));
                            }else{
                                bot.editMessageText(
                                    {chatId: chatId, messageId: messageId}, Message,
                                    {parseMode: 'html', replyMarkup}
                                ).catch(error => console.log('Error:', error));
                            }
                            });
                        }else{
                            let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate('de', `Regeln.Antworten.Ablehnen`)}`
                            if ('inline_message_id' in msg) {
                                bot.editMessageText(
                                    {inlineMsgId: inlineId}, Message,
                                    {parseMode: 'html'}
                                ).catch(error => console.log('Error:', error));
                            }else{
                                bot.editMessageText(
                                    {chatId: chatId, messageId: messageId}, Message,
                                    {parseMode: 'html'}
                                ).catch(error => console.log('Error:', error));
                            }
                        }
                    }
                }

                if(data[2] === 'legal')
                {
                    if(data[3] === "true"){
                        let newDate = new Date(Date.now());
                        DB.write.Guests.UpdateCollumByID(msg.from.id, "accepted_legal", newDate).then(function(response) {
                            let replyMarkup = bot.inlineKeyboard([
                                [
                                    bot.inlineButton(newi18n.translate('de', 'Antworten.Ja'), {callback: 'F_PC_true'}),
                                    bot.inlineButton(newi18n.translate('de', 'Antworten.Nein'), {callback: 'F_PC_false'})
                                ]
                            ]);
                            let Message = newi18n.translate('de', 'Fragen.PC');
    
                            if ('inline_message_id' in msg) {
                                bot.editMessageText(
                                    {inlineMsgId: inlineId}, Message,
                                    {parseMode: 'html', replyMarkup}
                                ).catch(error => console.log('Error:', error));
                            }else{
                                bot.editMessageText(
                                    {chatId: chatId, messageId: messageId}, Message,
                                    {parseMode: 'html', replyMarkup}
                                ).catch(error => console.log('Error:', error));
                            }
                        });
                    }else{
                        let Message = `${msg.message.text}\n\n<b>Antwort:</B> ${newi18n.translate('de', `Legal.Antworten.Ablehnen`)}`
                        if ('inline_message_id' in msg) {
                            bot.editMessageText(
                                {inlineMsgId: inlineId}, Message,
                                {parseMode: 'html'}
                            ).catch(error => console.log('Error:', error));
                        }else{
                            bot.editMessageText(
                                {chatId: chatId, messageId: messageId}, Message,
                                {parseMode: 'html'}
                            ).catch(error => console.log('Error:', error));
                        }
                    }
                }
            }
        }
});

/* - - - - Telegram Inline Handler - - - - */

bot.on('inlineQuery', msg => {
	let query = msg.query.toLowerCase();
	let queryarr = query.split('');
    const answers = bot.answerList(msg.id, {cacheTime: 1});
    if(queryarr.length === 0){
		answers.addArticle({
            id: `${newi18n.translate('de', `Inline.NoQuery.ID`)}`,
            title: `${newi18n.translate('de', `Inline.NoQuery.Text`)}`,
            description: msg.query,
            message_text: (`${newi18n.translate('de', `Inline.NoQuery.Message`)}`)
        });
		return bot.answerQuery(answers).catch(function(error){
            console.log(error)
        })
	}else{
        DB.get.Products.LikeGet(query).then(function(Product_Response) {
            let rows = Product_Response.rows
			if(Object.entries(rows).length === 0){
				answers.addArticle({
					id: `${newi18n.translate('de', `Inline.NotFound.ID`)}`,
					title: `${newi18n.translate('de', `Inline.NotFound.Text`)}`,
					description: msg.query,
					message_text: (`${newi18n.translate('de', `Inline.NotFound.Message`)}`)
				});
				return bot.answerQuery(answers).catch(function(error){
                    console.log(error)
                })
			}else{
				idCount = 0;
				for(i in rows){

                    let replyMarkup = bot.inlineKeyboard([
                        [
                            bot.inlineButton(newi18n.translate('de', 'Inline.Knöpfe.Kaufen'), {callback: `Buy_Main_${rows[i].produktname}`})
                        ]
                    ]);

					answers.addArticle({
						id: `${newi18n.translate('de', `Inline.Found.ID`, {ID: idCount})}`,
						title: `${newi18n.translate('de', `Inline.Found.Text`, {Produkt: rows[i].produktname, Hersteller: rows[i].produktcompany})}`,
						description: `${newi18n.translate('de', `Inline.Found.Beschreibung`, {Preis: CentToEuro(rows[i].price), Verfügbar: rows[i].amount-rows[i].bought})}`,
						message_text: `${newi18n.translate('de', `Inline.Found.Message`, {price: CentToEuro(rows[i].price), storrage: rows[i].amount-rows[i].bought, produktname: rows[i].produktname, produktcompany: rows[i].produktcompany})}`,
                        reply_markup: replyMarkup,
						parse_mode: 'html'  
					});
					idCount++
				}
				return bot.answerQuery(answers).catch(function(error){
                    console.log(error)
                })
			}
        });
	}
});

bot.start();

/* - - - - Telegram External Functions - - - - */

/**
 * This function will send a user the conferm message of his web reg
 * @param {number} ChatID
 * @returns Object
 */
 let WebRegSendConfim = function(ChatID) {
    return new Promise(function(resolve, reject) {

        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton(newi18n.translate('de', 'Knöpfe.Hauptmenu'), {callback: '/hauptmenu'})
            ]
        ]);

        let Kosten = CentToEuro(parseInt(mainconfig.LanDauer)*parseInt(preisliste.FixKostenProTag));
        let PayCode = randomstring.generate({
            length: 8,
            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        });

        DB.write.Guests.UpdateCollumByID(ChatID, 'pyed_id', PayCode).then(function(guest_edit_response) {
            bot.sendMessage(ChatID, newi18n.translate('de', 'PaySystem.Sucsess', {Bank: mainconfig.KontoBank, IBAN: mainconfig.KontoIban, Kontoinhaber: mainconfig.KontoInhaber, Verwendungszweg: mainconfig.Verwendungszweg, PayCode: PayCode, Kosten: Kosten}), {parseMode: 'html', replyMarkup}).then(function(msg_send) {
                resolve(msg_send)
            }).catch(function(error){
                reject(error)
            })
        }).catch(function(error){
            reject(error)
        })
    });
  }

/* - - - - Helper Functions - - - - */

/**
 * This function will translate bool to string
 * @param {boolean | string} bool
 * @returns {string}
 */
function boolToText(bool) {
    if(bool === true || bool === "true"){
        return newi18n.translate('de', 'Antworten.Ja')
    }else{
        return newi18n.translate('de', 'Antworten.Nein')
    }
}

/**
 * This function will handle pops of telebot
 * @param {props} props
 * @returns {object}
 */
function AtrbutCheck(props) {
	let input = props.match.input.split(' ')
	if(input[0].endsWith(process.env.Telegram_Bot_Botname)){
		let atributesWName = [];
		for(let i=1; i <= input.length - 1; i++){
			atributesWName.push(input[i])
		}
		if(atributesWName.length >= 1){
			return {hasAtributes: true, atributes: atributesWName}
		}else{
			return {hasAtributes: false}
		}
	}else{
		if(typeof(props.match[1]) === 'undefined'){
			return {hasAtributes: false}
		}else{
			let atributeOName = [];
			let input = props.match[1].split(' ')
			for(let i=1; i <= input.length - 1; i++){
				atributeOName.push(input[i])
			}
			return {hasAtributes: true, atributes: atributeOName}
		}
	}
}

/**
 * This function will convert cents to Euro ISO 
 * @param {string} value
 * @returns {string}
 */
function CentToEuro(value){
    var euro = value / 100;
    return euro.toLocaleString("de-De", {style:"currency", currency:"EUR"});
}

/**
 * This function will convert a timediff into a humane readable string
 * @param {number} timediff
 * @returns {string}
 */
function TimeConvert(timediff){
    if(timediff >= 1000){
        if(timediff/1000 >= 60){
            return `${timediff/1000*60}m`
        }
        return `${timediff/1000}s`
    }else{
        return `${timediff}ms`
    }
}

/* - - - - Database Event Checker - - - - */

setInterval(function(){
    DB.message.GetAll().then(function(list) {
        if(list.rows.length >= 1){
            list.rows.map(row => {
                //console.log(row)
                if(row.type === "Function"){ //Run all Funktions from here
                    if(row.message === "Web_Register"){
                        WebRegSendConfim(row.chatid).then(function(msg_send) {
                            DB.message.Delete(row.id).then(function(del_message) {
                                console.log(`Task for Telegram, with ID ${row.id} was prossesed.`)
                            });
                        }).catch(function(error){
                            console.log(`Error while prossesing Task for Telegram, with ID ${row.id}:`)
                            console.log(error)
                        })
                    }
                }
            });
        }
    });
}, 5000);