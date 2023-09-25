import { Group, ResponseDTO } from './group.model';

export default interface IGroupRepository {
  create(obj: Group): Promise<Group>;
  update(obj: Group): Promise<Group>;
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  list(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listAll(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Group>;
}
