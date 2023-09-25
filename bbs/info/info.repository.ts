import {Info, InfoReqBody, ResponseDTO} from './info.model';

export default interface IInfoRepository {
  create(obj: InfoReqBody): Promise<InfoReqBody>;
  update(obj: InfoReqBody): Promise<InfoReqBody>;
  findById(id: string): Promise<any>;
  list(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Info>;
}
