import { S3Client } from '@aws-sdk/client-s3';
import { Cart, CartDTO, GetCartList, InstructorSet, UserInfo } from './cart.model';
import { GetListRequestDTO, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import ICartRepository from './cart.repository';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);

export default class CartRepositoryDdb implements ICartRepository {
  private readonly CART_TABLE: string = 'cart';
  private readonly USER_TABLE: string = 'user';
  constructor(
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
    private jthor = new Jthor(config, 'DDB', true),
  ) {}

  async create(cart: Cart): Promise<any> {
    const params = {
      TableName: this.CART_TABLE,
      Item: cart,
    };
    return await this.jthor.ddbUtil.create(params);
  }
  async update(cart: Cart): Promise<any> {
    const updateParams = {
      TableName: this.CART_TABLE,
      Key: { id: cart.id },
      SetData: cart,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }

  async delete(id: string, bucket: string | string[] | undefined): Promise<any> {
    const params = { TableName: this.CART_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.removeItem(params, bucket);
  }
  async list(query: GetCartList, userInfo: UserInfo): Promise<ResponseDTO<any>> {
    return await this.getList(query, userInfo);
  }

  private async getList(query: GetCartList, userInfo: UserInfo) {
    let params: any = {
      TableName: this.CART_TABLE,
      IndexName: 'createdID-createdAt-index',
      // ProjectionExpression: 'id, userId, productId, date, quantity, price, status',
      ScanIndexForward: false,
      KeyConditionExpression: '#createdID = :createdID',
      ExpressionAttributeNames: { '#createdID': 'createdID' },
      ExpressionAttributeValues: { ':createdID': userInfo.id },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }

  async findById(id: string): Promise<ResponseSingleDTO<any>> {
    const params = { TableName: this.CART_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async findByUserAndPlan(cart: CartDTO, userInfo: UserInfo): Promise<any> {
    const params: any = {
      TableName: this.CART_TABLE,
      IndexName: 'planId-createdID-index',
      KeyConditionExpression: '#planId = :planId and #createdID = :createdID',
      ExpressionAttributeNames: { '#planId': 'planId', '#createdID': 'createdID' },
      ExpressionAttributeValues: {
        ':planId': cart.planId,
        ':createdID': userInfo.id,
      },
    };
    const result = await this.jthor.ddbUtil.scanPagination(params, 'query');
    if (result.val.length === 0) {
      return undefined;
    }
    return result.val[0];
  }

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
}
