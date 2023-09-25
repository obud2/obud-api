import IUserRepository from './info.repository';
import InfoRepositoryDdb from './info.repository.ddb';
import InfoRepositoryMongo from './info.repository.mongo';
import {Info, InfoDTO, InfoListDTO, InfoReqBody, InfoReqDTO} from './info.model';
import { randomUUID } from 'crypto';
export default class InfoService {
  infoRepository: IUserRepository;

  database: string = 'DDB';

  constructor() {
    if (this.database === 'MONGO') {
      this.infoRepository = new InfoRepositoryMongo();
    } else {
      this.infoRepository = new InfoRepositoryDdb();
    }
  }

  async GetList(cursor: string, limit: number, keyword: string) {
    const list = await this.infoRepository.list(cursor, limit, keyword);
    const final: Array<InfoListDTO> = [];
    list.val?.map(item => final.push(new InfoListDTO(item)));
    return { ...list, val: final };
  }

  async GetListAll(cursor: string, limit: number, keyword: string) {
    const list = await this.infoRepository.listAll('', limit, keyword);
    // const final: Array<InfoListDTO> = [];
    // list.val?.map(item => final.push(new InfoListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(id: string) {
    return await this.infoRepository.findById(id);
  }

  async Create(obj: InfoReqBody, footprint: any) {
    const id = this.database === 'MONGO' ? '' : obj.id;
    // const info = new Info(obj, id, footprint);
    return this.infoRepository.create(obj);
  }

  async Update(obj: InfoReqDTO, footprint: any) {
    const info = new InfoReqBody(obj, footprint);
    return this.infoRepository.update(info);
  }

  async Delete(id: string, bucket: any) {
    return this.infoRepository.delete(id, bucket);
  }
}
