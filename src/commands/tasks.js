const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('task list')
        .description('List tasks')
        .option('-a, --allFields', 'Display all fields.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/tasks`);
                cli.logTable(pick.from(response.data.data, args.options.allFields, 'id', 'owner', 'assignee', 'name', 'createTime', 'claimTime', 'formKey', 'taskDefinitionKey', 'processDefinitionId', 'variables'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('task assign <taskId> <user>')
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

    cli.vorpal.command('task complete <taskId> [keyValuePairs...]')
        .description('Complete a task with result variables')
        .action(async function (args, cb) {
            try {
                let response = await rest().post(`/runtime/tasks/${args.taskId}`, {
                    action: 'complete',
                    variables: fr.parseIdValuePairs(args.keyValuePairs, true)
                });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('task form <taskId>')
        .description('Get a (external) form definition for a task, defined as a separate form entity.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/tasks/${args.taskId}/form`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });


    cli.vorpal.command('task variables <taskId>')
        .description('Get variables for a task')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/tasks/${args.taskId}/variables`);
                cli.logTable(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('task identitylinks <taskId>')
        .description('Get identitylinks for a task')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/tasks/${args.taskId}/identitylinks`);
                cli.logTable(pick.from(response.data, 'user', 'group', 'type'));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });



};
