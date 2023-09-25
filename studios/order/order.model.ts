import { FootPrint, S3Image } from '../dto/request/RequestDTO';
import { IsArray, IsNotEmpty, IsString, MaxLength, MinLength, validate } from 'class-validator';
import { Plan, PlanOption } from '../plan/plan.model';
import { LessonShort } from '../lesson/lesson.model';
import { StudiosShort } from '../studios/studios.model';

export class Order extends FootPrint {
  id: string;
  orderStatus: OrderStatus;
  amount: number;
  payInfo: object;
  userInfo: UserInfo;

  constructor(
    footPrint: FootPrint,
    id: string,
    orderStatus: OrderStatus,
    orderItems: OrderItem[] | number,
    payInfo: object,
    userInfo: UserInfo,
  ) {
    super(footPrint);
    this.id = id;
    this.orderStatus = orderStatus;
    if (typeof orderItems === 'number') {
      this.amount = orderItems;
    } else {
      this.amount = orderItems.reduce((prev: number, item: OrderItem) => {
        return prev + item.amount;
      }, 0);
    }
    this.payInfo = payInfo;
    this.userInfo = userInfo;
  }

  static async createOrder(data: any, payInfo: object): Promise<Order> {
    return new Order(data, data.id, OrderStatus.COMPLETE, data.amount, payInfo, data.userInfo);
  }
}

export class OrderItem extends FootPrint {
  id: string;
  orderId: string;
  studiosId: string;
  studiosTitle: string;
  lessonId: string;
  lessonTitle: string;
  images: any;
  amount: number;
  price: number;
  startDate: string;
  endDate: string;
  planId: string;
  instructor: string;
  instructorName: string;
  orderStatus: OrderStatus;
  cancelDate: string;
  reservationer: string;
  reservationCount: number;
  reservationerHp: string;
  userInfo: UserInfo;
  attendance: boolean;
  comment: string;
  payOption: PlanOption;
  payOptionCount: number;
  cancelAmount: number = 0;
  status: string = 'ENABLE';

  constructor(data: any, id: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.orderId = data.orderId;
    this.studiosId = data?.studiosId;
    this.studiosTitle = data?.studiosTitle;
    this.lessonId = data?.lessonId;
    this.lessonTitle = data?.lessonTitle;
    this.images = data?.images;
    this.amount = data?.amount;
    this.price = data?.price;
    this.startDate = data?.startDate;
    this.endDate = data?.endDate;
    this.planId = data?.planId;
    this.instructor = data?.instructor;
    this.instructorName = data?.instructorName;
    this.orderStatus = data?.orderStatus;
    this.cancelDate = data?.cancelDate;
    this.reservationer = data?.reservationer;
    this.reservationCount = data?.reservationCount;
    this.reservationerHp = data?.reservationerHp;
    this.userInfo = data?.userInfo;
    this.attendance = data?.attendance;
    this.comment = data?.comment;
    this.payOption = data?.payOption || {};
    this.payOptionCount = data?.payOptionCount || 0;
  }

  static async createOrderItem(data: any) {
    return new OrderItem(data, data.id, data);
  }
}

export class OrderItemDTO {
  id: string;
  orderId: string;
  studiosId: string;
  studiosTitle: string;
  lessonId: string;
  lessonTitle: string;
  @IsNotEmpty()
  planId: string;
  instructor: string;
  instructorName: string;
  amount: number;
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  startDate: string;
  @IsNotEmpty()
  endDate: string;
  orderStatus: OrderStatus;
  cancelDate: string;
  reservationer: string;
  reservationCount: number;
  reservationerHp: string;
  userInfo: UserInfo;
  attendance: boolean;
  comment: string;
  payOption: PlanOption;
  payOptionCount: number;
  status: string = 'ENABLE';

  constructor(data: any, userInfo: UserInfo) {
    this.id = data?.id || '';
    this.orderId = '';
    this.studiosId = data?.studiosId || '';
    this.studiosTitle = data?.studiosTitle || '';
    this.lessonId = data?.lessonId || '';
    this.lessonTitle = data?.lessonTitle || '';
    this.planId = data.planId;
    this.instructor = data.instructor;
    this.instructorName = data?.instructorName || '';
    this.price = data.price;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.orderStatus = data?.orderStatus || OrderStatus.WAIT;
    this.cancelDate = data?.cancelDate || '';
    this.reservationer = data?.reservationer || '';
    this.reservationCount = data?.reservationCount || 1;
    this.reservationerHp = data?.reservationerHp || '';
    this.userInfo = userInfo;
    this.attendance = data?.attendance || false;
    this.comment = data?.comment || '';
    this.payOption = data?.payOption || {};
    this.payOptionCount = data?.payOptionCount || 0;

    // TODO 나중에 여기서 가격검증 해야함
    this.amount = data.price * data.reservationCount;
    if (data?.payOption?.price) this.amount += data.payOption.price * data.payOptionCount;
  }

  validPlanInfo(plan: Plan) {
    if (plan === undefined) {
      throw new Error('해당 Plan이 존재하지 않습니다.');
    }
    if (this.price !== plan.price) {
      throw new Error(`Plan ID :: ${plan.id} 의 가격이 동일하지 않습니다.`);
    }
    if (plan.startDate !== this.startDate) {
      throw new Error(`Plan ID :: ${plan.id} 의 시작시간이 동일하지 않습니다.`);
    }
    if (plan.endDate !== this.endDate) {
      throw new Error(`Plan ID :: ${plan.id} 의 끝나는 시간이 동일하지 않습니다.`);
    }
    const remaining: number = plan.maxMember - plan.currentMember;
    if (remaining < 1) {
      throw new Error(`Plan ID :: ${plan.id} 의 수강원이 가득 찼습니다.`);
    }
    if (remaining < this.reservationCount) {
      throw new Error(`Plan ID :: ${plan.id} 자리가 모자랍니다.`);
    }
    if (this.payOptionCount > 0 && plan?.payOption?.price) {
      if (this.payOptionCount > this.reservationCount) {
        throw new Error('옵션의 인원이 예약인원을 초과할수 없습니다.');
      }
      if (plan.payOption?.price !== this?.payOption?.price) {
        throw new Error(`Plan ID :: ${plan.id} 의 옵션가격이 다릅니다.`);
      }
      const optionRemaining: number = plan?.payOption?.maxMember - plan?.payOption?.currentMember;
      if (optionRemaining < 1) {
        throw new Error(`Plan ID :: ${plan.id} 의 옵션인원이 가득찼습니다.`);
      }
      if (optionRemaining < this.payOptionCount) {
        throw new Error(`Plan ID :: ${plan.id} 의 옵션자리가 모자랍니다.`);
      }
    }
  }

  setPlanInfo(plan: Plan) {
    this.lessonId = plan.lessonId;
  }

  setLessonInfo(lessonShort: LessonShort) {
    this.studiosId = lessonShort.studiosId;
    this.lessonTitle = lessonShort.title;
  }
  async valid() {
    const errors = await validate(this);
    if (errors.length) {
      throw errors;
    } else {
      return this;
    }
  }

  setStudiosInfo(studios: StudiosShort) {
    this.studiosId = studios.id;
    this.studiosTitle = studios.title;
  }

  setInstructor(instructor: InstructorSet) {
    this.instructorName = instructor.name;
  }
}

export class InstructorSet {
  id: string;
  hp: string;
  group: string;
  email: string;
  isDel: string;
  name: string;
  isShow: string;
  createdAt: number;
  updatedAt: number;
  role: string;
  birthdate: string;

  constructor(data: any) {
    this.id = data.id;
    this.hp = data.hp;
    this.group = data.group;
    this.email = data.email;
    this.isDel = data.isDel;
    this.name = data.name;
    this.isShow = data.isShow;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.role = data.role;
    this.birthdate = data.birthdate;
  }
}

export class UserInfo {
  id: string;
  email: string;
  group: string;
  role: string;
  name: string;
  hp: string;

  constructor(headers: any) {
    this.id = headers?.decoded['cognito:username'];
    this.email = headers?.decoded['email'];
    this.group = headers?.decoded['custom:group'];
    this.role = headers?.decoded['custom:role'];
    this.name = headers?.decoded['name'] || '';
    this.hp = headers?.decoded['custom:hp'] === undefined ? '' : headers?.decoded['custom:hp'];
  }
}

export const enum OrderStatus {
  CANCEL = 'CANCEL',
  COMPLETE = 'COMPLETE',
  FAIL = 'FAIL',
  WAIT = 'WAIT',
  CANCELING = 'CANCELING',
  REFUSAL = 'REFUSAL',
}

export class CompleteDTO {
  @IsNotEmpty()
  imp_uid: string;
  @IsNotEmpty()
  merchant_uid: string;

  constructor(data: any) {
    this.imp_uid = data.imp_uid;
    this.merchant_uid = data.merchant_uid;
  }

  async valid() {
    const errors = await validate(this);
    if (errors.length) {
      throw errors;
    } else {
      return this;
    }
  }
}
