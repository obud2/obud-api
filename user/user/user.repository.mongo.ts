import { User, ResponseDTO, GetUserInfoReq } from './user.model';
import IUserRepository from './user.repository';
import { ObjectId } from 'mongodb';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/mongodb-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'MONGO', true);

const TABLE_NAME = 'User';

export default class UserRepositoryMongo {
  create(user: User): Promise<User> {
    let params: any = {
      TableName: TABLE_NAME,
      SetData: user,
    };
    return jthor.mongoDBUtil.create(params);
  }

  delete(id: string, bucket: any): Promise<User> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.removeItem(params, bucket);
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
  listByRole(query: GetUserInfoReq): Promise<ResponseDTO> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { role: query.role },
    };
    return jthor.mongoDBUtil.scanPagination(params, query.cursor, query.limit);
  }

  update(user: User): Promise<User> {
    if (!ObjectId.isValid(user.id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(user.id) },
      SetData: user,
    };
    return jthor.mongoDBUtil.update(params);
  }

  findById(id: string): Promise<User> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.getInfo(params);
  }

  findByEmail(email: string): Promise<User> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { email: email },
    };
    return jthor.mongoDBUtil.getInfo(params);
  }
}
