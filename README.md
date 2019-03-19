# Workflow Laboratory

## Rationale

This project was set up to provide a coding playground for learning and trying out the [Flowable](https://www.flowable.org) REST API.

## Overview

The project creates a Docker image with a test environment containing all the Flowable components and an in memory database. A command line (CLI) application is provided to interact with the REST API.

## Prerequisites

- Node.js
- Yarn
- Docker

## Setup

*Instructions apply to MacOS and Linux environments.*

Since the REST APIs are not enabled in the `flowable-all` Docker container, we roll our own version with this included, using the following steps:

1. Download Flowable 6.4.1 `flowable-6.4.1.zip` from <https://github.com/flowable/flowable-engine/releases/download/flowable-6.4.1/flowable-6.4.1.zip> and save the file to the `docker/assets` directory.
2. Open a terminal in `docker` directory and run `./flowable-all-with-rest.build.sh`. This will build and tag a Docker container named `flowable-all-with-rest`.
3. Start an instance of the container `docker run -p8080:8080 flowable-all-with-rest` (Note, remap the port if 8080 is not available on your machine.)

Now the REST API, as well as the other UI apps should be available at:

- Flowable REST API Swagger Docs - <http://localhost:8080/flowable-rest/docs>
- Flowable IDM <http://localhost:8080/flowable-idm>
- Flowable Modeler <http://localhost:8080/flowable-modeler>
- Flowable Task <http://localhost:8080/flowable-task>
- Flowable Admin <http://localhost:8080/flowable-admin>

## Lab CLI

Start the lab CLI with `yarn run dev` in the root directory (for automatic reload on code changes). 

By default you are logged in as `rest-admin`.

In the CLI, use `help` to learn about the available commands.

# Setting up and running a workflow

Make sure you have docker container started according to the "Setup" instructions above.

1. Open the [Modeler](http://localhost:8080/flowable-modeler) and create a process definition. Save and publish the definition.
2. Still in the modeler create an `App` (i.e. deployment) to which your process definition is connected. Give app user access to `rest-admin`, for example. Save and publish the `App` 
3. Start the CLI (`yarn run dev`).
4. The command `deployments` should now list your deployment (app).
5. The command `process-definitions` should bow list your process definition.
6. Start a new process instance using `process-instance-create -i <processDefinitionId> <name>`.
7. View process instances using `process-instances`.
7. If your process stops at a manual task this is listed by `tasks`.
8. Assign the task to a user with `task-assign <id> <user>`
8. Complete a task, to make the process instance move on, `task-complete <id>`.
