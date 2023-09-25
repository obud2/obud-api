import IGroupRepository from './group.repository';
import GroupRepositoryDdb from './group.repository.ddb';
import GroupRepositoryMongo from './group.repository.mongo';
import { Group, GroupDTO, GroupListDTO } from './group.model';
import { randomUUID } from 'crypto';
export default class GroupService {
  groupRepository: IGroupRepository;

  database: string = 'DDB';

  constructor() {
    if (this.database === 'MONGO') {
      this.groupRepository = new GroupRepositoryMongo();
    } else {
      this.groupRepository = new GroupRepositoryDdb();
    }
  }

  async GetList(cursor: string, limit: number, keyword: string) {
    const list = await this.groupRepository.list(cursor, limit, keyword);
    const final: Array<GroupListDTO> = [];
    list.val?.map(item => final.push(new GroupListDTO(item)));
    return { ...list, val: final };
  }

  async GetListAll(cursor: string, limit: number, keyword: string) {
    const list = await this.groupRepository.listAll('', limit, keyword);
    // const final: Array<GroupListDTO> = [];
    // list.val?.map(item => final.push(new GroupListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(id: string) {
    return await this.groupRepository.findById(id);
  }

  async Create(obj: GroupDTO, footprint: any) {
    // const id = this.database === 'MONGO' ? '' : randomUUID();
    const group = new Group(obj, obj.id, footprint);
    return this.groupRepository.create(group);
  }

  async Update(obj: GroupDTO, id: string, footprint: any) {
    const group = new Group(obj, id, footprint);
    return this.groupRepository.update(group);
  }

  async Delete(id: string, bucket: any) {
    return this.groupRepository.delete(id, bucket);
  }
}
