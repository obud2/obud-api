import { Code, CodeInfoDTO, ResponseDTO } from './code.model';
import ICodeRepository from './code.repository';
import { ObjectId } from 'mongodb';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/mongodb-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'MONGO', true);

const TABLE_NAME = 'Code';

export default class CodeRepositoryMongo implements ICodeRepository {
  async create(code: CodeInfoDTO): Promise<CodeInfoDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      SetData: code,
    };
    return jthor.mongoDBUtil.create(params);
  }
  delete(id: string, bucket: any): Promise<Code> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.removeItem(params, bucket);
  }

  findById(id: string): Promise<Code> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.getInfo(params);
  }

  listAll(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { sort: { _id: 1 } },
    };
    return jthor.mongoDBUtil.scanTable(params);
  }

  list(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { isShow: 'Y' },
    };
    return jthor.mongoDBUtil.scanPagination(params, cursor, limit);
  }

  listByGroup(group: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { isShow: 'Y', group: group },
    };
    return jthor.mongoDBUtil.scanPagination(params, cursor, limit);
  }

  update(code: CodeInfoDTO): Promise<CodeInfoDTO> {
    if (!ObjectId.isValid(code.id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(code.id) },
      SetData: code,
    };
    return jthor.mongoDBUtil.update(params);
  }

  getOrderItemList(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getUserList(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
