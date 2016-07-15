//https://api.ai/
var api_ai = require('../base')();
var apiai = require('apiai');

var app = apiai("8cdfd3a3367b4970aeed0f333a7e307e");

api_ai.handle = function (tenant, request, next) {
    var request = app.textRequest(request.content);

    request.on('response', function (response) {
        console.log(response);
        next(response);
    });

    request.on('error', function (error) {
        console.log(error);
        next();
    });

    request.end();
}

module.exports = api_ai;