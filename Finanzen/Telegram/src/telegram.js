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
            bot.inlineButton(newi18n.translate('de', 'Knöpfe.Reg'), {callback: '/reg'})
        ]
    ]);
    return bot.sendMessage(msg.chat.id, newi18n.translate('de', 'WellcomeMSG', {LanName: mainconfig.LanName}), {replyMarkup});
});

bot.on(/^\/reg/i, (msg) => {
    if(msg.message.chat.type === "private"){
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton(newi18n.translate('de', 'Antworten.Ja'), {callback: 'F_PC_true'}),
                bot.inlineButton(newi18n.translate('de', 'Antworten.Nein'), {callback: 'F_PC_false'})
            ]
        ]);
        DB.write.Guests.NewUser(msg.from.id, msg.from.username).then(function(response) {
            return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Fragen.PC'), {replyMarkup});
        }).catch(function(error){
            console.log(error)
            return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.DBFehler'));
        })
    }else{
        return bot.sendMessage(msg.message.chat.id, newi18n.translate('de', 'Error.NotPrivate'));
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
    });
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
    }
});

bot.start();

/* - - - - Telegram External Functions - - - - */



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

/* - - - - Database Event Checker - - - - */

setInterval(function(){
    DB.message.GetAll().then(function(list) {
        if(list.rows.length >= 1){
            list.rows.map(row => {
                console.log(row)
                if(row.type === "Function"){ //Run all Funktions from here

                }
            });
        }
    });
}, 5000);