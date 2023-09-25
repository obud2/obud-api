'use strict';

// @ts-ignore
const express = require('express');
// @ts-ignore
const bodyParser = require('body-parser');
// @ts-ignore
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const { OrderRouter } = require('./dist/order/order');

// @ts-ignore
const app = express();
// @ts-ignore
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

const orderRouter = new OrderRouter();
app.use('/order', orderRouter.getRouter());

module.exports = app;
