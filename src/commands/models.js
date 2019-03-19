const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('models')
        .description('List models')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/repository/models');
                cli.logTable(response.data.data);
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

};
