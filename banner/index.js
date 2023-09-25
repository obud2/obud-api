'use strict';
var app = require('./app.ts');
var awsServerlessExpress = require('aws-serverless-express');
var server = awsServerlessExpress.createServer(app, null);
exports.handler = function (event, context) { return awsServerlessExpress.proxy(server, event, context); };
