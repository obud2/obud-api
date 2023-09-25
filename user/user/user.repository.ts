import { User, ResponseDTO, GetUserInfoReq, FindIdRequest, UserInfo } from './user.model';

export default interface IUserRepository {
  create(obj: User): Promise<User>;
  update(obj: User): Promise<any>;
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  list(cursor: string, limit: number, keyword?: string, evt?: string): Promise<ResponseDTO>;
  listByRole(query: GetUserInfoReq): Promise<ResponseDTO>;
  listAll(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<User>;
  findByHp(target: string): Promise<any>;
  findIdByHpAndName(obj: FindIdRequest): Promise<any>;
  putVisitCount(): Promise<any>;
  getListByRoleUseStudios(studiosAdminId: string, keyword: any, cursor: any, limit: any): Promise<any>;
}
