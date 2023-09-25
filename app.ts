import { Express, Request, Response } from 'express';
import { logger } from './winston';
import { CodeRouter } from './code/code/code';
import { UserRouter } from './user/user/user';
import { GroupRouter } from './user/group/group';
import { AuthRouter } from './user/auth/auth';
import { BannerRouter } from './banner/banner/banner';
import { InfoRouter } from './bbs/info/info';
import { NoticeRouter } from './bbs/notice/notice';
import { FaqRouter } from './bbs/faq/faq';
import { QnARouter } from './bbs/qna/qna';
import { ContactRouter } from './bbs/contact/contact';
import { UploadRouter } from "./bbs/upload/upload";
import { StudiosRouter } from './studios/studios/studios';
import { LessonRouter } from './studios/lesson/lesson';
import { PlanRouter } from './studios/plan/plan';
import { OrderRouter } from './order/order/order';
import { EmailRouter } from './user/email/email';
import { WishRouter } from './user/wish/wish';
import { SearchRouter } from './bbs/search/search';

import { CartRouter } from './cart/cart/cart';
import { MyPageRouter } from './user/myPage/myPage';

import { ReservationRouter } from './reservation/reservation/reservation';

const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef');
const express = require('express');
const bodyParser = require('body-parser');

const app: Express = express();
const port = 5100;
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use('/api-docs', swaggerUi.serve, (...args) => swaggerUi.setup(swaggerSpec)(...args));
app.use(morgan('dev', { stream: logger.stream })); // morgan 로그 설정

app.use('/code', new CodeRouter().handle());
app.use('/user/group', new GroupRouter().handle());
app.use('/user/myPage', new MyPageRouter().getRouter());
app.use('/user/auth', new AuthRouter().getRouter());
app.use('/user/wish', new WishRouter().getRouter());
app.use('/user', new UserRouter().handle());
app.use('/banner', new BannerRouter().handle());

app.use('/bbs/info', new InfoRouter().handle());
app.use('/bbs/notice', new NoticeRouter().handle());
app.use('/bbs/faq', new FaqRouter().handle());
app.use('/bbs/qna', new QnARouter().handle());
app.use('/bbs/contact', new ContactRouter().handle());
app.use('/search', new SearchRouter().getRouter());
app.use("/upload", new UploadRouter().handle());

app.use('/studios/lesson', new LessonRouter().getRouter());
app.use('/studios/plan', new PlanRouter().getRouter());
app.use('/studios', new StudiosRouter().getRouter());

app.use('/cart', new CartRouter().getRouter());

app.use('/order', new OrderRouter().getRouter());

app.use('/email', new EmailRouter().handle());

app.use('/reservation', new ReservationRouter().getRouter());

app.get('/', (req: Request, res: Response) => res.send('Typescript + Node.js + Express Server'));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.listen(port, () => {
  logger.info(`[Server]: Server is running at http://localhost:${port}`);
});
