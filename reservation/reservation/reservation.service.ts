import IReservationRepository from './reservation.repository';
import ReservationRepositoryDdb from './reservation.repository.ddb';
import { GetReservationList, OrderItem, OrderStatus, StudiosShort, UserInfo } from './reservation.model';
import axios from 'axios';

export default class ReservationService {
  constructor(private readonly reservationRepository: IReservationRepository = new ReservationRepositoryDdb()) {}

  async getReservationList(query: GetReservationList) {
    const result = await this.reservationRepository.getReservationList(query);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }

  async getReservationListForStudios(query: GetReservationList, userInfo: UserInfo) {
    const existStudiosList = await this.reservationRepository.getStudiosListByUserId(userInfo);
    const studiosList: string[] = existStudiosList.val.map((item: any) => item.id);
    const result = await this.reservationRepository.getReservationListByStudiosAdmin(query, studiosList);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }

  async getOldReservationList(query: GetReservationList) {
    const result = await this.reservationRepository.getOldReservationList(query);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }
  async getOldReservationListForStudios(query: GetReservationList, userInfo: UserInfo) {
    const existStudiosList = await this.reservationRepository.getStudiosListByUserId(userInfo);
    const studiosList: string[] = existStudiosList.val.map((item: any) => item.id);
    const result = await this.reservationRepository.getOldReservationListByStudiosAdmin(query, studiosList);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }

  async getCancelList(query: GetReservationList) {
    const result = await this.reservationRepository.getCancelList(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getCancelingList(query: GetReservationList) {
    const result = await this.reservationRepository.getCancelingList(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getRefusalList(query: GetReservationList) {
    const result = await this.reservationRepository.getRefusalList(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getCancelListForStudios(query: GetReservationList, userInfo: UserInfo) {
    const studiosList = await this.getUserStudiosList(userInfo);
    const result = await this.reservationRepository.getCancelListByStudiosAdmin(query, studiosList);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }

  async getCancelingListForStudios(query: GetReservationList, userInfo: UserInfo) {
    const studiosList = await this.getUserStudiosList(userInfo);
    const result = await this.reservationRepository.getCancelingListByStudiosAdmin(query, studiosList);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }

  async getRefusalListForStudios(query: GetReservationList, userInfo: UserInfo) {
    const studiosList = await this.getUserStudiosList(userInfo);
    const result = await this.reservationRepository.getRefusalListByStudiosAdmin(query, studiosList);
    if (result.result === 'FAIL') {
      throw new Error(result);
    }
    return result;
  }

  private async getUserStudiosList(userInfo: UserInfo) {
    const existStudiosList = await this.reservationRepository.getStudiosListByUserId(userInfo);
    const studiosList: string[] = existStudiosList.val.map((item: any) => item.id);
    return studiosList;
  }

  async updateOrderItemCancel(orderItemId: string, userInfo: UserInfo) {
    const existOrderItem: OrderItem = await this.reservationRepository.findOrderItemById(orderItemId);
    if (userInfo.id !== existOrderItem.userInfo.id) {
      throw new Error('해당 계정의 예약이 아닙니다.');
    }
    if (existOrderItem.orderStatus === OrderStatus.CANCELING) {
      throw new Error('이미 결제취소 요청을 한 예약입니다.');
    }
    if (existOrderItem.orderStatus !== OrderStatus.COMPLETE) {
      throw new Error('결제가 완료된 예약이 아닙니다.');
    }
    const nowDate: Date = await this.getNow();
    const startDate: Date = new Date(existOrderItem.startDate);
    if (startDate < nowDate) {
      throw new Error('취소가능시간이 지난상태입니다.');
    }
    const resvDate: Date = new Date(existOrderItem.startDate.substring(0, 10));
    // 1일 기준날짜
    const dayMillis: number = 24 * 60 * 60 * 1000;
    const standardDay: number = Math.ceil((resvDate.getTime() - nowDate.getTime()) / dayMillis);
    let percent: number = 100;

    const refundList = (await this.reservationRepository.getRefundListByStudiosId(existOrderItem.studiosId)).val;
    const refundLength: number = refundList.length - 1;
    for await (const [index, refund] of refundList.entries()) {
      if (refund.day <= standardDay) {
        percent = refund.percent;
        break;
      }
      if (index === refundLength) {
        throw new Error('환불이 가능한 기간이 지났습니다.');
      }
    }
    const cancelAmount: number = existOrderItem.amount * (percent / 100);

    //알림톡
    await this.sendOrderCancelingMsg(existOrderItem);
    //알림톡

    return await this.reservationRepository.updateOrderItemStatus(
      orderItemId,
      nowDate.toISOString().substring(0, 19),
      OrderStatus.CANCELING,
      cancelAmount,
    );
  }

  async OrderCancelCheck(orderItemId: string, userInfo: UserInfo) {
    const existOrderItem: OrderItem = await this.reservationRepository.findOrderItemById(orderItemId);
    if (userInfo.id !== existOrderItem.userInfo.id) {
      throw new Error('해당 계정의 예약이 아닙니다.');
    }
    if (existOrderItem.orderStatus === OrderStatus.CANCELING) {
      throw new Error('이미 결제취소 요청을 한 예약입니다.');
    }
    if (existOrderItem.orderStatus !== OrderStatus.COMPLETE) {
      throw new Error('결제가 완료된 예약이 아닙니다.');
    }
    const nowDate: Date = await this.getNow();
    const startDate: Date = new Date(existOrderItem.startDate);
    if (startDate < nowDate) {
      throw new Error('취소가능시간이 지난상태입니다.');
    }
    const resvDate: Date = new Date(existOrderItem.startDate.substring(0, 10));
    // 1일 기준날짜
    const dayMillis: number = 24 * 60 * 60 * 1000;
    const standardDay: number = Math.ceil((resvDate.getTime() - nowDate.getTime()) / dayMillis);
    let percent: number = 100;

    const refundList = (await this.reservationRepository.getRefundListByStudiosId(existOrderItem.studiosId)).val;
    const refundLength: number = refundList.length - 1;
    for await (const [index, refund] of refundList.entries()) {
      if (refund.day <= standardDay) {
        percent = refund.percent;
        break;
      }
      if (index === refundLength) {
        percent = 0;
      }
    }
    const cancelAmount: number = existOrderItem.amount * (percent / 100);
    existOrderItem.cancelAmount = cancelAmount;
    const existStudios: StudiosShort = await this.reservationRepository.findStudiosByIdInfo(existOrderItem.studiosId);
    (existOrderItem as any).refundPolicy = existStudios.refundPolicy;
    return existOrderItem;
  }

  private async getNow(): Promise<Date> {
    const dateForm: Date = new Date();
    dateForm.setHours(dateForm.getHours() + 9);
    return dateForm;
  }

  private async sendOrderCancelingMsg(orderItem: OrderItem) {
    const plan: any = (await this.reservationRepository.findPlanById(orderItem.planId)).val;
    const lesson: any = (await this.reservationRepository.findLessonById(plan.lessonId)).val;
    const studios: any = (await this.reservationRepository.findStudiosById(lesson.studiosId)).val;
    const user: any = (await this.reservationRepository.findUser(orderItem.createdID)).val;
    await this.sendOrderCancelingMsgUser(orderItem, lesson, plan, user);
    await this.sendOrderCancelingMsgStudios(orderItem, studios, lesson, plan, user);
  }

  private async sendOrderCancelingMsgStudios(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const admin: any = (await this.reservationRepository.findUser(studios.createdID)).val;
    if (admin.group !== 'GR0110') {
      return;
    }
    const msg: string = `#{이름}님 주문 취소 요청하였습니다.

- 상품명 : #{VAR1}
- 예약일: #{VAR2}
- 인원: #{VAR3}
- 주문번호 : #{VAR4}
- 주문금액 : #{VAR5}

감사합니다.`;
    const param = {
      service: 2310085547,
      message: msg,
      numbers: [
        {
          key: 1,
          hp: admin.hp,
          name: user.name,
          VAR1: `[${studios.title}]${lesson.title}`,
          VAR2: this.getTimeSet(plan.startDate),
          VAR3: orderItem.reservationCount,
          VAR4: orderItem.orderId,
          VAR5: orderItem.amount.toLocaleString('ko-KR') + '원',
        },
      ],
      template: 10035,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private async sendOrderCancelingMsgUser(orderItem: OrderItem, lesson: any, plan: any, user: any) {
    const msg: string = `#{이름}님 취소 요청이 접수되었습니다.

- 상품명 : #{VAR1}
- 주문번호 : #{VAR2}

감사합니다.`;
    const param = {
      service: 2310085547,
      message: msg,
      numbers: [
        {
          key: 1,
          hp: orderItem.reservationerHp,
          name: user.name,
          VAR1: lesson.title,
          VAR2: this.getTimeSet(plan.startDate),
        },
      ],
      template: 10030,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private getTimeSet(startDate: string): string {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(startDate);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours < 12 ? '오전' : '오후';
    const hours12 = hours % 12 || 12;

    return `${year}년 ${month}월 ${day}일 (${dayOfWeek}) ${period} ${hours12}시 ${minutes}분`;
  }

  private async axiosSend(param: any) {
    const headers = {
      groupid: 'G1000000007',
      apikey: 'b3e06d45-35a4-4d31-ad41-4feab973d050',
    };
    await axios.post('https://api.alltalk.co.kr/alimTalk/', param, { headers });
  }
}
