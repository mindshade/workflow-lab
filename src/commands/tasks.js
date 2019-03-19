const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('tasks')
        .description('List tasks')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/tasks`);
                cli.logTable(pick.from(response.data.data, 'id', 'owner', 'assignee', 'name', 'createTime', 'claimTime', 'formKey', 'taskDefinitionKey', 'processDefinitionId', 'variables'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('task-assign <taskId> <user>')
        .description('Assign a task to a user')
        .action(async function (args, cb) {
            try {
                let response = await rest().post(`/runtime/tasks/${args.taskId}`, {
                    action: 'claim',
                    assignee: args.user
                });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('task-complete <taskId>')
        .description('Complete a task')
        .action(async function (args, cb) {
            try {
                let response = await rest().post(`/runtime/tasks/${args.taskId}`, {
                    action: 'complete',
                    assignee: args.user
                });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

};
