const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('execution list')
        .description('List executions, i.e. execution states of active process instances.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/runtime/executions');
                cli.logTable(pick.from(response.data.data, 'id', 'processInstanceId', 'parentId', 'suspended', 'activityId', 'tenantId'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('execution variables <executionId>')
        .description('List variables defined for an execution.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/executions/${args.executionId}/variables`);
                cli.logTable(response.data, 'id', 'processInstanceId', 'parentId', 'suspended', 'activityId', 'tenantId');
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

};
