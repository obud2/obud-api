import { Code, CodeInfoDTO, OrderStatus, ResponseDTO } from './code.model';
import ICodeRepository from './code.repository';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'DDB', true);
const _ = require('lodash');

const TABLE_NAME = 'code';

export default class CodeRepositoryDdb implements ICodeRepository {
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  private readonly INFO_TABLE: string = 'info';
  async getUserList(): Promise<any> {
    const params: any = {
      TableName: this.INFO_TABLE,
      Key: { id: 'visit' },
    };
    return jthor.ddbUtil.getInfo(params);
  }
  async getOrderItemList(status: OrderStatus): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'orderStatus-createdAt-index',
      ScanIndexForward: false,
      KeyConditionExpression: `#key = :value`,
      ProjectionExpression: 'id, amount, orderStatus',
      ExpressionAttributeNames: {
        '#key': 'orderStatus',
      },
      ExpressionAttributeValues: {
        ':value': status,
      },
    };
    return await jthor.ddbUtil.scanPagination(params, 'query');
  }
  async create(obj: CodeInfoDTO): Promise<CodeInfoDTO> {
    const params = {
      TableName: TABLE_NAME,
      Item: obj,
    };
    return await jthor.ddbUtil.create(params);
  }

  async update(obj: CodeInfoDTO): Promise<CodeInfoDTO> {
    const updateParams = {
      TableName: TABLE_NAME,
      Key: { id: obj.id },
      SetData: obj,
    };
    return await jthor.ddbUtil.update(updateParams);
  }

  delete(id: string, bucket: any): Promise<Code> {
    return new Promise<Code>(async resolve => {
      const params = { TableName: TABLE_NAME, Key: { id: id } };
      const deleteResult = await jthor.ddbUtil.removeItem(params, bucket);
      resolve(deleteResult);
    });
  }

  list(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit);
  }

  getList(cursor: string, limit: number): Promise<ResponseDTO> {
    return new Promise<ResponseDTO>(async resolve => {
      let list: Array<any> = [];
      let params: any = {
        TableName: TABLE_NAME,
      };
      list = await jthor.ddbUtil.scanTable(params, 'scan');

      // @ts-ignore
      resolve(list);
    });
  }

  listByGroup(group: string, cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return new Promise<ResponseDTO>(async resolve => {
      let list: Array<any> = [];
      let params: any = {
        TableName: TABLE_NAME,
        FilterExpression: '#group = :group',
        ExpressionAttributeNames: {
          '#group': 'group',
        },
        ExpressionAttributeValues: {
          ':group': group,
        },
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
      list = await jthor.ddbUtil.scanPagination(params, 'query', cursor, limit);

      // @ts-ignore
      resolve(list);
    });
  }

  findById(id: string): Promise<Code> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return jthor.ddbUtil.getInfo(params);
  }
}
