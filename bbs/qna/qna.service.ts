import IUserRepository from './qna.repository';
import QnARepositoryDdb from './qna.repository.ddb';
import QnARepositoryMongo from './qna.repository.mongo';
import { QnA, QnADTO, QnAListDTO } from './qna.model';
import { randomUUID } from 'crypto';
export default class QnAService {
  qnaRepository: IUserRepository;

  database: string = 'DDB';

  constructor() {
    if (this.database === 'MONGO') {
      this.qnaRepository = new QnARepositoryMongo();
    } else {
      this.qnaRepository = new QnARepositoryDdb();
    }
  }

  async GetList(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.qnaRepository.list(evt, cursor, limit, keyword);
    const final: Array<QnAListDTO> = [];
    list.val?.map(item => final.push(new QnAListDTO(item)));
    return { ...list, val: final };
  }

  async GetListAll(evt: string, cursor: string, limit: number, keyword: string) {
    const list = await this.qnaRepository.listAll(evt, '', limit, keyword);
    // const final: Array<QnAListDTO> = [];
    // list.val?.map(item => final.push(new QnAListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(evt: string, id: string) {
    return await this.qnaRepository.findById(evt, id);
  }

  async Create(obj: QnADTO, footprint: any) {
    const id = this.database === 'MONGO' ? '' : randomUUID();
    const qna = new QnA(obj, id, footprint);
    return this.qnaRepository.create(qna);
  }

  async Update(obj: QnADTO, id: string, footprint: any) {
    const qna = new QnA(obj, id, footprint);
    return this.qnaRepository.update(qna);
  }

  async Delete(id: string, bucket: any) {
    return this.qnaRepository.delete(id, bucket);
  }
}
