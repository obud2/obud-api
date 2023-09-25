import { FootPrint, S3Image } from '../dto/request/RequestDTO';
import { IsArray, IsNotEmpty, IsString, Max, MaxLength, MinLength, validate, ValidationError } from 'class-validator';

export class Plan extends FootPrint {
  id: string;
  lessonId: string;
  startDate: string;
  endDate: string;
  fakePrice: number;
  price: number;
  currentMember: number;
  maxMember: number;
  instructor: string;
  isShow: boolean;
  reservationStatus: ReservationStatus;
  payOption: PlanOption | any;
  status: string = 'ENABLE';

  constructor(data: any, id: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.lessonId = data.lessonId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.fakePrice = data?.fakePrice || 0;
    this.price = data.price;
    this.currentMember = data?.currentMember || 0;
    this.maxMember = data.maxMember;
    this.instructor = data.instructor;
    this.isShow = data?.isShow || true;
    this.reservationStatus = data?.reservationStatus || ReservationStatus.RESERVATION_POSSIBLE;
    this.payOption = data.payOption;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Instructor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "abc123"
 *         email:
 *           type: string
 *           example: "instructor@example.com"
 *         gender:
 *           type: string
 *           example: "male"
 *         group:
 *           type: string
 *           example: "instructor group"
 *         hp:
 *           type: string
 *           example: "123-456-7890"
 *         isDel:
 *           type: string
 *           example: "false"
 *         isShow:
 *           type: string
 *           example: "true"
 *         name:
 *           type: string
 *           example: "Instructor Name"
 *         role:
 *           type: string
 *           example: "instructor"
 *         status:
 *           type: string
 *           example: "active"
 */
export interface Instructor {
  id: string;
  email: string;
  gender: string;
  group: string;
  hp: string;
  isDel: string;
  isShow: string;
  name: string;
  role: string;
  status: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PlanDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "abc123"
 *         lessonId:
 *           type: string
 *           example: "lesson123"
 *         startDate:
 *           type: string
 *           example: "2023-06-13T10:30:00"
 *         endDate:
 *           type: string
 *           example: "2023-06-14T12:00:00"
 *         price:
 *           type: number
 *           example: 100
 *         currentMember:
 *           type: number
 *           example: 5
 *         maxMember:
 *           type: number
 *           example: 10
 *         instructor:
 *           type: string
 *           example: ddbaa87e-93e5-4f00-9936-a46e2512abe9
 *         isShow:
 *           type: boolean
 *           example: true
 *         payOption:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               example: "차한잔 더!"
 *             price:
 *               type: number
 *               example: 5000
 *             currentMember:
 *               type: number
 *               example: 1
 *             maxMember:
 *               type: number
 *               example: 10
 *
 */
export class PlanDTO {
  id: string;
  @IsNotEmpty()
  lessonId: string;
  @IsNotEmpty()
  startDate: string;
  @IsNotEmpty()
  endDate: string;
  fakePrice: number;
  @IsNotEmpty()
  price: number;
  currentMember: number;
  @IsNotEmpty()
  maxMember: number;
  @IsNotEmpty()
  instructor: string;
  isShow: boolean;
  reservationStatus: ReservationStatus;
  payOption: PlanOption | any;
  status: string = 'ENABLE';

  constructor(data: any) {
    this.id = data?.id || '';
    this.lessonId = data.lessonId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.fakePrice = data?.fakePrice || 0;
    this.price = data.price;
    this.currentMember = data?.currentMember || 0;
    this.maxMember = data.maxMember;
    this.instructor = data.instructor;
    this.isShow = data?.isShow || false;
    this.reservationStatus = data?.reservationStatus || ReservationStatus.RESERVATION_POSSIBLE;
    this.payOption = data?.payOption ? new PlanOption(data.payOption) : {};
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

export class GetPlanList {
  lessonId?: string;
  cursor: string;
  limit: number;
  keyword: string;
  date: string;
  constructor(query: any) {
    this.lessonId = query.lessonId;
    this.cursor = query?.cursor || '';
    this.limit = query?.limit;
    this.keyword = query?.keyword || '';
    this.date = query?.date || '';
  }
}

export enum ReservationStatus {
  RESERVATION_POSSIBLE = 'possible',
  RESERVATION_IMPOSSIBLE = 'impossible',
}

export class PlanCheck {
  id: string;
  maxMember: number;
  currentMember: number;
  payOption: payOptionCheck;

  constructor(data: any) {
    this.id = data.id.S;
    this.maxMember = data.maxMember.N;
    this.currentMember = data.currentMember.N;
    this.payOption = new payOptionCheck(data?.payOption?.M);
  }

  async check(reservationCount: number) {
    const human: number = this.maxMember - this.currentMember;
    if (human < reservationCount) {
      throw new Error(`Plan ID : ${this.id}  정원을 초과하여 예약이 취소되었습니다.`);
    }
  }
}

export class payOptionCheck {
  title?: string;
  price?: number;
  currentMember?: number;
  maxMember?: number;

  constructor(data: any) {
    this.title = data?.title?.S;
    this.price = data?.price?.N;
    this.currentMember = data?.currentMember?.N;
    this.maxMember = data?.maxMember?.N;
  }
}
