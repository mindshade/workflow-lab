const axios = require('axios');

let _client;

function login(user, password) {
    _client = axios.create({
        baseURL: 'http://localhost:8080/flowable-rest/service',
        timeout: 5000,
        headers: {},
        auth: {
            username: user,
            password: password
        },
        params: {
            start: 0,
            size: 1000
        },
    });
}

login('rest-admin', 'test');

function client() {
    return _client;
}

function toMessage(exception) {
    let message = exception.message;
    if (exception.response && exception.response.data) {
        if (exception.response.data.message) {
            message = message + " / " + exception.response.data.message;
        }
        if (exception.response.data.exception) {
            message = message + " / " + exception.response.data.exception;
        }
    }
    return message;
}

function toPaginationMsg(data) {
    let message = "";
    if (data.total != null) {
        let start = data.size > 0 ? Math.max(data.start,1) : 0;
        message = `[Showing records ${start}-${data.start+data.size} of ${data.total}]`;
    }
    return message;
}

module.exports = {
    client,
    login,
    toMessage,
    toPaginationMsg
};
