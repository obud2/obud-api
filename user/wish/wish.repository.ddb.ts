import IWishRepository from './wish.repository';
import { GetWishList, StudiosShort, Wish } from './wish.model';
import { UserInfo } from '../user/user.model';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class WishRepositoryDdb implements IWishRepository {
  private readonly STUDIOS_TABLE: string = 'studios';
  private readonly WISH_TABLE: string = 'wish';
  private readonly USER_TABLE: string = 'user';
  constructor(private readonly jthor = new Jthor(config, 'DDB', true)) {}

  async create(wish: Wish): Promise<any> {
    const params: any = {
      TableName: this.WISH_TABLE,
      Item: wish,
    };
    try {
      return await this.jthor.ddbUtil.create(params);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async getList(query: GetWishList, userInfo: UserInfo): Promise<any> {
    let params: any = {
      TableName: this.WISH_TABLE,
      IndexName: 'userId-createdAt-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'userId' },
      ExpressionAttributeValues: {
        ':value': userInfo.id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }

  async findStudiosById(studiosId: string): Promise<any> {
    const params: any = {
      TableName: this.STUDIOS_TABLE,
      ProjectionExpression: 'id, title, images, category, isShow',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':value': { S: studiosId } },
    };
    try {
      const command: QueryCommand = new QueryCommand(params);
      const item = await this.jthor.docClient.send(command);
      if (item.Count === 0) {
        return { message: '삭제된 스튜디오 입니다.' };
      }
      if (!item.Items[0].isShow.BOOL) {
        return { message: '숨김처리된 스튜디오 입니다' };
      }
      return new StudiosShort(item.Items[0]);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async delete(wishId: string): Promise<any> {
    const params = { TableName: this.WISH_TABLE, Key: { id: wishId } };
    return await this.jthor.ddbUtil.removeItem(params);
  }

  async findById(wishId: string): Promise<any> {
    const params = { TableName: this.WISH_TABLE, Key: { id: wishId } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async updateStudiosWishCount(studiosId: string, symbol: string): Promise<void> {
    const params: any = {
      TableName: this.STUDIOS_TABLE,
      Key: {
        id: { S: studiosId },
      },
      UpdateExpression: `SET wishCount = wishCount + :wishCount`,
      ExpressionAttributeValues: {
        ':wishCount': { N: symbol },
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      await this.jthor.ddb.send(command);
    } catch (e: any) {
      throw e;
    }
  }
}
