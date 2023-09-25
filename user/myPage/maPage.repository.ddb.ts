import IMyPageRepository from './maPage.repository';
import { GetMyPageReservationList, OrderStatus, UserInfo } from './maPage.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
export default class MyPageRepositoryDdb implements IMyPageRepository {
  private ORDER_ITEM_TABLE: string = 'order_item';
  private ORDER_TABLE: string = 'order';
  private USER_TABLE: string = 'user';
  constructor(private jthor = new Jthor(config, 'DDB', true)) {}
  async getReservationList(query: GetMyPageReservationList, userInfo: UserInfo): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'createdID-createdAt-index',
      ScanIndexForward: false,
      ProjectionExpression:
        'id, studiosId, images, studiosTitle, lessonId, lessonTitle, planId, startDate, endDate, createdAt, UpdatedAt, orderStatus, orderId, payOption, cancelDate, amount, price, reservationCount, payOptionCount',
      KeyConditionExpression: '#createdID = :createdID',
      FilterExpression: 'NOT (#orderStatus = :wait) AND NOT (#orderStatus = :fail)',
      ExpressionAttributeNames: { '#createdID': 'createdID', '#orderStatus': 'orderStatus' },
      ExpressionAttributeValues: { ':createdID': userInfo.id, ':wait': OrderStatus.WAIT, ':fail': OrderStatus.FAIL },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }
  async getReservationInfo(id: string): Promise<any> {
    const params = { TableName: this.ORDER_ITEM_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async getOrderInfo(orderId: any): Promise<any> {
    const params = { TableName: this.ORDER_TABLE, Key: { id: orderId } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
}
