'use strict';

// @ts-ignore
const express = require('express');
// @ts-ignore
const bodyParser = require('body-parser');
// @ts-ignore
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const { CartRouter } = require('./dist/cart/cart');

// @ts-ignore
const app = express();
// @ts-ignore
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

const cartRouter = new CartRouter();
app.use('/cart', cartRouter.getRouter());

module.exports = app;
