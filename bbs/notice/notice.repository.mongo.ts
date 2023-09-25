import { Notice, ResponseDTO } from './notice.model';
import INoticeRepository from './notice.repository';
import { ObjectId } from 'mongodb';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/mongodb-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'MONGO', true);

const TABLE_NAME = 'notices';

export default class NoticeRepositoryMongo implements INoticeRepository {
  create(notice: Notice): Promise<Notice> {
    let params: any = {
      TableName: TABLE_NAME,
      SetData: notice,
    };
    return jthor.mongoDBUtil.create(params);
  }

  delete(id: string, bucket: any): Promise<Notice> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.removeItem(params, bucket);
  }

  findById(evt: string, id: string): Promise<Notice> {
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

  update(notice: Notice): Promise<Notice> {
    if (!ObjectId.isValid(notice.id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(notice.id) },
      SetData: notice,
    };
    return jthor.mongoDBUtil.update(params);
  }
}
