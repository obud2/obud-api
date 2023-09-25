'use strict';
// @ts-ignore
const app = require('./app.ts');
// @ts-ignore
const awsServerlessExpress = require('aws-serverless-express');
// @ts-ignore
const server = awsServerlessExpress.createServer(app, null);

exports.handler = (event: any, context: any) => {
  return awsServerlessExpress.proxy(server, event, context);
};
