import IUserRepository from './bbs.repository';
import BbsRepositoryDdb from './bbs.repository.ddb';
import BbsRepositoryMongo from './bbs.repository.mongo';
import { Bbs, BbsDTO, BbsListDTO } from './bbs.model';
import { randomUUID } from 'crypto';
export default class BbsService {
  bbsRepository: IUserRepository;

  database: string = 'DDB';

  constructor() {
    if (this.database === 'MONGO') {
      this.bbsRepository = new BbsRepositoryMongo();
    } else {
      this.bbsRepository = new BbsRepositoryDdb();
    }
  }

  async GetList(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.bbsRepository.list(evt, cursor, limit, keyword);
    const final: Array<BbsListDTO> = [];
    list.val?.map(item => final.push(new BbsListDTO(item)));
    return { ...list, val: final };
  }

  async GetListAll(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.bbsRepository.listAll(evt, '', limit, keyword);
    // const final: Array<BbsListDTO> = [];
    // list.val?.map(item => final.push(new BbsListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(evt: string, id: string) {
    return await this.bbsRepository.findById(evt, id);
  }

  async Create(obj: BbsDTO, footprint: any) {
    const id = this.database === 'MONGO' ? '' : randomUUID();
    const bbs = new Bbs(obj, id, footprint);
    return this.bbsRepository.create(bbs);
  }

  async Update(obj: BbsDTO, id: string, footprint: any) {
    const bbs = new Bbs(obj, id, footprint);
    return this.bbsRepository.update(bbs);
  }

  async Delete(id: string, bucket: any) {
    return this.bbsRepository.delete(id, bucket);
  }
}
