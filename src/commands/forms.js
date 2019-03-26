const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    cli.vorpal.command('form data')
        .option('-t, --taskId <taskId>', 'Use task ID')
        .option('-p, --processDefinitionId <processDefinitionId>', 'Use process definition ID')
        .description('Retrieve form data that has been registered directly on process definition or task')
        .action(async function (args, cb) {
            let requestParameters = {};
            if (args.options.taskId) {
                requestParameters.taskId = args.options.taskId;
            } else if (args.options.processDefinitionId) {
                requestParameters.processDefinitionId = args.options.processDefinitionId;
            } else {
                cli.logErr("Either -t / --taskId <taskId> or -p / --processDefinitionId <processDefinitionId> must be specified.");
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


    cli.vorpal.command('form data-submit [idValuePairs...]')
        .option('-t, --taskId <taskId>', 'Use task ID')
        .option('-p, --processDefinitionId <processDefinitionId>', 'Use process definition ID')
        .description('Submit form properties to a task or process definition. Format "id=value"')
        .action(async function (args, cb) {
            let postParameters = {};
            if (args.options.taskId) {
                postParameters.taskId = args.options.taskId;
            } else if (args.options.processDefinitionId) {
                postParameters.processDefinitionId = args.options.processDefinitionId;
            } else {
                cli.logErr("Either -t / --taskId <taskId> or -p / --processDefinitionId <processDefinitionId> must be specified.");
                return cb();
            }

            let formValues = fr.parseIdValuePairs(args.idValuePairs, true);
            postParameters.properties = formValues;

            cli.log("Sending: "+JSON.stringify(formValues));

            try {
                let response = await rest().post('/form/form-data', postParameters);
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

};
