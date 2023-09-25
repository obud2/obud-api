import { Contact, ContactReqBody, ResponseDTO } from './contact.model';

export default interface IContactRepository {
  create(obj: ContactReqBody): Promise<ContactReqBody>;
  update(obj: Contact): Promise<Contact>;
  findById(id: string): Promise<any>;
  list(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Contact>;
}
