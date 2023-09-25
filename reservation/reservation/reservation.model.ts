import { FootPrint } from '../dto/request/RequestDTO';

export class GetReservationList {
  cursor: string;
  limit: number;
  keyword: string;
  constructor(query: any) {
    this.cursor = query?.cursor || '';
    this.limit = query?.limit;
    this.keyword = query?.keyword || '';
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

  static async getOrder(data: any): Promise<Order> {
    return new Order(data, data.id, data.orderStatus, data.amount, data.payInfo, data.userInfo);
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
    this.payOption = data.payOption;
    this.payOptionCount = data?.payOptionCount || 0;
  }

  static async createOrderItem(data: any) {
    return new OrderItem(data, data.id, data);
  }
}

export class PlanOption {
  title: string;
  price: number;
  currentMember: number;
  maxMember: number;

  constructor(data: any) {
    this.title = data?.title;
    this.price = data?.price;
    this.currentMember = data?.currentMember || 0;
    this.maxMember = data?.maxMember;
  }
}

export class StudiosShort {
  id: string;
  title: string;
  refundPolicy: string;

  constructor(data: any) {
    this.id = data.id.S;
    this.title = data.title.S;
    this.refundPolicy = data.refundPolicy.S;
  }
}
