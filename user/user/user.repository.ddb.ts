import { User, ResponseDTO, GetUserInfoReq, FindIdRequest, UserInfo } from './user.model';
import IUserRepository from './user.repository';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'DDB', true);
const _ = require('lodash');

const TABLE_NAME = 'user';

export default class UserRepositoryDdb implements IUserRepository {
  private readonly CART_TABLE: string = 'cart';
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  async create(obj: User): Promise<User> {
    const params = {
      TableName: TABLE_NAME,
      Item: obj,
    };
    return await jthor.ddbUtil.create(params);
  }
  async update(obj: User): Promise<User> {
    const updateParams = {
      TableName: TABLE_NAME,
      Key: { id: obj.id },
      SetData: obj,
    };
    return await jthor.ddbUtil.update(updateParams);
  }
  delete(id: string, bucket: any): Promise<User> {
    return new Promise<User>(async resolve => {
      const params = { TableName: TABLE_NAME, Key: { id: id } };
      const deleteResult = await jthor.ddbUtil.removeItem(params, bucket);
      resolve(deleteResult);
    });
  }
  list(cursor: string, limit: number, keyword: string, evt: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit, false, keyword, evt);
  }

  listByRole(query: GetUserInfoReq): Promise<ResponseDTO> {
    return this.getList(query.cursor, query.limit, false, query.keyword, query.role, query.group);
  }

  listAll(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit, true, keyword);
  }

  getList(cursor: string, limit: number, isAll: boolean, keyword: string, role?: string, group?: string): Promise<ResponseDTO> {
    return new Promise<ResponseDTO>(async resolve => {
      let list: Array<any> = [];
      let params: any = {
        TableName: TABLE_NAME,
        IndexName: 'status-createdAt-index',
        ScanIndexForward: false,
        KeyConditionExpression: '#key = :value',
        ExpressionAttributeValues: { ':value': 'ENABLE' },
        ExpressionAttributeNames: { '#key': 'status' },
      };
      if (role) {
        params = {
          TableName: TABLE_NAME,
          IndexName: 'role-createdAt-index',
          ScanIndexForward: false,
          KeyConditionExpression: '#role = :value',
          ExpressionAttributeValues: { ':value': role },
          ExpressionAttributeNames: { '#role': 'role' },
        };
      }
      if (group) {
        params = {
          TableName: TABLE_NAME,
          IndexName: 'group-createdAt-index',
          ScanIndexForward: false,
          KeyConditionExpression: '#group = :group',
          ExpressionAttributeValues: { ':group': group },
          ExpressionAttributeNames: { '#group': 'group' },
        };
      }

      if (keyword) {
        let prefix = '';
        if (params.FilterExpression) {
          prefix = params.FilterExpression + ' and ';
        }
        params.FilterExpression = prefix + ' contains(#name, :keyword) OR contains(#email, :keyword) ';
        params.ExpressionAttributeNames['#name'] = 'name';
        params.ExpressionAttributeNames['#email'] = 'email';
        params.ExpressionAttributeValues[':keyword'] = keyword;
      }
      const countParam = _.cloneDeep(params);
      countParam.Select = 'COUNT';
      const total = await jthor.ddbUtil.scanTable(countParam, 'query');
      if (isAll) {
        list = await jthor.ddbUtil.scanTable(params, 'query');
      } else {
        list = await jthor.ddbUtil.scanPagination(params, 'query', cursor, limit);
      }

      // @ts-ignore
      resolve(list);
    });
  }
  async getListByRoleUseStudios(
    studiosAdminId: string,
    keyword: any = undefined,
    cursor: any = undefined,
    limit: any = undefined,
  ): Promise<any> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'group-createdAt-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      FilterExpression: 'contains(#studiosAdminList, :studiosAdminList)',
      ExpressionAttributeNames: { '#key': 'group', '#studiosAdminList': 'studiosAdminList' },
      ExpressionAttributeValues: { ':value': 'GR0120', ':studiosAdminList': studiosAdminId },
    };
    if (keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + '( contains(#name, :keyword) OR contains(#email, :keyword) )';
      params.ExpressionAttributeNames['#name'] = 'name';
      params.ExpressionAttributeNames['#email'] = 'email';
      params.ExpressionAttributeValues[':keyword'] = keyword;
    }
    return await jthor.ddbUtil.scanTable(params, 'query', cursor, limit);
  }

  findById(id: string): Promise<User> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return jthor.ddbUtil.getInfo(params);
  }

  async findByEmail(email: string): Promise<User> {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'email-index',
      KeyConditionExpression: '#email = :email',
      ExpressionAttributeNames: {
        '#email': 'email',
      },
      ExpressionAttributeValues: {
        ':email': email,
      },
      ProjectionExpression: 'id, email, isDel',
    };
    console.log(params);
    const result = await jthor.ddbUtil.scanTable(params, 'query');
    return result && result.val.length > 0 ? result.val[0] : null;
  }

  async findByHp(target: string): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'status-createdAt-index',
      KeyConditionExpression: '#key = :value',
      FilterExpression: ' #target = :target',
      ExpressionAttributeNames: {
        '#key': 'status',
        '#target': 'hp',
      },
      ExpressionAttributeValues: {
        ':value': 'ENABLE',
        ':target': target,
      },
      ProjectionExpression: 'id, email, isDel, hp',
    };
    console.log(params);
    const result = await jthor.ddbUtil.scanTable(params, 'query');
    return result && result.val.length > 0 ? result.val[0] : null;
  }

  async findIdByHpAndName(obj: FindIdRequest): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'status-createdAt-index',
      KeyConditionExpression: '#key = :value',
      FilterExpression: ' #hp = :hp and #name = :name',
      ExpressionAttributeNames: {
        '#key': 'status',
        '#hp': 'hp',
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':value': 'ENABLE',
        ':hp': obj.hp,
        ':name': obj.name,
      },
      ProjectionExpression: 'id, email, isDel',
    };
    const result = await jthor.ddbUtil.scanTable(params, 'query');
    return result && result.val.length > 0 ? result.val[0] : null;
  }

  async putVisitCount(): Promise<any> {
    const params: any = {
      TableName: 'info',
      Key: {
        id: { S: 'visit' },
      },
      UpdateExpression: 'SET visitCount = if_not_exists(visitCount, :def) + :inc',
      ExpressionAttributeValues: {
        // ':currentMember': { N: reservationCount.toString() },
        ':def': { N: '0' },
        ':inc': { N: '1' },
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      const result = await jthor.ddb.send(command);
      console.log(result);
      return result;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }
}
