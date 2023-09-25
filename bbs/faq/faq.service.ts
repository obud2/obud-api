import IUserRepository from './faq.repository';
import FaqRepositoryDdb from './faq.repository.ddb';
import FaqRepositoryMongo from './faq.repository.mongo';
import { Faq, FaqDTO, FaqListDTO } from './faq.model';
import { randomUUID } from 'crypto';
export default class FaqService {
  faqRepository: IUserRepository;

  database: string = 'DDB';

  constructor() {
    if (this.database === 'MONGO') {
      this.faqRepository = new FaqRepositoryMongo();
    } else {
      this.faqRepository = new FaqRepositoryDdb();
    }
  }

  async GetList(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.faqRepository.list(evt, cursor, limit, keyword);
    const final: Array<FaqListDTO> = [];
    list.val?.map(item => final.push(new FaqListDTO(item)));
    return { ...list, val: final };
  }

  async GetListAll(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.faqRepository.listAll(evt, '', limit, keyword);
    // const final: Array<FaqListDTO> = [];
    // list.val?.map(item => final.push(new FaqListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(evt: string, id: string) {
    return await this.faqRepository.findById(evt, id);
  }

  async Create(obj: FaqDTO, footprint: any) {
    const id = this.database === 'MONGO' ? '' : randomUUID();
    const faq = new Faq(obj, id, footprint);
    return this.faqRepository.create(faq);
  }

  async Update(obj: FaqDTO, id: string, footprint: any) {
    const faq = new Faq(obj, id, footprint);
    return this.faqRepository.update(faq);
  }

  async Delete(id: string, bucket: any) {
    return this.faqRepository.delete(id, bucket);
  }
}
