import { S3Client } from '@aws-sdk/client-s3';
import { Contact, ContactReqBody, ResponseDTO } from './contact.model';
import IContactRepository from './contact.repository';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'DDB', true);
const _ = require('lodash');

const TABLE_NAME = 'contact';

export default class ContactRepositoryDdb implements IContactRepository {
  constructor(
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) { }

  create(obj: ContactReqBody): Promise<ContactReqBody> {
    return new Promise<ContactReqBody>(async resolve => {
      const params = {
        TableName: TABLE_NAME,
        Item: obj,
      };
      const createResult = await jthor.ddbUtil.create(params);
      resolve(createResult);
    });
  }

  update(obj: ContactReqBody): Promise<ContactReqBody> {
    return new Promise<ContactReqBody>(async resolve => {
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { id: obj.id },
        SetData: obj,
      };
      const updateResult = await jthor.ddbUtil.update(updateParams);
      resolve(updateResult);
    });
  }

  delete(id: string, bucket: any): Promise<Contact> {
    return new Promise<Contact>(async resolve => {
      const params = { TableName: TABLE_NAME, Key: { id: id } };
      const deleteResult = await jthor.ddbUtil.removeItem(params, bucket);
      resolve(deleteResult);
    });
  }

  list(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit, '');
  }

  listAll(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
    return this.getList(cursor, limit, '');
  }

  getList(cursor: string, limit: number, keyword: string): Promise<ResponseDTO> {
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
        params.FilterExpression = prefix + 'contains(#type, :keyword)';
        params.ExpressionAttributeNames['#type'] = 'type';
        params.ExpressionAttributeValues[':keyword'] = keyword;
      }
      const countParam = _.cloneDeep(params);
      countParam.Select = 'COUNT';
      const total = await jthor.ddbUtil.scanTable(countParam, 'query');
      // if (isAll) {
      //   let allParams: any = {
      //     TableName: TABLE_NAME,
      //   };
      //   list = await jthor.ddbUtil.scanTable(allParams, 'scan');
      // } else {
      //   list = await jthor.ddbUtil.scanPagination(params, 'query', cursor, limit);
      // }

      list = await jthor.ddbUtil.scanPagination(params, 'query', cursor, limit);
      // @ts-ignore
      resolve(list);
    });
  }

  findById(id: string): Promise<Contact> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return jthor.ddbUtil.getInfo(params);
  }
}
