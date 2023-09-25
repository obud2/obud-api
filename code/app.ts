'use strict';

// @ts-ignore
const express = require('express');
// @ts-ignore
const bodyParser = require('body-parser');
// @ts-ignore
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const { CodeRouter } = require('./dist/code/code');

// @ts-ignore
const app = express();
// @ts-ignore
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

const codeRoute = new CodeRouter();
app.use('/code', codeRoute.handle());

module.exports = app;
