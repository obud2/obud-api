import IUserRepository from './notice.repository';
import NoticeRepositoryDdb from './notice.repository.ddb';
import NoticeRepositoryMongo from './notice.repository.mongo';
import { Notice, NoticeDTO, NoticeListDTO } from './notice.model';
import { randomUUID } from 'crypto';
export default class NoticeService {
  noticeRepository: IUserRepository;

  database: string = 'DDB';

  constructor() {
    if (this.database === 'MONGO') {
      this.noticeRepository = new NoticeRepositoryMongo();
    } else {
      this.noticeRepository = new NoticeRepositoryDdb();
    }
  }

  async GetList(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.noticeRepository.list(evt, cursor, limit, keyword);
    const final: Array<NoticeListDTO> = [];
    list.val?.map(item => final.push(new NoticeListDTO(item)));
    return { ...list, val: final };
  }

  async GetListAll(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.noticeRepository.listAll(evt, '', limit, keyword);
    // const final: Array<NoticeListDTO> = [];
    // list.val?.map(item => final.push(new NoticeListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(evt: string, id: string) {
    return await this.noticeRepository.findById(evt, id);
  }

  async Create(obj: NoticeDTO, footprint: any) {
    const id = this.database === 'MONGO' ? '' : randomUUID();
    const notice = new Notice(obj, id, footprint);
    return this.noticeRepository.create(notice);
  }

  async Update(obj: NoticeDTO, id: string, footprint: any) {
    const notice = new Notice(obj, id, footprint);
    return this.noticeRepository.update(notice);
  }

  async Delete(id: string, bucket: any) {
    return this.noticeRepository.delete(id, bucket);
  }
}
