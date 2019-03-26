const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('deployment list')
        .description('List deployments.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/repository/deployments');
                cli.logTable(response.data.data);
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('deployment resources <deploymentId>')
        .description('List deployment resources.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/repository/deployments/${args.deploymentId}/resources`);
                cli.logTable(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('deployment delete <deploymentId>')
        .description('Delete deployment.')
        .action(async function (args, cb) {
            try {
                let response = await rest().delete(`/repository/deployments/${args.deploymentId}`);
                cli.log(response.status);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });
};
