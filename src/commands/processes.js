const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('process-def list')
        .description('List process definitions.')
        .option('-a, --allFields', 'List all fields.')
        .option('-p, --previousVersions', 'Include all previous versions, not just the latest.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/repository/process-definitions', { params: { latest: !args.options.previousVersions }});
                cli.logTable(pick.from(response.data.data, args.options.allFields, 'id', 'key', 'name', 'version', 'category', 'description',
                    'startFormDefined'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-def starters <processDefinitionId>')
        .description('List starter candidates for a process definition.')
        .option('-a, --allFields', 'List all users or groups that can start a process instance for the specified definition..')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/repository/process-definitions/${args.processDefinitionId}/identitylinks`);
                cli.logTable(response.data);
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-def start-form <processDefinitionId>')
        .description('Display the start from for specific process definition.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/repository/process-definitions/${args.processDefinitionId}/start-form`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-def form-defintions <processDefinitionId>')
        .description('List form definitions connected to the process definition.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/repository/process-definitions/${args.processDefinitionId}/form-definitions`);
                cli.logTable(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-inst list')
        .description('List process instances.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/runtime/process-instances');
                cli.logTable(pick.from(response.data.data, 'id', 'name', 'suspended', 'ended', 'processDefinitionId',
                    'processDefinitionName', 'activityId', 'startTime', 'startUserId', 'variables'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-inst start <name> [idValuePairs...]')
        .option('-k, --processDefinitionKey <processDefinitionKey>', 'Use process definition key')
        .option('-i, --processDefinitionId <processDefinitionId>', 'Use process definition ID')
        .description('List process instances.')
        .action(async function (args, cb) {
            let requestParameters = {};
            if (args.options.processDefinitionKey) {
                requestParameters.processDefinitionKey = args.options.processDefinitionKey;
            } else if (args.options.processDefinitionId) {
                requestParameters.processDefinitionId = args.options.processDefinitionId;
            } else {
                cli.logErr("Either -k or -i must be specified.")
                return cb();
            }
            requestParameters.name = args.name;
            requestParameters.variables = fr.parseIdValuePairs(args.idValuePairs, true);
            requestParameters.returnVariables = true;

            try {
                let response = await rest().post('/runtime/process-instances', requestParameters);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-inst get <processInstanceId>')
        .description('Get information for a specific process instance.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/process-instances/${args.processInstanceId}`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-inst variables <processInstanceId>')
        .description('Get variables for a process instance.')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/process-instances/${args.processInstanceId}/variables`);
                cli.logTable(response.data);
            } catch (e) {
                try {
                    if (e.response.status === 404) {
                        cli.log("No matching active instance, checking history");
                        let historyResponse = await rest().post(`/query/historic-variable-instances`, {
                            processInstanceId: args.processInstanceId
                        });
                        cli.log("Historic instance:");
                        cli.logTable(historyResponse.data.data.map(r => { return { id: r.id, ...r.variable }; }));
                        cli.log(fr.toPaginationMsg(historyResponse.data));
                    } else {
                        cli.logErr(fr.toMessage(e));
                    }
                } catch (e2) {
                    cli.logErr(fr.toMessage(e2));
                }
            }
            cb();
        });


    cli.vorpal.command('process-inst delete <processInstanceId>')
        .description('Delete a process instance.')
        .action(async function (args, cb) {
            try {
                let response = await rest().delete(`/runtime/process-instances/${args.processInstanceId}`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-inst history')
        .description('Get a process instance history.')
        .action(async function (args, cb) {
            try {
                let response = await rest().post(`/query/historic-process-instances`, { sort: "endTime", order: "desc" });
                cli.logTable(pick.from(response.data.data, 'id', 'name', 'processDefinitionId', 'processDefinitionName',
                    'startTime', 'endTime', 'durationInMillis', 'startUserId', 'variables'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });
};
