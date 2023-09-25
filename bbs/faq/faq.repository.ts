import { Faq, ResponseDTO } from './faq.model';

export default interface IFaqRepository {
  create(obj: Faq): Promise<Faq>;
  update(obj: Faq): Promise<Faq>;
  findById(evt: string, id: string): Promise<any>;
  list(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(evt: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Faq>;
}
