# Twitter Workflow demo

# Scenario background

An employer creates a workflow for twitter jobs. Each job defines a message to tweet on behalf of the employer. Workers perform these jobs and gets paid for doing so.

# Steps

## 1. Installing

See [README](../README.md) for requirements and how to set up a Flowable development environment with the REST API:s enabled.

## 2. workflow-lab

The code in workflow-lab is for testing the REST API of Flowable with recipes on how to use Flowable for coordinating the workers It has a command line interface to make it easy to perform actions from different roles and check the results interactively.

## 3. Starting a Flowable instance

See [README](../README.md) for building a docker image of Flowable which contains the REST API.

    docker run -p8080:8080 --name flowable-lab -d flowable-all-with-rest
    docker logs -f flowable-lab

## 4. Importing and deploying the workflow

Once the instance is started open the process modeler UI here <http://localhost:8080/flowable-modeler>

Import the BPMN definition `resources/processes/Twitter_Job.bpmn20.xml`.

Create an "App" deployment containing the workflow process.

## 5. Start the workflow-lab CLI

    yarn run
    
## 6. Setup users and groups for the demo

Employer:

    user create employer1 

Workers:

    user create worker1
    user create worker2

Worker group:

    wf group tweeters

## 7. Enroll for work

    wf enroll worker1 tweeters
    wf enroll worker2 tweeters

Check for available work

    wf work worker1
    wf work worker2

## 8. Employer posts tweet jobs

Check which jobs the `tweet_employer` can start:

    wf start employer1
    
Start three jobs:

    wf start employer1 twitterjob tweeters "tweet_msg=First tweet"
        
List all process instances in flowable:  
  
    process-inst list

Also check the admin UI <http://localhost:8080/flowable-admin/#/process-engine>.

## 9. Workers claim the work 

List available work:

    wf work worker1
    
Claim work:

    wf work worker1 <taskId> worker_payaddress=GWORKER1
    wf work worker2 <taskId> worker_payaddress=GWORKER2
    wf work worker1 <taskId> worker_payaddress=GWORKER1
    
## 10. Workers and employers preform their tasks

Check tasks for workers:

    wf task worker1
    wf task worker2
    
Submit work / mark work as completed

    wf task worker1 <taskId> work_result=someurl1
    wf task worker2 <taskId> work_result=someurl2
    wf task worker1 <taskId> work_result=someurl3

Check tasks for employer:

    wf task employer1
    
Complete the employer payment tasks:

    wf task employer1 <taskId>
    wf task employer1 <taskId>
    wf task employer1 <taskId>
    
## 11. Check that all processes have been completed

    process-inst list
