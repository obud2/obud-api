import IUserRepository from './contact.repository';
import { Contact, ContactReqBody, ContactReqDTO } from './contact.model';
import { randomUUID } from 'crypto';
import ContactRepositoryDdb from './contact.repository.ddb';

export default class ContactService {
  contactRepository: IUserRepository;

  database: string = 'DDB';

  constructor() {
    this.contactRepository = new ContactRepositoryDdb();
  }

  async GetList(cursor: string, limit: number, keyword: string) {
    return await this.contactRepository.list(cursor, limit, keyword);
  }

  async GetListAll(cursor: string, limit: number, keyword: string) {
    const list = await this.contactRepository.listAll('', limit, keyword);
    // const final: Array<FaqListDTO> = [];
    // list.val?.map(item => final.push(new FaqListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(id: string) {
    return await this.contactRepository.findById(id);
  }

  async Create(obj: ContactReqBody, footpint: any) {
    const id = this.database === 'MONGO' ? '' : randomUUID();
    const contact = new Contact(obj, id, footpint);
    contact.setCreated(footpint);
    return this.contactRepository.create(contact);
  }

  async Update(obj: ContactReqDTO, footpint: any) {
    const contact = new Contact(obj.body, obj.body.id, obj.body);
    contact.setUpdated(footpint);
    return this.contactRepository.update(contact);
  }

  async Delete(id: string, bucket: any) {
    return this.contactRepository.delete(id, bucket);
  }
}
