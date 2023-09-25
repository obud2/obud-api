import IOrderRepository from './order.repository';
import { Order, OrderItem } from './order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class OrderRepositoryDdb implements IOrderRepository {
  private readonly USER_TABLE: string = 'user';
  private readonly ORDER_TABLE: string = 'order';
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  private readonly SEQ_TABLE: string = 'seq';
  constructor(private readonly jthor = new Jthor(config, '', false)) {}
  async idGenFotOrder(): Promise<string> {
    const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return this.jthor.idGen(this.SEQ_TABLE, 'OD' + formattedDate, 4);
  }

  async idGenForOrderItem(): Promise<string> {
    const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return this.jthor.idGen(this.SEQ_TABLE, 'ODI' + formattedDate, 4);
  }

  async createOrder(order: Order): Promise<any> {
    const params: any = {
      TableName: this.ORDER_TABLE,
      Item: order,
    };
    try {
      return await this.jthor.ddbUtil.create(params);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async updateOrder(order: Order): Promise<any> {
    const updateParams: any = {
      TableName: this.ORDER_TABLE,
      Key: { id: order.id },
      SetData: order,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }

  async createOrderItem(item: OrderItem): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Item: item,
    };
    try {
      return await this.jthor.ddbUtil.create(params);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async updateOrderItem(orderItem: OrderItem): Promise<any> {
    const updateParams: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Key: { id: orderItem.id },
      SetData: orderItem,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }

  async findOrderById(id: string): Promise<any> {
    const params = { TableName: this.ORDER_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async findOrderItemByOrderId(id: string): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'orderId-createdAt-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'orderId' },
      ExpressionAttributeValues: {
        ':value': id,
      },
    };

    const result = await this.jthor.ddbUtil.scanPagination(params, 'query');
    return result;
  }

  async findOrderItemById(orderItemId: string): Promise<OrderItem> {
    const params: any = { TableName: this.ORDER_ITEM_TABLE, Key: { id: orderItemId } };
    const result = await this.jthor.ddbUtil.getInfo(params);
    if (result.val === undefined) {
      throw new Error('해당 주문이 존재하지 않습니다.');
    }
    return OrderItem.createOrderItem(result.val);
  }

  async findUser(createdID: string): Promise<any> {
    const params = { TableName: this.USER_TABLE, Key: { id: createdID } };
    return this.jthor.ddbUtil.getInfo(params);
  }
}
