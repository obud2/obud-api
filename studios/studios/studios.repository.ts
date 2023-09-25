import { StudiosSortData, Studios, StudiosDTO, StudiosShort, Refund } from './studios.model';
import { GetListRequestDTO, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { UserInfo } from '../order/order.model';

export default interface IStudiosRepository {
  create(dto: Studios): Promise<any>;
  list(query: GetListRequestDTO): Promise<ResponseDTO<any>>;
  listAll(query: GetListRequestDTO): Promise<Promise<any>>;
  findById(id: string): Promise<ResponseSingleDTO<any>>;
  update(dto: Studios): Promise<any>;
  delete(id: string, bucket: string | string[] | undefined): Promise<any>;
  findSortList(id: any, max: number, min: number): Promise<Array<StudiosSortData>>;
  sorting(data: StudiosSortData): Promise<any>;
  getLastSortOrder(): Promise<number | undefined>;
  copyS3File(image: any, uuid: string): Promise<any>;
  findByIdResTitle(studiosId: string): Promise<any>;
  findByIdInfo(studiosId: string): Promise<StudiosShort>;
  findWishById(id: string, userId: string): Promise<any>;
  createRefund(refund: Refund): Promise<any>;
  findRefundByStudiosId(studiosId: string): Promise<any>;
  deleteRefund(id: string): Promise<any>;
  getListByUserId(query: GetListRequestDTO, userInfo: UserInfo): Promise<any>;
  findCartByStudiosId(id: string): Promise<any>;
  updateCartByStudiosId(id: string, title: string): Promise<any>;
  findOrderItemByStudiosId(id: string): Promise<any>;
  updateOrderItemByStudiosId(id: string, title: string): Promise<any>;
  getStudiosListByUserId(userInfo: UserInfo): Promise<any>;
  findByIdGetAddr(studiosId: string): Promise<any>;
  findByIdForStudiosList(studiosId: string): Promise<any>;
}
