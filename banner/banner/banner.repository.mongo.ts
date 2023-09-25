import { Banner } from './banner.model';
import { ObjectId } from 'mongodb';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/mongodb-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'MONGO', true);

const TABLE_NAME = 'Banner';

export default class BannerRepositoryMongo {
  create(banner: Banner): Promise<Banner> {
    let params: any = {
      TableName: TABLE_NAME,
      SetData: banner,
    };
    return jthor.mongoDBUtil.create(params);
  }

  delete(id: string, bucket: any): Promise<Banner> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorBanner.ERR_110.banner, jthor.resp.ErrorBanner.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.removeItem(params, bucket);
  }

  findById(id: string): Promise<Banner> {
    if (!ObjectId.isValid(id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorBanner.ERR_110.banner, jthor.resp.ErrorBanner.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(id) },
    };
    return jthor.mongoDBUtil.getInfo(params);
  }

  listAll(cursor: string, limit: number, keyword?: string): Promise<any> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { sort: { _id: 1 } },
    };
    return jthor.mongoDBUtil.scanTable(params);
  }

  list(cursor: string, limit: number, keyword?: string): Promise<any> {
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { isShow: 'Y' },
    };
    return jthor.mongoDBUtil.scanPagination(params, cursor, limit);
  }

  update(banner: Banner): Promise<Banner> {
    if (!ObjectId.isValid(banner.id)) {
      return jthor.resp.fail(null, jthor.resp.ErrorBanner.ERR_110.banner, jthor.resp.ErrorBanner.ERR_110.message);
    }
    let params: any = {
      TableName: TABLE_NAME,
      FilterExpression: { _id: new ObjectId(banner.id) },
      SetData: banner,
    };
    return jthor.mongoDBUtil.update(params);
  }
}
