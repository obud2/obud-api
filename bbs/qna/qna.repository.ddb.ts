import { QnA, ResponseDTO } from './qna.model';
import IQnARepository from './qna.repository';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'DDB', true);
const _ = require('lodash');

const TABLE_NAME = 'qna';

export default class QnARepositoryDdb implements IQnARepository {
  create(obj: QnA): Promise<QnA> {
    return new Promise<QnA>(async resolve => {
      const params = {
        TableName: TABLE_NAME,
        Item: obj,
      };
      console.log(params);
      const createResult = await jthor.ddbUtil.create(params);
      resolve(createResult);
    });
  }

  update(obj: QnA): Promise<QnA> {
    return new Promise<QnA>(async resolve => {
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { evt: obj.evt, id: obj.id },
        SetData: obj,
      };
      const updateResult = await jthor.ddbUtil.update(updateParams);
      resolve(updateResult);
    });
  }

  delete(id: string, bucket: any): Promise<QnA> {
    return new Promise<QnA>(async resolve => {
      const params = { TableName: TABLE_NAME, Key: { id: id } };
      const deleteResult = await jthor.ddbUtil.removeItem(params, bucket);
      resolve(deleteResult);
    });
  }

  list(evt: string, cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(evt, cursor, limit, false, '');
  }

  listAll(evt: string, cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(evt, cursor, limit, true, '');
  }

  getList(evt: string, cursor: string, limit: number, isAll: boolean, keyword: string): Promise<ResponseDTO> {
    return new Promise<ResponseDTO>(async resolve => {
      let list: Array<any> = [];
      let params: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#key = :value',
        ExpressionAttributeValues: { ':value': evt },
        ExpressionAttributeNames: { '#key': 'evt' },
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
        let allParams: any = {
          TableName: TABLE_NAME,
        };
        list = await jthor.ddbUtil.scanTable(allParams, 'scan');
      } else {
        list = await jthor.ddbUtil.scanPagination(params, 'query', cursor, limit);
      }

      // @ts-ignore
      resolve(list);
    });
  }

  findById(evt: string, id: string): Promise<QnA> {
    const params = { TableName: TABLE_NAME, Key: { evt: evt, id: id } };
    return jthor.ddbUtil.getInfo(params);
  }
}
