
const vorpal = require('vorpal')();
const cTable = require('console.table');

function log(msg) {
    vorpal.log(msg);
}

function logTable(tableArr) {
    if (Array.isArray(tableArr)) {
        if (tableArr.length > 0) {
            vorpal.log(cTable.getTable(tableArr));
        }
    } else {
        logErr("Result passed to 'logTable()' was not an array.")
    }
}

function logErr(err) {
    vorpal.log(vorpal.chalk.red(err.stack ? err.message+"\n"+err.stack : err));
}

function logAsJSON(obj, pretty) {
    vorpal.log(pretty ? JSON.stringify(obj, null ,2) :JSON.stringify(obj));
}

vorpal.isCommandArgKeyPairNormalized = false; // If enabled, this corrupts some argument strings with '=' in them.

function show(promptInfo) {
    updatePrompt(promptInfo);
    vorpal
        .show();
}

function updatePrompt(delimiter) {
    vorpal.delimiter(vorpal.chalk.yellow(`[${delimiter}]>`))
}

function exec(command) {
    vorpal.exec(command);
}

module.exports = {
    vorpal,
    log,
    logTable,
    logErr,
    logAsJSON,
    show,
    exec,
    updatePrompt
};
