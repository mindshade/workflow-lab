const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('process-definitions')
        .description('List process definitions')
        .action(async function (args, cb) {
            try {
                let response = await rest().get('/repository/process-definitions');
                cli.logTable(pick.from(response.data.data, 'id', 'key', 'name', 'version', 'category', 'description', '' +
                    'startFormDefined'));
                cli.log(fr.toPaginationMsg(response.data));
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-instances')
        .description('List process instances')
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

    // POST /runtime/process-instances

    cli.vorpal.command('process-instance-create <name>')
        .option('-k, --processDefinitionKey <processDefinitionKey>', 'Use process definition key')
        .option('-i, --processDefinitionId <processDefinitionId>', 'Use process definition ID')
        .description('List process instances')
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

            try {
                let response = await rest().post('/runtime/process-instances', requestParameters);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('process-instance <processInstanceId>')
        .description('Get a process instance')
        .action(async function (args, cb) {
            try {
                let response = await rest().get(`/runtime/process-instances/${args.processInstanceId}`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });


    cli.vorpal.command('process-instance-delete <processInstanceId>')
        .description('Delete a process instance')
        .action(async function (args, cb) {
            try {
                let response = await rest().delete(`/runtime/process-instances/${args.processInstanceId}`);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('form-describe')
        .option('-t, --taskId <taskId>', 'Use task ID')
        .option('-p, --processDefinitionId <processDefinitionId>', 'Use process definition ID')
        .description('List form')
        .action(async function (args, cb) {
            let requestParameters = {};
            if (args.options.taskId) {
                requestParameters.taskId = args.options.taskId;
            } else if (args.options.processDefinitionId) {
                requestParameters.processDefinitionId = args.options.processDefinitionId;
            } else {
                cli.logErr("Either -t or -p must be specified.")
                return cb();
            }

            try {
                let response = await rest().get('/form/form-data', { params: requestParameters });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });


};


/*
    Variable representation
    {
        "name" : "variableName",
        "value" : "variableValue",
        "valueUrl" : "http://...",
        "type" : "string"
    }


 */
