'use strict';

// @ts-ignore
const express = require('express');
// @ts-ignore
const bodyParser = require('body-parser');
// @ts-ignore
const cors = require('cors');
// @ts-ignore
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const { InfoRouter } = require('./dist/info/info');
const { BbsRouter } = require('./dist/bbs/bbs');
const { NoticeRouter } = require('./dist/notice/notice');
const { NewsRouter } = require('./dist/news/news');
const { FaqRouter } = require('./dist/faq/faq');
const { QnARouter } = require('./dist/qna/qna');
const { ContactRouter } = require('./dist/contact/contact');
const { SearchRouter } = require('./dist/search/search');
const { UploadRouter } = require("./dist/upload/upload");

// @ts-ignore
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

const infoRoute = new InfoRouter();
app.use('/bbs/info', infoRoute.handle());

const contactRoute = new ContactRouter();
app.use('/bbs/contact', contactRoute.handle());

const bbsRoute = new BbsRouter();
app.use('/bbs', bbsRoute.handle());

const searchRoute = new SearchRouter();
app.use('/search', searchRoute.getRouter());

const noticeRoute = new NoticeRouter();
app.use('/bbs/notice', noticeRoute.handle());

const newsRoute = new NewsRouter();
app.use('/bbs/news', newsRoute.handle());

const faqRoute = new FaqRouter();
app.use('/bbs/faq', faqRoute.handle());

const qnaRoute = new QnARouter();
app.use('/bbs/qna', qnaRoute.handle());

const uploadRoute = new UploadRouter();
app.use("/upload", uploadRoute.handle());

module.exports = app;
