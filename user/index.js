'use strict';
// @ts-ignore
var app = require('./app.ts');
// @ts-ignore
var awsServerlessExpress = require('aws-serverless-express');
// @ts-ignore
var server = awsServerlessExpress.createServer(app, null);
exports.handler = function (event, context) {
    return awsServerlessExpress.proxy(server, event, context);
};
