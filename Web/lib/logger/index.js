const rfs = require("rotating-file-stream");
const path = require('path');

const LogPath = path.join(__dirname, '..', '..', 'log');
const loglevel = Number(process.env.LOG_LEVEL) || 3;
const Levels = ['error', 'warning', 'info', 'system'];

const stream = rfs.createStream(LogPath, {
    size: "10M",
    interval: "30d",
    compress: "gzip"
});

function getTimestamp() {
    const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();

    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${pad(d.getFullYear(), 4)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * @param {string} level Loglevel of the to log text
 * @param {string} text Text to log
 * @param {boolean} skipLog If ture, don´t write to logfile
 */
const logger = function (level, text, skipLog = false) {
    const levelnumber = Levels.indexOf(level.toLowerCase()) + 1

    if (levelnumber <= loglevel && levelnumber === 1) {
        if (!skipLog) { stream.write(`[${process.env.application || "Application"}] [${getTimestamp()}] [E] ` + text + '\n'); }
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[31m[E]\x1b[0m`, text)
    }

    if (levelnumber <= loglevel && levelnumber === 2) {
        if (!skipLog) { stream.write(`[${process.env.application || "Application"}] [${getTimestamp()}] [W] ` + text + '\n'); }
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[33m[W]\x1b[0m`, text)
    }

    if (levelnumber <= loglevel && levelnumber === 3) {
        if (!skipLog) { stream.write(`[${process.env.application || "Application"}] [${getTimestamp()}] [I] ` + text + '\n'); }
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[32m[I]\x1b[0m`, text)
    }

    if (levelnumber === 4) {
        if (!skipLog) { stream.write(`[${process.env.application || "Application"}] [${getTimestamp()}] [S] ` + text + '\n'); }
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[36m[S]\x1b[0m`, text)
    }
}

/**
 * logs an error to the console and to the database or filesystem
 * @param {String} text Text to log
 * @param {Boolean} [skipLog] If ture, don´t write to logfile
 */
const logError = (text, skipLog) => logger('error', text, skipLog);

/**
 * logs a warning to the console and to the database or filesystem
 * @param {String} text Text to log
 * @param {Boolean} [skipLog] If ture, don´t write to logfile
 */
const logWarning = (text, skipLog) => logger('warning', text, skipLog);

/**
 * logs a info to the console and to the database or filesystem
 * @param {String} text Text to log
 * @param {Boolean} [skipLog] If ture, don´t write to logfile
 */
const logInfo = (text, skipLog) => logger('info', text, skipLog);

/**
 * logs an system message to the console and to the database or filesystem
 * @param {String} text Text to log
 * @param {Boolean} [skipLog] If ture, don´t write to logfile
 */
const logSystem = (text, skipLog) => logger('system', text);

const log = {
    error: logError,
    warning: logWarning,
    info: logInfo,
    system: logSystem,
}

logger('system', `Logger initialized at level ${Levels[loglevel - 1]}`);

module.exports = {
    logger,
    log
};