const path = require('path');
const DB = require('../../../Web/lib/postgres');
const fs = require('fs');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', '../', 'lang'), ['de', 'en', 'de-by', 'de-ooe', 'ua', 'it', 'fr'], process.env.Fallback_Language);
const { log } = require('../../../Web/lib/logger');
const exec = require('node:child_process').exec;
const { AtrbutCheck, TimeConvert, CentToEuro } = require('../../lib/utils');

/**
 * Will run a command in the console asynchronusly
 * @param {String} command Command to run
 * @param {String} cwd Path to the directory
 * @returns 
 */
function executeCommand(command, cwd) {
    return new Promise(function (resolve, reject) {
        exec(command, { cwd: cwd }, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`);
                return;
            }
            resolve(stdout);
        }).on('error', (code) => {
            console.log(`child process error with code ${code}`);
            reject();
        })
    });
}

/**
 * Replace non supported chars in the PDF generator
 * @param {String} str 
 * @returns 
 */
const replaceNonSupportedChars = (str) => {
    str = str.replace(/ä/g, 'ae');
    str = str.replace(/ö/g, 'oe');
    str = str.replace(/ü/g, 'ue');
    str = str.replace(/ß/g, 'ss');
    str = str.replace(/Ä/g, 'Ae');
    str = str.replace(/Ö/g, 'Oe');
    str = str.replace(/Ü/g, 'Ue');
    str = str.replace(' €', ' Euro');
    return str;
}

/**
 * Will generate the config json
 * @param {Array} Guests 
 * @returns 
 */
function generateJson(Guests, preisliste, mainconfig) {
    return new Promise(async function (resolve, reject) {
        let Restult_array = [];
        for (let i = 0; i < Guests.length; i++) {
            let Items_Array = [];
            let sum_cost = 0;
            let Guest = Guests[i];
            await Promise.all([DB.get.plugs.power.kwh(Guest.userid), DB.get.Inventory.GetGroupedTransactions(Guest.userid), DB.get.tglang.Get(Guest.userid), DB.get.Guests.GetPayedID(Guest.userid)]).then(function (values) {
                let [kwh_used, items_used, tglang_response_inner, guest_userresponse] = values;

                if (tglang_response_inner !== 'de' && tglang_response_inner !== 'en' && tglang_response_inner !== 'it') {
                    tglang_response_inner = 'en';
                }
                // Push Table heads into array position 1
                Items_Array.push({
                    artikel: newi18n.translate(tglang_response_inner, 'geninvoices.Artikel'),
                    priceper: newi18n.translate(tglang_response_inner, 'geninvoices.PricePerUnit'),
                    amount: newi18n.translate(tglang_response_inner, 'geninvoices.Amount'),
                    price: newi18n.translate(tglang_response_inner, 'geninvoices.Price'),
                })
                // Push used power (kwh) into row 2
                if (kwh_used.rows.length > 0) {
                    sum_cost += Number(kwh_used.rows[0].power_used * preisliste.PauschalKosten.StromKWH.Preis);
                    Items_Array.push({
                        artikel: replaceNonSupportedChars(newi18n.translate(tglang_response_inner, 'geninvoices.PauschalKosten.kwh')),
                        priceper: replaceNonSupportedChars(CentToEuro(preisliste.PauschalKosten.StromKWH.Preis)),
                        amount: kwh_used.rows[0].power_used.toFixed(3).toString().replace('.', ',') + "x",
                        price: replaceNonSupportedChars(CentToEuro(kwh_used.rows[0].power_used * preisliste.PauschalKosten.StromKWH.Preis)),
                    })
                }

                // Add other mandatory costs from preisliste.PauschalKosten exept StrimKWH
                for (const key in preisliste.PauschalKosten) {
                    if (key === 'StromKWH') continue;

                    sum_cost += Number(preisliste.PauschalKosten[key].Preis);
                    Items_Array.push({
                        artikel: replaceNonSupportedChars(newi18n.translate(tglang_response_inner, `geninvoices.PauschalKosten.${key}`)),
                        priceper: replaceNonSupportedChars(CentToEuro(preisliste.PauschalKosten[key].Preis)),
                        amount: "1x",
                        price: replaceNonSupportedChars(CentToEuro(preisliste.PauschalKosten[key].Preis)),
                    })
                }

                // Push all the bough items into the array
                //Here is price_per_item also avaible
                if (items_used.length > 0) {
                    items_used.map((item) => {
                        sum_cost += Number(item.price_sum);
                        Items_Array.push({
                            artikel: replaceNonSupportedChars(item.produktname.substring(0, 32)),
                            priceper: replaceNonSupportedChars(CentToEuro(item.price_per_item)),
                            amount: `${item.bough}x`,
                            price: replaceNonSupportedChars(CentToEuro(item.price_sum)),
                        })
                    })
                }
                // Push the total price into the array
                Items_Array.push({
                    artikel: newi18n.translate(tglang_response_inner, 'geninvoices.TotalSpend'),
                    priceper: "",
                    amount: "",
                    price: CentToEuro(sum_cost).replace(' €', ' Euro')
                })
                // Push the payed amount into the array
                Items_Array.push({
                    artikel: newi18n.translate(tglang_response_inner, 'geninvoices.Payed'),
                    priceper: "",
                    amount: "",
                    price: CentToEuro(Guest.payed_ammount).replace(' €', ' Euro')
                })
                // Push the difference into the array
                Items_Array.push({
                    artikel: newi18n.translate(tglang_response_inner, 'geninvoices.Difference'),
                    priceper: "",
                    amount: "",
                    price: `${CentToEuro(Number(sum_cost) - Number(Guest.payed_ammount)).replace(' €', ' Euro')}`
                })
                // Generate the final object
                Restult_array.push({
                    "headline": `${mainconfig.LanName} ${newi18n.translate(tglang_response_inner, 'geninvoices.Abrechnung')}`,
                    "userid": Guest.userid,
                    "username": Guest.username,
                    "zvr": mainconfig.ZVR,
                    "veranstalter": mainconfig.Veranstalter,
                    "strasse": mainconfig.Straße,
                    "pzort": mainconfig.PLZORT,
                    "payedid": `VZ: ${mainconfig.Verwendungszweg}-${guest_userresponse.pyed_id}`,
                    "country": mainconfig.Country,
                    "iban": mainconfig.KontoIban,
                    "date": new Date().toLocaleDateString('de-DE'),
                    "items": Items_Array
                })
            }).catch(function (error) {
                log.error(error)
                return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
            })
            if (i == Guests.length - 1) {
                resolve(Restult_array);
            }
        }
    })
}

module.exports = function (bot, mainconfig, preisliste) {
    bot.on(/^\/admin( .+)*/i, (msg, props) => {
        let AvaibleModes = ['add', 'remove', 'rem', 'list']
        let CheckAttributes = AtrbutCheck(props);
        Promise.all([DB.get.tglang.Get(msg.from.id), DB.get.Guests.Check.Admin(msg.from.id)]).then(function (response) {
            const [tglang_response, Admin_Check_response] = response;
            if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
                if (CheckAttributes.hasAttributes) {
                    if ('reply_to_message' in msg) {
                        if (AvaibleModes.includes(CheckAttributes.attributes[0])) {
                            let UserID = msg.reply_to_message.from.id
                            let username;
                            if ('username' in msg.reply_to_message.from) {
                                username = msg.reply_to_message.from.username.toString();
                            } else {
                                username = msg.reply_to_message.from.first_name.toString();
                            }

                            if (CheckAttributes.attributes[0] === "add") {
                                DB.write.Guests.UpdateCollumByID(UserID, 'admin', true).then(function (Admin_Update_response) {
                                    if (Admin_Update_response.rowCount === 1) {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.AddSuccess', { Username: username, UserID: UserID }));
                                    } else {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.AddNoSuccess'));
                                    }
                                });
                            } else if (CheckAttributes.attributes[0] === "rem" || CheckAttributes.attributes[0] === "remove") {
                                DB.write.Guests.UpdateCollumByID(UserID, 'admin', false).then(function (Admin_Update_response) {
                                    if (Admin_Update_response.rowCount === 1) {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.RemSuccess', { Username: username, UserID: UserID }));
                                    } else {
                                        return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.RemNoSuccess'));
                                    }
                                });
                            }
                        } else {
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustHaveAttributes', { Attributes: AvaibleModes.join(", ") }));
                        }
                    } else {
                        if (CheckAttributes.attributes[0] === "list") {
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
                    return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustHaveAttributes', { Attributes: AvaibleModes.join(", ") }));
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
        const run_start = new Date().getTime();
        if (fs.existsSync(path.join(__dirname, '../', '../', '../', 'config', 'preisliste.json'))) {
            preisliste = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', '../', 'config', 'preisliste.json')));
        }
        Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
            const [Admin_Check_response, tglang_response] = values;
            if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
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

    bot.on(/^\/loadplugs/i, (msg) => {
        let plugsconfig;
        const run_start = new Date().getTime();
        if (fs.existsSync(path.join(__dirname, '../', '../', '../', 'config', 'plugsconfig.json'))) {
            plugsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../', '../', '../', 'config', 'plugsconfig.json')));
        }

        Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
            const [Admin_Check_response, tglang_response] = values;
            if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
                let Restult_array = [];
                for (let i = 0; i < plugsconfig.controlers.length; i++) {
                    DB.write.plugs.addControler(plugsconfig.controlers[i].ControlerName, plugsconfig.controlers[i].token).then(function (response) {
                        for (let j = 0; j < plugsconfig.controlers[i].Plugs.length; j++) {
                            Restult_array.push(DB.write.plugs.addPlug(plugsconfig.controlers[i].Plugs[j].IP, i + 1))
                        }
                        Promise.all(Restult_array).then(function (response) {
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'loadplugs.Text', { Amount: Restult_array.length, ControlerAmount: plugsconfig.controlers.length, duration: TimeConvert(new Date().getTime() - run_start) }));
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                        })
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                    })
                }
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        })
    });

    bot.on(/^\/geninvoices/i, (msg) => {
        const run_start = new Date().getTime();
        Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
            const [Admin_Check_response, tglang_response] = values;
            if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
                DB.get.Guests.Main().then(function (Guests) {
                    const config_start = new Date().getTime();
                    generateJson(Guests, preisliste, mainconfig).then(function (response) {
                        fs.writeFileSync(path.join(__dirname, '../', '../', '../', 'pdfGenerator', 'config.json'), JSON.stringify(response));
                        const config_end = new Date().getTime();
                        executeCommand('./renderpdf', path.join(__dirname, '../', '../', '../', 'pdfGenerator')).then(function (executeCommand_response) {
                            const exec_end = new Date().getTime();
                            let Send_Incoices = [];
                            fs.readdirSync(path.join(__dirname, '../', '../', '../', 'pdfGenerator')).forEach(function (file) {
                                if (file.match(/\.pdf$/) !== null) {
                                    Send_Incoices.push(bot.sendDocument(file.split('_')[1], path.join(__dirname, '../', '../', '../', 'pdfGenerator', file)));
                                }
                            });
                            Promise.allSettled(Send_Incoices).then(function (response) {
                                const send_end = new Date().getTime();
                                let amount_word_count = (executeCommand_response.match(/Generating/g) || []).length;
                                bot.sendMessage(msg.chat.id, executeCommand_response);
                                bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'geninvoices.Text', { Amount: amount_word_count, duration: TimeConvert(new Date().getTime() - run_start), config_duration: TimeConvert(config_end - config_start), exec_duration: TimeConvert(exec_end - config_end), send_duration: TimeConvert(send_end - exec_end) }));
                            })
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Error.ExecuteCommandFehler'));
                        });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                    })
                }).catch(function (error) {
                    log.error(error)
                    return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                })
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });

    bot.on(/^\/testgeninvoices/i, (msg) => {
        const run_start = new Date().getTime();
        Promise.all([DB.get.Guests.Check.Admin(msg.from.id), DB.get.tglang.Get(msg.from.id)]).then(function (values) {
            const [Admin_Check_response, tglang_response] = values;
            if (Admin_Check_response === true || parseInt(mainconfig.SudoUser) === msg.from.id) {
                DB.get.Guests.Main().then(function (Guests) {
                    const config_start = new Date().getTime();
                    generateJson(Guests, preisliste, mainconfig).then(function (response) {
                        fs.writeFileSync(path.join(__dirname, '../', '../', '../', 'pdfGenerator', 'config.json'), JSON.stringify(response));
                        const config_end = new Date().getTime();
                        executeCommand('renderpdf', path.join(__dirname, '../', '../', '../', 'pdfGenerator')).then(function (executeCommand_response) {
                            const exec_end = new Date().getTime();
                            let Send_Incoices = [];
                            fs.readdirSync(path.join(__dirname, '../', '../', '../', 'pdfGenerator')).forEach(function (file) {
                                if (file.match(/\.pdf$/) !== null) {
                                    Send_Incoices.push(bot.sendDocument(msg.from.id, path.join(__dirname, '../', '../', '../', 'pdfGenerator', file)));
                                }
                            });
                            Promise.allSettled(Send_Incoices).then(function (response) {
                                const send_end = new Date().getTime();
                                let amount_word_count = (executeCommand_response.match(/Generating/g) || []).length;
                                bot.sendMessage(msg.chat.id, executeCommand_response);
                                bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'geninvoices.Text', { Amount: amount_word_count, duration: TimeConvert(new Date().getTime() - run_start), config_duration: TimeConvert(config_end - config_start), exec_duration: TimeConvert(exec_end - config_end), send_duration: TimeConvert(send_end - exec_end) }));
                            })
                        }).catch(function (error) {
                            log.error(error)
                            return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Error.ExecuteCommandFehler'));
                        });
                    }).catch(function (error) {
                        log.error(error)
                        return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                    })
                }).catch(function (error) {
                    log.error(error)
                    return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
                })
            } else {
                return bot.sendMessage(msg.chat.id, newi18n.translate(tglang_response, 'Admin.MustBeAdmin'));
            }
        }).catch(function (error) {
            log.error(error)
            return bot.sendMessage(msg.chat.id, newi18n.translate(process.env.Fallback_Language || 'en', 'Error.DBFehler'));
        });
    });
}