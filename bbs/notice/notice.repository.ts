import { Notice, ResponseDTO } from './notice.model';

export default interface INoticeRepository {
  create(obj: Notice): Promise<Notice>;
  update(obj: Notice): Promise<Notice>;
  findById(evt: string, id: string): Promise<any>;
  list(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Notice>;
}
