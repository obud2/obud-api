import { GetMyPageReservationList, UserInfo } from './maPage.model';

export default interface IMyPageRepository {
  getReservationList(query: GetMyPageReservationList, userInfo: UserInfo): Promise<any>;
  getReservationInfo(id: string): Promise<any>;
  getOrderInfo(orderId: any): Promise<any>;
}
