const fs = require('fs');
const cli = require('./util/cli');

const { vorpal, logAndCb, log, logErr, logAsJSON } = cli;

(async function() {

    // Set up config object for commands
    const config = {};

    // Set up state object which is shared between all commands
    const state = {};

    // Loop over the js files in ./src/commands and "register" them.
    const commandsFolder = __dirname +`/commands`;
    process.stdout.write('Loading commands: ')
    fs.readdirSync(commandsFolder).forEach(file => {
        const cmd = /^(.*)\.js$/g.exec(file);
        if (cmd) {
            require(`./commands/${cmd[1]}`)(cli, config, state);
            process.stdout.write(cmd[1]+" ");
        }
    });
    process.stdout.write("\n")

    const promptInfo = 'rest-admin@localhost';

    // Show the command prompt
    try {
        cli.show(promptInfo)
    } catch (e) {
        logErr(e);
    }
})();
