'use strict';
const moment = require('moment');
const Jthor = require('atoz-jthor');
const config = require('./aws-config.json');
const jthor = new Jthor(config, '', false);
const axios = require('axios');

const ORDER_ITEM_TABLE = 'order_item';
const STUDIOS_TABLE = 'studios';
const USER_TABLE = 'user';

exports.handler = async (event, context) => {
  // 예약 안내 (예약일 1일 전 발송(전날 오전 10시), 예약 1일 전~당일 구매 시, 구매 후 바로 알림톡
  console.log('########## Obud Scheduler event time  >> ', event.time);
  console.log('########## Obud Scheduler event moment time  >> ', moment(event.time).format('HHmm'));
  await findTomorrowLesson();
};

const findTomorrowLesson = async () => {
  const date = await makeDayInfo();
  console.log(date);
  const completeOrderItemList = (await findCompleteOrderItemList(date)).val;
  await sendCheckMsgUser(completeOrderItemList);
};

//TODO 수정 필요
const sendCheckMsgUser = async completeOrderItemList => {
  await Promise.all(
    completeOrderItemList.map(async orderItem => {
      const user = (await findUser(orderItem.createdID)).val;
      const studios = (await findStudios(orderItem.studiosId)).val;
      const msg = `안녕하세요 #{이름}님 obud입니다.

예약 안내드립니다.

- 상품명 : #{VAR1}
- 예약일 : #{VAR2}
- 인원 : #{VAR3}
- 주문번호: #{VAR4}
- 결제 금액 : #{VAR5}

✅ 안내 사항
#{VAR6}

좋은 시간 되시길 바랍니다.😊

감사합니다.`;

      const param = {
        service: 2310085547,
        message: msg,
        numbers: [
          {
            key: 1,
            hp: orderItem.reservationerHp,
            name: user.name,
            VAR1: `[${orderItem.studiosTitle}]${orderItem.lessonTitle}`,
            VAR2: getTimeSet(orderItem.startDate),
            VAR3: orderItem.reservationCount,
            VAR4: orderItem.orderId,
            VAR5: orderItem.amount.toLocaleString('ko-KR') + '원',
            VAR6: studios.information + '\n- ' + studios.parking ? '주차공간이 있습니다.' : '주차공간이 없습니다.',
          },
        ],
        template: 10038,
        groupId: 'G1000000007',
      };
      await axiosSend(param);
    }),
  );
};
const findUser = async createdID => {
  const params = { TableName: USER_TABLE, Key: { id: createdID } };
  return jthor.ddbUtil.getInfo(params);
};
const findStudios = async studiosId => {
  const params = {
    TableName: STUDIOS_TABLE,
    Key: { id: studiosId },
    KeyConditionExpression: `id, information, parking`,
  };
  return await jthor.ddbUtil.getInfo(params);
};

const findCompleteOrderItemList = async date => {
  const params = {
    TableName: ORDER_ITEM_TABLE,
    IndexName: 'status-createdAt-index',
    ScanIndexForward: false,
    KeyConditionExpression: `#key = :value`,
    FilterExpression: `begins_with(#start, :start) AND (#orderStatus1 = :orderStatus1 OR #orderStatus2 = :orderStatus2 OR #orderStatus3 = :orderStatus3) `,
    ExpressionAttributeNames: {
      '#key': 'status',
      '#start': 'startDate',
      '#orderStatus1': 'orderStatus',
      '#orderStatus2': 'orderStatus',
      '#orderStatus3': 'orderStatus',
    },
    ExpressionAttributeValues: {
      ':value': 'ENABLE',
      ':start': date,
      ':orderStatus1': 'COMPLETE',
      ':orderStatus2': 'CANCELING',
      ':orderStatus3': 'REFUSAL',
    },
  };
  return await jthor.ddbUtil.scanPagination(params, 'query');
};

const getTimeSet = startDate => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(startDate);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours < 12 ? '오전' : '오후';
  const hours12 = hours % 12 || 12;

  return `${year}년 ${month}월 ${day}일 (${dayOfWeek}) ${period} ${hours12}시 ${minutes}분`;
};

const axiosSend = async param => {
  const headers = {
    groupid: 'G1000000007',
    apikey: 'b3e06d45-35a4-4d31-ad41-4feab973d050',
  };
  await axios.post('https://api.alltalk.co.kr/alimTalk/', param, { headers });
};

const makeDayInfo = async () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().substring(0, 10);
};
