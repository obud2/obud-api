'use strict';

// @ts-ignore
const express = require('express');
// @ts-ignore
const bodyParser = require('body-parser');
// @ts-ignore
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const { StudiosRouter } = require('./dist/studios/studios');
const { LessonRouter } = require('./dist/lesson/lesson');
const { PlanRouter } = require('./dist/plan/plan');

// @ts-ignore
const app = express();
// @ts-ignore
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

const studiosRouter = new StudiosRouter();
const lessonRouter = new LessonRouter();
const planRouter = new PlanRouter();
app.use('/studios/lesson', lessonRouter.getRouter());
app.use('/studios/plan', planRouter.getRouter());
app.use('/studios', studiosRouter.getRouter());

module.exports = app;
