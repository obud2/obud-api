import IReservationRepository from './reservation.repository';
import { GetReservationList, Order, OrderItem, OrderStatus, StudiosShort, UserInfo } from './reservation.model';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class ReservationRepositoryDdb implements IReservationRepository {
  private readonly ORDER_TABLE: string = 'order';
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  private readonly REFUND_TABLE: string = 'refund';
  private readonly STUDIOS_TABLE: string = 'studios';
  private readonly LESSON_TABLE: string = 'lesson';
  private readonly PLAN_TABLE: string = 'plan';
  private readonly USER_TABLE: string = 'user';
  constructor(private readonly jthor = new Jthor(config, '', true)) {}
  async getReservationList(query: GetReservationList): Promise<any> {
    return await this.getList(query, OrderStatus.COMPLETE);
  }
  async getReservationListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any> {
    return await this.getList(query, OrderStatus.COMPLETE, false, studiosList);
  }
  async getOldReservationList(query: GetReservationList): Promise<any> {
    return await this.getList(query, OrderStatus.COMPLETE, true);
  }
  async getOldReservationListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any> {
    return await this.getList(query, OrderStatus.COMPLETE, true, studiosList);
  }
  async getCancelList(query: GetReservationList): Promise<any> {
    return await this.getList(query, OrderStatus.CANCEL);
  }
  async getCancelingList(query: GetReservationList): Promise<any> {
    return await this.getList(query, OrderStatus.CANCELING);
  }
  async getRefusalList(query: GetReservationList): Promise<any> {
    return await this.getList(query, OrderStatus.REFUSAL);
  }
  async getCancelListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any> {
    return await this.getList(query, OrderStatus.CANCEL, false, studiosList);
  }
  async getCancelingListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any> {
    return await this.getList(query, OrderStatus.CANCELING, false, studiosList);
  }
  async getRefusalListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any> {
    return await this.getList(query, OrderStatus.REFUSAL, false, studiosList);
  }
  private async getList(
    query: GetReservationList,
    status: OrderStatus,
    isOld: boolean = false,
    isStudios: string[] | undefined = undefined,
  ) {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'orderStatus-createdAt-index',
      ScanIndexForward: false,
      ProjectionExpression:
        'id, reservationer, userInfo.email, userInfo.id, reservationerHp, studiosTitle, lessonTitle, startDate, endDate, reservationCount, payOptionCount, amount, orderId, cancelAmount, cancelDate, createdAt, orderStatus, price, payOption.price',
    };
    if (status === OrderStatus.COMPLETE) {
      params.KeyConditionExpression = `#key = :value`;
      if (isOld) {
        params.FilterExpression = '#startDate <= :nowDate';
      } else {
        params.FilterExpression = '#startDate > :nowDate';
      }
      params.ExpressionAttributeNames = {
        '#key': 'orderStatus',
        '#startDate': 'startDate',
      };
      params.ExpressionAttributeValues = {
        ':value': status,
        ':nowDate': this.getNow(),
      };
      if (isStudios !== undefined) {
        const studiosExpressionValues: any = {};

        isStudios.forEach((studioId, index) => {
          const placeholder = `:studio${index}`;
          studiosExpressionValues[placeholder] = studioId;
        });

        const studiosExpression = isStudios.map((_, index) => `#studio = :studio${index}`).join(' OR ');

        params.FilterExpression += ` AND (${studiosExpression})`;
        params.ExpressionAttributeNames['#studio'] = 'studiosId';
        params.ExpressionAttributeValues = {
          ...params.ExpressionAttributeValues,
          ...studiosExpressionValues,
        };
      }
    } else {
      params.KeyConditionExpression = `#key = :value`;
      params.ExpressionAttributeNames = { '#key': 'orderStatus' };
      params.ExpressionAttributeValues = { ':value': status };
      if (isStudios !== undefined) {
        const studiosExpressionValues: any = {};

        isStudios.forEach((studioId, index) => {
          const placeholder = `:studio${index}`;
          studiosExpressionValues[placeholder] = studioId;
        });

        const studiosExpression = isStudios.map((_, index) => `#studio = :studio${index}`).join(' OR ');

        params.FilterExpression = `(${studiosExpression})`;
        params.ExpressionAttributeNames['#studio'] = 'studiosId';
        params.ExpressionAttributeValues = {
          ...params.ExpressionAttributeValues,
          ...studiosExpressionValues,
        };
      }
    }

    if (query.keyword) {
      let prefix: string = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression =
        prefix +
        ' ( contains(#studiosTitle, :keyword) or contains(#lessonTitle, :keyword) or contains(#reservationer, :keyword) or #orderItemId = :keyword ) ';
      params.ExpressionAttributeNames['#studiosTitle'] = 'studiosTitle';
      params.ExpressionAttributeNames['#lessonTitle'] = 'lessonTitle';
      params.ExpressionAttributeNames['#reservationer'] = 'reservationer';
      params.ExpressionAttributeNames['#orderItemId'] = 'orderId';
      params.ExpressionAttributeValues[':keyword'] = query.keyword;
    }
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }
  async findOrderItemById(orderItemId: string): Promise<OrderItem> {
    const params: any = { TableName: this.ORDER_ITEM_TABLE, Key: { id: orderItemId } };
    const result = await this.jthor.ddbUtil.getInfo(params);
    if (result.val === undefined) {
      throw new Error('해당 주문이 존재하지 않습니다.');
    }
    return OrderItem.createOrderItem(result.val);
  }
  async findOrderById(orderId: string): Promise<Order> {
    const params: any = { TableName: this.ORDER_TABLE, Key: { id: orderId } };
    const result = await this.jthor.ddbUtil.getInfo(params);
    if (result === undefined) {
      throw new Error('해당 주문이 존재하지 않습니다.');
    }
    return Order.getOrder(result.val);
  }
  async getStudiosListByUserId(userInfo: UserInfo): Promise<any> {
    const params: any = {
      TableName: this.STUDIOS_TABLE,
      IndexName: 'createdID-createdAt-index',
      ProjectionExpression: 'id',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'createdID' },
      ExpressionAttributeValues: { ':value': userInfo.id },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }
  async updateOrderItemStatus(orderItemId: string, date: string, status: OrderStatus, cancelAmount: number): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Key: {
        id: {
          S: orderItemId,
        },
      },
      UpdateExpression: `SET orderStatus = :orderStatus, cancelDate = :cancelDate, cancelAmount = :cancelAmount`,
      ExpressionAttributeValues: {
        ':orderStatus': { S: status },
        ':cancelDate': { S: date },
        ':cancelAmount': { N: cancelAmount.toString() },
      },
      ReturnValues: 'ALL_NEW',
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      return await this.jthor.ddb.send(command);
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }
  async getRefundListByStudiosId(studiosId: string): Promise<any> {
    const params: any = {
      TableName: this.REFUND_TABLE,
      IndexName: 'studiosId-day-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'studiosId' },
      ExpressionAttributeValues: { ':value': studiosId },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }
  async findStudiosByIdInfo(studiosId: string): Promise<StudiosShort> {
    const params: any = {
      TableName: this.STUDIOS_TABLE,
      ProjectionExpression: 'id, title, refundPolicy',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':value': { S: studiosId } },
    };
    try {
      const command: QueryCommand = new QueryCommand(params);
      const item = await this.jthor.docClient.send(command);
      if (item.Items.length === 0) {
        throw new Error(`Studios ID :: ${studiosId} 해당 Studios 가 존재하지 않습니다.`);
      }
      return new StudiosShort(item.Items[0]);
    } catch (e: any) {
      throw e;
    }
  }
  private getNow(): string {
    const dateForm: Date = new Date();
    dateForm.setHours(dateForm.getHours() + 9);
    return dateForm.toISOString().substring(0, 19);
  }
  async findPlanById(planId: string): Promise<any> {
    const params = { TableName: this.PLAN_TABLE, Key: { id: planId } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async findLessonById(lessonId: string): Promise<any> {
    const params = { TableName: this.LESSON_TABLE, Key: { id: lessonId } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async findStudiosById(studiosId: string): Promise<any> {
    const params = { TableName: this.STUDIOS_TABLE, Key: { id: studiosId } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async findUser(createdID: string): Promise<any> {
    const params = { TableName: this.USER_TABLE, Key: { id: createdID } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
}
