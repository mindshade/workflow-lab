const pick = require('../util/pick');
const fr = require('../util/flowable-rest');
const rest = fr.client;

module.exports = function(cli) {

    const workGroupType = 'worker-group';

    cli.vorpal.command('wf group <groupId> [groupName]')
        .description('Create a worker group. [Workflow Setup]')
        .action(async function (args, cb) {
            try {
                let response = await rest().post('/identity/groups', {
                    "id": args.groupId,
                    "name": args.groupName,
                    "type": workGroupType
                });
                cli.log(response.data);
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('wf enroll <userId> [groupId]')
        .description('Enroll or de-enroll for work by joining or leaving a group. [Worker]')
        .option('-d, --deenroll', 'De-enroll (leave) from previously enrolled worker group.')
        .action(async function (args, cb) {
            try {
                if (args.groupId) {
                    if (!args.options.deenroll) {
                        cli.log(`Enrolling ${args.userId} for work group ${args.groupId}`);
                        let response = await rest().post(`/identity/groups/${args.groupId}/members`, {userId: args.userId});
                        cli.log(response.status)
                    } else {
                        cli.log(`De-enrolling ${args.userId} for work group ${args.groupId}`);
                        let response = await rest().delete(`/identity/groups/${args.groupId}/members/${args.userId}`);
                        cli.log(response.status)
                    }
                } else {
                    cli.log(`Checking enrollable work for user ${args.userId}.`);

                    cli.log("Current enrolled groups:");
                    let memberResponse = await rest().get('/identity/groups', { params: { member: args.userId, type: workGroupType }});
                    const memberOf = memberResponse.data.data;
                    if (memberOf.length > 0) {
                        cli.logTable(pick.from(memberOf, 'id', 'name', 'type'));
                    } else {
                        cli.log("\tNo groups enrolled");
                    }

                    cli.log("Available enrollment groups:");
                    let response = await rest().get('/identity/groups',  { params: { type: workGroupType }});
                    const enrolledFor = response.data.data.filter(g => !memberOf.some(m => m.id === g.id));
                    if (enrolledFor.length > 0) {
                        cli.logTable(pick.from(enrolledFor, 'id', 'name', 'type'));
                    } else {
                        cli.log("\tNo additional groups available to enroll for");
                    }
                }
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('wf start <userId> [processKey] [workerGroup] [keyValuePairs...]')
        .description('List / start workflow processes that can be started by the given user. [Employer]')
        .action(async function (args, cb) {
            try {
                if (args.processKey) {
                    if (!args.workerGroup) {
                        cli.logErr("Third parameter 'workerGroup' must be specified when starting a workflow");
                    } else {
                        cli.log(`Starting new process instance.`);
                        let variables = fr.parseIdValuePairs(args.keyValuePairs, true);
                        variables.push({name: "employer_id", value: args.userId});
                        variables.push({name: "worker_group", value: args.workerGroup});

                        let response = await rest().post('/runtime/process-instances', {
                            processDefinitionKey: args.processKey,
                            variables: variables,
                            returnVariables: true
                        });
                        cli.log(response.data);
                    }
                } else {
                    cli.log(`Processes that can be stared by ${args.userId}`);
                    let response = await rest().get(`/repository/process-definitions`, { params: { startableByUser: args.userId }});
                    cli.logTable(pick.from(response.data.data, 'key', 'version', 'name', 'description', 'id'));
                    cli.log(fr.toPaginationMsg(response.data));
                }
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });


    cli.vorpal.command('wf work <userId> [taskId] [keyValuePairs...]')
        .description('List / claim available work that can be claimed based on enrolled groups. [Worker]')
        .action(async function (args, cb) {
            try {
                if (args.taskId) {
                    // Try to claim the work.
                    cli.log(`Claiming work ${args.taskId} for user ${args.userId}`);

                    let variables = fr.parseIdValuePairs(args.keyValuePairs, true);
                    variables.push({name: "worker_id", value: args.userId});

                    // Complete and assign the task in one go. If another worker claimed
                    // the task this will throw an exception.
                    let response = await rest().post(`/runtime/tasks/${args.taskId}`, {
                        action: 'complete',
                        assignee: args.userId,
                        variables: variables
                    });
                    cli.log(response.status)
                } else {
                    // List available work which the user can claim.
                    let userGroups = (await getEnrolledGroups(args.userId, workGroupType));
                    if (userGroups.length > 0) {
                        let response = await rest().post(`/query/tasks`, {
                            active: true,
                            unassigned: true,
                            candidateGroupIn: userGroups
                        });
                        cli.log(`Listing work that can be claimed by user ${args.taskId}`);
                        cli.logTable(pick.from(response.data.data,'id', 'owner', 'assignee', 'name',
                            'createTime', 'claimTime', 'formKey', 'taskDefinitionKey', 'processDefinitionId', 'variables'));
                        cli.log(fr.toPaginationMsg(response.data));
                    } else {
                        cli.log(`User ${args.userId} is not enrolled to any worker groups.`)
                    }
                }
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    cli.vorpal.command('wf task <userId> [taskId] [keyValuePairs...]')
        .description('List / submit work tasks for a given user. [Worker or Employer]')
        .action(async function (args, cb) {
            try {
                if (args.taskId) {
                    const assignee = (await getTask(args.taskId)).assignee;
                    if (assignee === args.userId) {
                        let response = await rest().post(`/runtime/tasks/${args.taskId}`, {
                            action: 'complete',
                            variables: fr.parseIdValuePairs(args.keyValuePairs, true)
                        });
                        cli.log(response.status)
                    } else {
                        cli.logErr(`Task ${args.taskId} is not assigned to ${args.userId} but ${assignee}.`);
                    }
                } else {
                    let response = (await rest().post(`/query/tasks`, {
                        active: true,
                        assignee: args.userId,
                        includeProcessVariables: true,
                        includeTaskLocalVariables: true
                    }));

                    const tasks = response.data.data.map(t => {
                        let variables = {};
                        t.variables.forEach(v => variables[v.name] = v.value);
                        t.work_parameters = variables;
                        return t;
                    });
                    cli.logTable(pick.from(tasks,'id', 'category', 'assignee', 'name', 'createTime', 'work_parameters'));
                    cli.log(fr.toPaginationMsg(response.data));
                }
            } catch (e) {
                cli.logErr(fr.toMessage(e));
            }
            cb();
        });

    // Utility methods

    async function getEnrolledGroups(userId, groupType) {
        return (await rest().get('/identity/groups', { params: {
                member: userId,
                type: groupType }}))
            .data.data
            .map(g => g.id);
    }

    async function getTask(taskId) {
        try {
            const response = (await rest().get(`/runtime/tasks/${taskId}`));
            return response.data;
        } catch (e) {
            throw e;
        }
    }

};
