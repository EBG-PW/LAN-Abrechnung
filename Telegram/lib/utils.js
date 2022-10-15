const path = require('path');
const { default: i18n } = require('new-i18n')
const newi18n = new i18n(path.join(__dirname, '../', 'lang'), ['de', 'en', 'de-by'], process.env.Fallback_Language);

/**
 * This function will handle pops of telebot
 * @param {props} props
 * @returns {object}
 */
 function AtrbutCheck(props) {
    let input = props.match.input.split(' ')
    if (input[0].endsWith(process.env.Telegram_Bot_Botname)) {
        let attributesWName = [];
        for (let i = 1; i <= input.length - 1; i++) {
            attributesWName.push(input[i])
        }
        if (attributesWName.length >= 1) {
            return { hasAttributes: true, attributes: attributesWName }
        } else {
            return { hasAttributes: false }
        }
    } else {
        if (typeof (props.match[1]) === 'undefined') {
            return { hasAttributes: false }
        } else {
            let atributeOName = [];
            let input = props.match[1].split(' ')
            for (let i = 1; i <= input.length - 1; i++) {
                atributeOName.push(input[i])
            }
            return { hasAttributes: true, attributes: atributeOName }
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

module.exports = {
    AtrbutCheck,
    CentToEuro,
    NLtoJSNL,
    TimeConvert,
    boolToText
}