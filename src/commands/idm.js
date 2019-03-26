const fr = require('../util/flowable-rest');
const rest = fr.client;

const protectedUsers = [ 'admin', 'rest-admin' ];

module.exports = function(cli) {

    cli.vorpal.command('set-cli-user <user> [password]')
        .description('Set login credentials for rest API')
        .action(async function (args, cb) {
            fr.login(args.user, args.password ? args.password : args.user);
            cli.updatePrompt(args.user+"@localhost");
            cb();
        });

    cli.vorpal.command('user list')
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

    cli.vorpal.command('user create <userId> [password] [firstName] [lastName] [displayName] [email]')
        .description('Create a user.')
        .action(async function (args, cb) {
            try {
                let response = await rest().post('/identity/users', {
                    "id": args.userId,
                    "password": args.password || args.userId,
                    "firstName": args.firstName,
                    "lastName": args.lastName,
                    "displayName": args.displayName,
                    "email": args.email,
                });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('user delete <userId>')
        .description('Delete a user.')
        .action(async function (args, cb) {
            if (protectedUsers.some(u => u === args.userId)) {
                cli.logErr("Can not delete a protected user.");
            } else {
                try {
                    let response = await rest().delete(`/identity/users/${args.userId}`);
                    cli.log(response.data);
                } catch (e) {
                    cli.logErr(fr.toMessage(e));
                }
            }
            cb();
        });

    cli.vorpal.command('group list')
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

    cli.vorpal.command('group create <groupId> <groupName> [groupType]')
        .description('Create a group.')
        .action(async function (args, cb) {
            try {
                let response = await rest().post('/identity/groups', {
                    "id": args.groupId,
                    "name": args.groupName,
                    "type": args.groupType || 'assignment'
                });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('group delete <groupId>')
        .description('Create a group.')
        .action(async function (args, cb) {
            try {
                let response = await rest().delete(`/identity/groups/${args.groupId}`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });
};
