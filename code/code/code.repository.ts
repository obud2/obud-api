import { Code, CodeInfoDTO, OrderStatus, ResponseDTO } from './code.model';

export default interface ICodeRepository {
  create(obj: CodeInfoDTO): Promise<CodeInfoDTO>;
  update(obj: CodeInfoDTO): Promise<CodeInfoDTO>;
  findById(id: string): Promise<any>;
  list(cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  listByGroup(group: string, cursor: string, limit: number, keyword?: string): Promise<ResponseDTO>;
  delete(id: string, bucket: any): Promise<Code>;
  getOrderItemList(status: OrderStatus): Promise<any>;
  getUserList(): Promise<any>;
}
