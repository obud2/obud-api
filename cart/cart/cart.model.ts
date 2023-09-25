import { FootPrint, S3Image } from '../dto/request/RequestDTO';
import { IsNotEmpty, validate } from 'class-validator';
import { Plan } from '../plan/plan.model';

export class Cart extends FootPrint {
  id: string;
  studiosId: string;
  studiosTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonImages: S3Image[];
  planId: string;
  price: number;
  startDate: string;
  endDate: string;
  reservationCount: number;
  payOption: PayOption | any;
  payOptionCount: number;
  totalPrice: number;

  constructor(data: any, id: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.studiosId = data?.studiosId || '';
    this.studiosTitle = data?.studiosTitle || '';
    this.lessonId = data?.lessonId || '';
    this.lessonTitle = data?.lessonTitle || '';
    this.lessonImages = data?.lessonImages || {};
    this.planId = data.planId;
    this.price = data.price;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.reservationCount = data.reservationCount;
    this.payOption = data?.payOption || {};
    this.payOptionCount = data?.payOptionCount || 0;
    this.totalPrice = data.price * data.reservationCount;
    if (data?.payOption?.price) this.totalPrice += data.payOption.price * data.payOptionCount;
  }

  setPlanInfo(plan: Plan) {
    this.lessonId = plan.lessonId;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CartDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         studiosId:
 *           type: string
 *         studiosTitle:
 *           type: string
 *         lessonId:
 *           type: string
 *         lessonTitle:
 *           type: string
 *         lessonImages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/S3Image'
 *         planId:
 *           type: string
 *         instructor:
 *           type: string
 *         instructorName:
 *           type: string
 *         price:
 *           type: number
 *         startDate:
 *           type: string
 *         endDate:
 *           type: string
 *         reservationCount:
 *           type: number
 *         payOption:
 *           type: object
 *         payOptionCount:
 *           type: number
 *       required:
 *         - planId
 *         - instructor
 *         - price
 *         - startDate
 *         - endDate
 *         - reservationCount
 *         - userInfo
 *       example:
 *         planId: "789"
 *         instructor: "instructor123"
 *         price: 1000
 *         startDate: "2023-07-01T14:00:00"
 *         endDate: "2023-07-02T13:00:00"
 *         reservationCount: 5
 *         payOption:
 *           title: "option Title"
 *           price: 5000
 *         payOptionCount: 2
 */
export class CartDTO {
  id: string;
  studiosId: string;
  studiosTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonImages: S3Image[];
  @IsNotEmpty()
  planId: string;
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  startDate: string;
  @IsNotEmpty()
  endDate: string;
  @IsNotEmpty()
  reservationCount: number;
  payOption: PayOption | any;
  payOptionCount: number;

  constructor(data: any) {
    this.id = data?.id || '';
    this.studiosId = data?.studiosId || '';
    this.studiosTitle = data?.studiosTitle || '';
    this.lessonId = data?.lessonId || '';
    this.lessonTitle = data?.lessonTitle || '';
    this.lessonImages = data?.lessonImages || [];
    this.planId = data?.planId || '';
    this.price = data.price;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.reservationCount = data.reservationCount;
    this.payOption = data?.payOption || {};
    this.payOptionCount = data?.payOptionCount || 0;
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

export class PayOption {
  title: string;
  price: number;

  constructor(data: any) {
    this.title = data?.title;
    this.price = data?.price;
  }
}

export class CartList {}

export class GetCartList {
  cursor: string;
  limit: number;
  keyword: string;
  cartId: string;
  constructor(query: any) {
    this.cursor = query?.cursor || '';
    this.limit = query?.limit;
    this.keyword = query?.keyword || '';
    this.cartId = query?.cartId;
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
