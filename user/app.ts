'use strict';

// @ts-ignore
const express = require('express');
// @ts-ignore
const bodyParser = require('body-parser');
// @ts-ignore
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
// @ts-ignore
const session = require('express-session');

const { UserRouter } = require('./dist/user/user');
const { GroupRouter } = require('./dist/group/group');
const { AuthRouter } = require('./dist/auth/auth');
const { EmailRouter } = require('./dist/email/email');
const { WishRouter } = require('./dist/wish/wish');
const { MyPageRouter } = require('./dist/myPage/myPage');

// @ts-ignore
const app = express();
// @ts-ignore
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(
  session({
    secret: 'atoz-session-secret-key-ddjj',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(awsServerlessExpressMiddleware.eventContext());

const myPageRouter = new MyPageRouter();
app.use('/user/myPage', myPageRouter.getRouter());

const groupRoute = new GroupRouter();
app.use('/user/group', groupRoute.handle());

const wishRouter = new WishRouter();
app.use('/user/wish', wishRouter.getRouter());

const authRouter = new AuthRouter();
app.use('/user/auth', authRouter.getRouter());

const userRoute = new UserRouter();
app.use('/user', userRoute.handle());

const emailRouter = new EmailRouter();
app.use('/email', emailRouter.handle());

module.exports = app;
