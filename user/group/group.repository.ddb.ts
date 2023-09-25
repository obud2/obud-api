import { Group, ResponseDTO } from './group.model';
import IGroupRepository from './group.repository';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'DDB', true);
const _ = require('lodash');

const TABLE_NAME = 'group';

export default class GroupRepositoryDdb implements IGroupRepository {
  create(obj: Group): Promise<Group> {
    return new Promise<Group>(async resolve => {
      const params = {
        TableName: TABLE_NAME,
        Item: obj,
      };
      const createResult = await jthor.ddbUtil.create(params);
      resolve(createResult);
    });
  }

  update(obj: Group): Promise<Group> {
    return new Promise<Group>(async resolve => {
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { id: obj.id },
        SetData: obj,
      };
      const updateResult = await jthor.ddbUtil.update(updateParams);
      resolve(updateResult);
    });
  }

  delete(id: string, bucket: any): Promise<Group> {
    return new Promise<Group>(async resolve => {
      const params = { TableName: TABLE_NAME, Key: { id: id } };
      const deleteResult = await jthor.ddbUtil.removeItem(params, bucket);
      resolve(deleteResult);
    });
  }

  list(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit, false, '');
  }

  listAll(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit, true, '');
  }

  getList(cursor: string, limit: number, isAll: boolean, keyword: string): Promise<ResponseDTO> {
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
      if (keyword) {
        let prefix = '';
        if (params.FilterExpression) {
          prefix = params.FilterExpression + ' and ';
        }
        params.FilterExpression = prefix + 'contains(#title, :keyword)';
        params.ExpressionAttributeNames['#title'] = 'title';
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

  findById(id: string): Promise<Group> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return jthor.ddbUtil.getInfo(params);
  }

  async findByEmail(email: string): Promise<Group> {
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
    const result = await jthor.ddbUtil.scanTable(params, 'query');
    return result && result.val.length > 0 ? result.val[0] : null;
  }
}
