import { Bbs, ResponseDTO } from './bbs.model';
import IBbsRepository from './bbs.repository';
import { ObjectId } from 'mongodb';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/mongodb-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'MONGO', true);

const TABLE_NAME = 'bbs';

export default class BbsRepositoryMongo implements IBbsRepository {
  create(bbs: Bbs): Promise<Bbs> {
    let params: any = {
      TableName: TABLE_NAME,
      SetData: bbs,
    };
    return jthor.mongoDBUtil.create(params);
  }

  delete(id: string, bucket: any): Promise<Bbs> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.removeItem(params, bucket);
  }

  findById(evt: string, id: string): Promise<Bbs> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.getInfo(params);
  }

  listAll(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { sort: { _id: 1 } },
    };
    return jthor.mongoDBUtil.scanTable(params);
  }

  list(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { isShow: 'Y' },
    };
    return jthor.mongoDBUtil.scanPagination(params, cursor, limit);
  }

  update(bbs: Bbs): Promise<Bbs> {
    if (!ObjectId.isValid(bbs.id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(bbs.id) },
      SetData: bbs,
    };
    return jthor.mongoDBUtil.update(params);
  }
}
