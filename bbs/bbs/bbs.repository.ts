import { Bbs, ResponseDTO } from './bbs.model';

export default interface IBbsRepository {
  create(obj: Bbs): Promise<Bbs>;
  update(obj: Bbs): Promise<Bbs>;
  findById(evt: string, id: string): Promise<any>;
  list(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Bbs>;
}
