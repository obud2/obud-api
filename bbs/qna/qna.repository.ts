import { QnA, ResponseDTO } from './qna.model';

export default interface IQnARepository {
  create(obj: QnA): Promise<QnA>;
  update(obj: QnA): Promise<QnA>;
  findById(evt: string, id: string): Promise<any>;
  list(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<QnA>;
}
