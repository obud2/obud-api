import { FootPrint, S3Image } from '../dto/request/RequestDTO';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, Max, MaxLength, MinLength, validate, ValidationError } from 'class-validator';
import { GetLessonList } from '../lesson/lesson.model';

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
    this.instructor = data?.instructor || 'x';
    this.isShow = data?.isShow ? true : false;
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
    this.instructor = data?.instructor || 'x';
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

export class UpdatePlanDTO {
  id: string;
  lessonId: string;
  startDate?: string;
  endDate: string;
  fakePrice: number;
  price: number;
  maxMember: number;
  instructor: string;
  isShow: boolean;
  reservationStatus?: ReservationStatus;
  payOption: PlanOption | any;

  constructor(data: any) {
    this.id = data.id;
    this.lessonId = data.lessonId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.fakePrice = data.fakePrice || 0;
    this.price = data.price;
    this.maxMember = data.maxMember;
    this.instructor = data.instructor;
    this.isShow = data.isShow;
    this.reservationStatus = data.reservationStatus;
    this.payOption = data.payOption;
  }

  removeUndefinedProperties() {
    for (const key in this) {
      if (this[key] === undefined) {
        delete this[key];
      }
    }
    return this;
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

export class GetCalendarList {
  studiosId: string;
  cursor?: string;
  limit?: number;
  keyword?: string;
  lessonId?: string;
  date: string;

  constructor(query: any) {
    this.studiosId = query.studiosId;
    this.cursor = query?.cursor;
    this.limit = query?.limit;
    this.keyword = query?.keyword;
    this.lessonId = query?.lessonId;
    this.date = query.date;
  }

  valid() {
    if (this.studiosId === undefined || this.studiosId === '') {
      throw new Error('스튜디오 아이디를 입력해주세요');
    }
    const datePattern: RegExp = /^\d{4}-\d{2}$/;
    if (!datePattern.test(this.date)) {
      throw new Error('날짜 형식이 올바르지 않습니다. Ex 2023-07');
    }
    return this;
  }

  validDay() {
    if (this.studiosId === undefined || this.studiosId === '') {
      throw new Error('스튜디오 아이디를 입력해주세요');
    }
    const datePattern: RegExp = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(this.date)) {
      throw new Error('날짜 형식이 올바르지 않습니다. Ex 2023-07-01');
    }
    return this;
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

  constructor(data: any) {
    this.id = data.id.S;
    this.maxMember = data.maxMember.N;
    this.currentMember = data.currentMember.N;
  }

  async check(reservationCount: number) {
    const human: number = this.maxMember - this.currentMember;
    if (human < reservationCount) {
      throw new Error(`Plan ID : ${this.id}  정원을 초과하여 예약이 취소되었습니다.`);
    }
  }
}

export class MultiDTO {
  @IsNotEmpty({ message: '레슨 아이디가 없습니다.' })
  lessonId: string;
  @IsNotEmpty()
  startDate: string;
  @IsNotEmpty()
  endDate: string;
  @IsArray()
  @ArrayMinSize(1, { message: '요일을 선택해야합니다.' })
  days: string[];
  @IsArray()
  @ArrayMinSize(1, { message: 'timeRanges 에 데이터가 없습니다.' })
  timeRanges: any[];
  @IsNotEmpty()
  maxMember: number;
  fakePrice: number;
  @IsNotEmpty()
  price: number;
  payOption: PlanOption | any;

  constructor(body: any) {
    this.lessonId = body.lessonId;
    this.startDate = body.startDate;
    this.endDate = body.endDate;
    this.days = body.days;
    this.timeRanges = body.timeRanges;
    this.maxMember = body.maxMember;
    this.fakePrice = body?.fakePrice || 0;
    this.price = body.price;
    this.payOption = body?.payOption ? new PlanOption(body.payOption) : {};
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
