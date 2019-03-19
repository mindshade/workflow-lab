const fr = require('../util/flowable-rest');
const rest = fr.client;


module.exports = function(cli) {

    cli.vorpal.command('login <user> [password]')
        .description('Set login credentials for rest API')
        .action(async function (args, cb) {
            fr.login(args.user, args.password ? args.password : args.user);
            cli.updatePrompt(args.user+"@localhost");
            cb();
        });

    cli.vorpal.command('users')
        .description('List users')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/identity/users');
                cli.logTable(response.data.data);
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('groups')
        .description('List groups')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/identity/groups');
                cli.logTable(response.data.data);
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

};
