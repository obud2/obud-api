import IMyPageRepository from './maPage.repository';
import MyPageRepositoryDdb from './maPage.repository.ddb';
import { GetMyPageReservationList, UserInfo } from './maPage.model';

export default class MyPageService {
  constructor(private myPageRepository: IMyPageRepository = new MyPageRepositoryDdb()) {}

  async getReservationList(query: GetMyPageReservationList, userInfo: UserInfo) {
    const result = await this.myPageRepository.getReservationList(query, userInfo);
    if (result.result.toUpperCase() === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getReservationInfo(id: string, userInfo: UserInfo) {
    const result = (await this.myPageRepository.getReservationInfo(id)).val;
    if (result === undefined) {
      throw new Error('해당 예약이 존재하지 않습니다.');
    }
    const order = (await this.myPageRepository.getOrderInfo(result.orderId)).val;
    result.payInfo = order.payInfo;
    if (result.userInfo.id !== userInfo.id) {
      throw new Error('내 계정의 예약이 아닙니다.');
    }
    return result;
  }
}
