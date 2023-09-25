import IOrderRepository from './order.repository';
import OrderRepositoryDdb from './order.repository.ddb';
import { CancelDTO, CompleteDTO, Order, OrderCancelDTO, OrderItem, OrderItemDTO, OrderStatus, UserInfo } from './order.model';
import { Request } from 'express';
import IPlanRepository from '../plan/plan.repository';
import PlanRepositoryDdb from '../plan/plan.repository.ddb';
import ILessonRepository from '../lesson/lesson.repository';
import LessonRepositoryDdb from '../lesson/lesson.repository.ddb';
import IStudiosRepository from '../studios/studios.repository';
import StudiosRepositoryDdb from '../studios/studios.repository.ddb';
import { Plan } from '../plan/plan.model';
import { LessonShort } from '../lesson/lesson.model';
import { StudiosShort } from '../studios/studios.model';
import { FootPrint } from '../dto/request/RequestDTO';
import axios from 'axios';

export default class OrderService {
  private readonly IamportKey: string = '1476195770197520';
  private readonly IamportSecret: string = 'Id6g5kUhNETWErEoxMmkhCm9b2TFbo8TCfaHA4YnJSkojYMQL9a3LwcWz5CKtLE61ONBTMZCFj1YiNP4';

  constructor(
    private readonly orderRepository: IOrderRepository = new OrderRepositoryDdb(),
    private readonly planRepository: IPlanRepository = new PlanRepositoryDdb(),
    private readonly lessonRepository: ILessonRepository = new LessonRepositoryDdb(),
    private readonly studiosRepository: IStudiosRepository = new StudiosRepositoryDdb(),
  ) {}

  async create(req: Request, userInfo: UserInfo, footPrint: FootPrint) {
    try {
      const orderId: string = await this.orderRepository.idGenFotOrder();
      const orderItemList: OrderItem[] = await this.dtoToOrderItemList(req.body.orders, userInfo, footPrint, orderId);
      const order: Order = new Order(footPrint, orderId, OrderStatus.WAIT, orderItemList, {}, userInfo);
      const orderCreate = await this.orderRepository.createOrder(order);
      const orderItemsCreate = [];
      for await (const item of orderItemList) {
        const orderItemCreateResult = await this.orderRepository.createOrderItem(item);
        orderItemsCreate.push(orderItemCreateResult);
      }
      orderCreate.orderItems = orderItemsCreate;
      return orderCreate;
    } catch (e: any) {
      throw e;
    }
  }

  async complete(keys: CompleteDTO, footPrint: FootPrint) {
    let existOrderItems: any;
    let order: Order;
    let paymentData: any;
    try {
      const accessToken: string = await this.getAccessToken();
      console.log('access_token :: ', accessToken);
      paymentData = await this.getPaymentData(keys, accessToken);
      console.log('결제정보 조회 결과 :: ', paymentData);
      const existOrder = (await this.orderRepository.findOrderById(keys.merchant_uid)).val;
      if (existOrder === undefined) {
        const cancelDTO: CancelDTO = CancelDTO.completeToCancel(keys, paymentData.amount);
        await this.payCancel(cancelDTO, footPrint);
        throw new Error('ORDER :: 해당 order 가 존재하지 않습니다.');
      }
      order = await Order.createOrder(existOrder, paymentData);
      order.orderStatus = OrderStatus.COMPLETE;
      order.setUpdated(footPrint);
      if (paymentData.amount !== existOrder.amount) {
        const cancelDTO: CancelDTO = CancelDTO.completeToCancel(keys, paymentData.amount);
        await this.payCancel(cancelDTO, footPrint);
        throw new Error('결제된 금액과 결제해야할 금액이 일치하지 않습니다.');
      }
      existOrderItems = (await this.orderRepository.findOrderItemByOrderId(order.id)).val;
      if (existOrderItems === undefined) {
        const cancelDTO: CancelDTO = CancelDTO.completeToCancel(keys, paymentData.amount);
        await this.payCancel(cancelDTO, footPrint);
        return new Error(`merchant_uid :: ${keys.merchant_uid} 주문의 상품정보가 존재하지 않습니다.`);
      }
      for await (const item of existOrderItems) {
        const orderItemDTO: OrderItemDTO = new OrderItemDTO(item, item.userInfo);
        const existPlan: Plan = (await this.planRepository.findById(item.planId)).val;
        orderItemDTO.validPlanInfo(existPlan);
      }
    } catch (e: any) {
      const cancelDTO: CancelDTO = CancelDTO.completeToCancel(keys, paymentData.amount);
      await this.payCancel(cancelDTO, footPrint);
      throw e;
    }
    try {
      const orderItems: OrderItem[] = [];
      for await (const item of existOrderItems) {
        const orderItem: OrderItem = await OrderItem.createOrderItem(item);
        orderItem.setUpdated(footPrint);
        orderItem.orderStatus = OrderStatus.COMPLETE;
        //알림톡
        await this.sendOrderCompleteMsg(orderItem);
        //알림톡
        const orderItemResult = await this.orderRepository.updateOrderItem(orderItem);
        orderItems.push(orderItemResult);
        if (orderItem?.payOptionCount > 0) {
          await this.planRepository.putCurrentMemberAndOption(orderItem.planId, orderItem.reservationCount, orderItem.payOptionCount);
        } else {
          await this.planRepository.putCurrentMember(orderItem.planId, orderItem.reservationCount);
        }
      }
      const orderUpdateResult = await this.orderRepository.updateOrder(order);
      orderUpdateResult.orderItems = orderItems;
      return orderUpdateResult;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  async payFail(keys: CompleteDTO, footPrint: FootPrint) {
    const existOrder = (await this.orderRepository.findOrderById(keys.merchant_uid)).val;
    if (existOrder === undefined) {
      return new Error('ORDER :: 해당 order 가 존재하지 않습니다.');
    }
    const order: Order = await Order.createOrder(existOrder, keys.payInfo);
    order.orderStatus = OrderStatus.FAIL;
    order.setUpdated(footPrint);
    const orderUpdateResult = await this.orderRepository.updateOrder(order);
    return orderUpdateResult;
  }

  async payCancel(keys: CancelDTO, footPrint: FootPrint) {
    const accessToken: string = await this.getAccessToken();
    console.log('access_token :: ', accessToken);

    const existOrder = (await this.orderRepository.findOrderById(keys.merchant_uid)).val;
    if (existOrder === undefined) {
      return new Error('ORDER :: 해당 order 가 존재하지 않습니다.');
    }

    // TODO 부분취소시 수정해야 함
    const cancelResult = await this.doPaymentCancel(accessToken, keys.imp_uid, keys.cancelAmount, keys.cancelAmount);

    const order: Order = await Order.createOrder(existOrder, {});
    order.orderStatus = OrderStatus.FAIL;
    order.cancelAmount = order.amount;
    order.cancelInfo = cancelResult;
    order.setUpdated(footPrint);
    const orderUpdateResult = await this.orderRepository.updateOrder(order);
    return orderUpdateResult;
  }

  async orderCancel(query: OrderCancelDTO) {
    const existOrderItem: OrderItem = await this.orderRepository.findOrderItemById(query.orderItemId);
    if (existOrderItem.amount < query.cancelAmount) {
      throw new Error('환불 금액이 결제 금액보다 큽니다.');
    }
    if (existOrderItem.orderStatus === OrderStatus.CANCEL) {
      throw new Error('이미 취소된 예약입니다.');
    }
    if (existOrderItem.orderStatus === OrderStatus.FAIL) {
      throw new Error('결제가 실패한 예약입니다.');
    }
    if (existOrderItem.orderStatus === OrderStatus.WAIT) {
      throw new Error('결제 대기중인 예약입니다.');
    }
    // 예약이 완료된 상품이라서 Plan 테이블에 currentMember 에 인원수만큼 제거하고 status 가
    // maxMember 보다 currentMember 가 클경우 status 를 impossible 에서 possible 로 변경해줘야함
    await this.planRepository.putCancelCurrentMember(existOrderItem);
    existOrderItem.cancelAmount = query.cancelAmount;
    existOrderItem.orderStatus = OrderStatus.CANCEL;

    //알림톡
    await this.sendOrderCancelMsg(existOrderItem);
    //알림톡

    return await this.orderRepository.updateOrderItem(existOrderItem);
  }

  // async orderCanceling(id: string) {
  //   const existOrderItem: OrderItem = await this.orderRepository.findOrderItemById(id);
  //   if (existOrderItem.orderStatus !== OrderStatus.CANCELING) {
  //     throw new Error('예약취소요청이 들어온 예약이 아닙니다.');
  //   }
  //   await this.planRepository.putCancelCurrentMember(existOrderItem);
  //   existOrderItem.orderStatus = OrderStatus.CANCEL;
  //   return await this.orderRepository.updateOrderItem(existOrderItem);
  // }

  async orderRefusal(id: string) {
    const existOrderItem: OrderItem = await this.orderRepository.findOrderItemById(id);
    if (existOrderItem.orderStatus !== OrderStatus.CANCELING) {
      throw new Error('예약취소요청이 들어온 예약이 아닙니다.');
    }
    existOrderItem.orderStatus = OrderStatus.REFUSAL;

    //알림톡
    await this.sendOrderRefusalMsg(existOrderItem);
    //알림톡

    return await this.orderRepository.updateOrderItem(existOrderItem);
  }

  private async dtoToOrderItemList(orders: any, userInfo: UserInfo, footPrint: FootPrint, orderId: string) {
    return await orders.reduce(async (prev: Promise<OrderItem[]>, item: OrderItemDTO) => {
      const orderItems: OrderItem[] = await prev;
      const dto: OrderItemDTO = await new OrderItemDTO(item, userInfo).valid();
      dto.orderId = orderId;
      const existPlan: Plan = (await this.planRepository.findById(dto.planId)).val;
      dto.setPlanInfo(existPlan);
      const existLesson: LessonShort = await this.lessonRepository.findByIdInfo(dto.lessonId);
      dto.setLessonInfo(existLesson);
      //dto 와 existPlan 의 데이터 검증 및 lessonId 삽입 수강생 인원 확인.
      dto.validPlanInfo(existPlan);
      const existStudios: StudiosShort = await this.studiosRepository.findByIdInfo(dto.studiosId);
      dto.setStudiosInfo(existStudios);
      const id: string = await this.orderRepository.idGenForOrderItem();
      const orderItem: OrderItem = new OrderItem(dto, id, footPrint);

      orderItems.push(orderItem);

      return orderItems;
    }, Promise.resolve([]));
  }

  private async getNow() {
    const date: Date = new Date();
    date.setHours(date.getHours() + 9);
    return date.toISOString().substring(0, 19);
  }

  async getAccessToken(): Promise<string> {
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: {
        imp_key: this.IamportKey, // REST API 키
        imp_secret: this.IamportSecret, // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    return access_token;
  }

  async getPaymentData(keys: CompleteDTO, accessToken: string): Promise<any> {
    if (keys.imp_uid === 'atoz') {
      return { amount: 0 };
    }
    try {
      const axiosResponse = await axios({
        url: `https://api.iamport.kr/payments/${keys.imp_uid}`, // imp_uid 전달
        method: 'get',
        headers: { Authorization: accessToken }, // 인증 토큰 Authorization header에 추가
      });
      return axiosResponse.data.response;
    } catch (e: any) {
      throw new Error('imp_uid 가 잘못되었습니다.');
    }
  }

  async doPaymentCancel(accessToken: string, imp_uid: string, cancelAmount: number, checkSum: number): Promise<any> {
    const getCancelData = await axios({
      url: 'https://api.iamport.kr/payments/cancel',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken, // 포트원 서버로부터 발급받은 엑세스 토큰
      },
      data: {
        // reason, // 가맹점 클라이언트로부터 받은 환불사유
        imp_uid, // imp_uid를 환불 `unique key`로 입력
        amount: cancelAmount, // 가맹점 클라이언트로부터 받은 환불금액
        checksum: checkSum, // [권장] 환불 가능 금액 입력
      },
    });
    return getCancelData.data;
  }

  private async sendOrderRefusalMsg(orderItem: OrderItem) {
    const plan: any = (await this.planRepository.findById(orderItem.planId)).val;
    const lesson: any = (await this.lessonRepository.findById(plan.lessonId)).val;
    const studios: any = (await this.studiosRepository.findById(lesson.studiosId)).val;
    const user: any = (await this.orderRepository.findUser(orderItem.createdID)).val;
    await this.sendOrderRefusalMsgUser(orderItem, studios, lesson, plan, user);
    await this.sendOrderRefusalMsgStudios(orderItem, studios, lesson, plan, user);
  }

  private async sendOrderRefusalMsgUser(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const msg: string = `#{이름}님 취소 요청이 반려되었습니다.

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
          VAR1: `[${studios.title}]${lesson.title}`,
          VAR2: orderItem.orderId,
        },
      ],
      template: 10032,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }
  private async sendOrderRefusalMsgStudios(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const admin: any = (await this.orderRepository.findUser(studios.createdID)).val;
    if (admin.group !== 'GR0110') {
      return;
    }
    const msg: string = `#{이름}님 환불이 반려되었습니다.

- 상품명 : #{VAR1}
- 주문번호 : #{VAR2}

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
          VAR2: orderItem.orderId,
        },
      ],
      template: 10036,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private async sendOrderCancelMsg(orderItem: OrderItem) {
    const plan: any = (await this.planRepository.findById(orderItem.planId)).val;
    const lesson: any = (await this.lessonRepository.findById(plan.lessonId)).val;
    const studios: any = (await this.studiosRepository.findById(lesson.studiosId)).val;
    const user: any = (await this.orderRepository.findUser(orderItem.createdID)).val;
    await this.sendOrderCancelMsgUser(orderItem, studios, lesson, plan, user);
    await this.sendOrderCancelMsgStudios(orderItem, studios, lesson, plan, user);
  }

  private async sendOrderCancelMsgUser(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const msg: string = `#{이름}님 환불이 완료되었습니다.

- 상품명 : #{VAR1}
- 주문번호 : #{VAR2}
- 결제 금액 : #{VAR3}
- 환불 금액 : #{VAR4}

감사합니다.`;
    const param = {
      service: 2310085547,
      message: msg,
      numbers: [
        {
          key: 1,
          hp: orderItem.reservationerHp,
          name: user.name,
          VAR1: `[${studios.title}]${lesson.title}`,
          VAR2: orderItem.orderId,
          VAR3: orderItem.amount.toLocaleString('ko-KR') + '원',
          VAR4: orderItem.cancelAmount.toLocaleString('ko-KR') + '원',
        },
      ],
      template: 10031,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private async sendOrderCancelMsgStudios(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const admin: any = (await this.orderRepository.findUser(studios.createdID)).val;
    if (admin.group !== 'GR0110') {
      return;
    }
    const msg: string = `#{이름}님 환불이 완료되었습니다.

- 상품명 : #{VAR1}
- 주문번호 : #{VAR2}
- 결제 금액 : #{VAR3}
- 환불 금액 : #{VAR4}

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
          VAR2: orderItem.orderId,
          VAR3: orderItem.amount.toLocaleString('ko-KR') + '원',
          VAR4: orderItem.cancelAmount.toLocaleString('ko-KR') + '원',
        },
      ],
      template: 10031,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private async sendOrderCompleteMsg(orderItem: OrderItem) {
    const plan: any = (await this.planRepository.findById(orderItem.planId)).val;
    const lesson: any = (await this.lessonRepository.findById(plan.lessonId)).val;
    const studios: any = (await this.studiosRepository.findById(lesson.studiosId)).val;
    const user: any = (await this.orderRepository.findUser(orderItem.createdID)).val;
    await this.sendOrderCompleteMsgUser(orderItem, studios, lesson, plan, user);
    await this.sendOrderCompleteMsgStudios(orderItem, studios, lesson, plan, user);
    await this.sendOrderCheckMsgUser(user, orderItem, studios, lesson, plan);
  }

  private async sendOrderCheckMsgUser(user: any, orderItem: OrderItem, studios: any, lesson: any, plan: any) {
    const planDate: Date = new Date(plan.startDate);
    const nowDate: Date = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000; // 1일을 밀리초로 표현

    const standard: Date = new Date(planDate.getTime() - oneDayInMillis);
    standard.setHours(1, 0, 0, 0);
    console.log('nowDate.getTime() ::: ' + nowDate.getTime());
    console.log('standard.getTime() ::: ' + standard.getTime());

    if (nowDate < standard) {
      return;
    }
    const msg: string = `안녕하세요 #{이름}님 obud입니다.

예약 안내드립니다.

- 상품명 : #{VAR1}
- 예약일 : #{VAR2}
- 인원 : #{VAR3}
- 주문번호: #{VAR4}
- 결제 금액 : #{VAR5}

✅ 안내 사항
#{VAR6}

좋은 시간 되시길 바랍니다.😊

감사합니다.`;
    const param = {
      service: 2310085547,
      message: msg,
      numbers: [
        {
          key: 1,
          hp: orderItem.reservationerHp,
          name: user.name,
          VAR1: `[${studios.title}]${lesson.title}`,
          VAR2: this.getTimeSet(plan.startDate),
          VAR3: orderItem.reservationCount,
          VAR4: orderItem.orderId,
          VAR5: orderItem.amount.toLocaleString('ko-KR') + '원',
          VAR6: studios.information + '\n- ' + (studios.parking ? '주차공간이 있습니다.' : '주차공간이 없습니다.'),
        },
      ],
      template: 10038,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private async sendOrderCompleteMsgStudios(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const admin: any = (await this.orderRepository.findUser(studios.createdID)).val;
    if (admin === undefined || admin.group !== 'GR0110') {
      return;
    }
    const msg: string = `#{이름}님 주문 완료되었습니다.

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
      template: 10034,
      groupId: 'G1000000007',
    };
    await this.axiosSend(param);
  }

  private async sendOrderCompleteMsgUser(orderItem: OrderItem, studios: any, lesson: any, plan: any, user: any) {
    const msg: string = `#{이름}님 주문 완료되었습니다.
- 상품명 : #{VAR1}
- 예약일: #{VAR2}
- 인원: #{VAR3}
- 주문번호 : #{VAR4}

환불규정
#{VAR5}

감사합니다.`;
    const param = {
      service: 2310085547,
      message: msg,
      numbers: [
        {
          key: 1,
          hp: orderItem.reservationerHp,
          name: user.name,
          VAR1: `[${studios.title}]${lesson.title}`,
          VAR2: this.getTimeSet(plan.startDate),
          VAR3: orderItem.reservationCount,
          VAR4: orderItem.orderId,
          VAR5: studios.refundPolicy,
        },
      ],
      template: 10037,
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
