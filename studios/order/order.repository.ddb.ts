import IOrderRepository from './order.repository';
import { S3Client } from '@aws-sdk/client-s3';
import { Instructor } from '../plan/plan.model';
import { CompleteDTO, InstructorSet, Order, OrderItem, OrderStatus } from './order.model';
import axios from 'axios';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class OrderRepositoryDdb implements IOrderRepository {
  private readonly USER_TABLE: string = 'user';
  private readonly ORDER_TABLE: string = 'order';
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  private readonly SEQ_TABLE: string = 'seq';
  private readonly IamportKey: string = '2510123840261826';
  private readonly IamportSecret: string = '6ndDXgQIhPMgXG6Zcp8kbVtQd0IYCEtnzSRoi7cBRf6KrTN4pWgvcn3oYGhDZfnsrXFGxg28qwstOA7r';
  constructor(
    private readonly jthor = new Jthor(config, '', true),
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) {}

  async findInstructor(instructor: string): Promise<InstructorSet> {
    const params = { TableName: this.USER_TABLE, Key: { id: instructor } };
    let existInstructor = (await this.jthor.ddbUtil.getInfo(params)).val;
    if (existInstructor === undefined) {
      existInstructor = {
        id: instructor,
        hp: '탈퇴한 강사.',
        group: '탈퇴한 강사.',
        email: '탈퇴한 강사.',
        isDel: '탈퇴한 강사.',
        name: '탈퇴한 강사.',
        isShow: '탈퇴한 강사.',
        createdAt: 0,
        updatedAt: 0,
        role: '탈퇴한 강사.',
        birthdate: '탈퇴한 강사.',
      };
    }
    return new InstructorSet(existInstructor);
  }

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

  async getAccessToken(): Promise<string> {
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: {
        imp_key: this.IamportKey, // REST API 키
        imp_secret: this.IamportSecret, // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    return access_token;
  }

  async getPaymentData(keys: CompleteDTO, accessToken: string): Promise<any> {
    const axiosResponse = await axios({
      url: `https://api.iamport.kr/payments/${keys.imp_uid}`, // imp_uid 전달
      method: 'get',
      headers: { Authorization: accessToken }, // 인증 토큰 Authorization header에 추가
    });
    return axiosResponse.data.response;
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

    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async findOrderItemByPlanId(id: string): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'planId-createdAt-index',
      ScanIndexForward: false,
      ProjectionExpression:
        'id, #comment, attendance, reservationer, reservationCount, payOptionCount, userInfo.email, reservationerHp, orderId',
      KeyConditionExpression: '#key = :value',
      FilterExpression: '#orderStatus = :complete or #orderStatus = :canceling',
      ExpressionAttributeNames: { '#key': 'planId', '#comment': 'comment', '#orderStatus': 'orderStatus' },
      ExpressionAttributeValues: {
        ':value': id,
        ':complete': OrderStatus.COMPLETE,
        ':canceling': OrderStatus.CANCELING,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async updateAttendance(orderItemId: string, isAttendance: boolean): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Key: {
        id: { S: orderItemId },
      },
      UpdateExpression: `SET attendance = :attendance`,
      ExpressionAttributeValues: {
        ':attendance': {
          BOOL: isAttendance,
        },
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      return await this.jthor.ddb.send(command);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async updateComment(orderItemId: string, comment: string): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Key: {
        id: { S: orderItemId },
      },
      UpdateExpression: `SET #comment = :comment`,
      ExpressionAttributeNames: { '#comment': 'comment' },
      ExpressionAttributeValues: {
        ':comment': {
          S: comment,
        },
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      return await this.jthor.ddb.send(command);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }
}
