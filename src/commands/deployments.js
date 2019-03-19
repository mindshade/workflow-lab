const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('deployments')
        .description('List deployments')
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
};
