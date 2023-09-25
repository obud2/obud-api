import { FootPrint, S3Image, S3ImageDdb } from '../dto/request/RequestDTO';
import { IsArray, IsNotEmpty, IsString, MaxLength, MinLength, validate } from 'class-validator';

export class Lesson extends FootPrint {
  id: string;
  studiosId: string;
  lessonType: string;
  title: string;
  contents: string;
  images: Array<object>;
  sortOrder: number;
  specialSort: number;
  isShow: boolean;
  status: string;

  constructor(req: any, id: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.studiosId = req.studiosId;
    this.lessonType = req.lessonType;
    this.title = req.title;
    this.contents = req?.contents || '';
    this.images = req.images;
    this.sortOrder = req?.sortOrder || 1;
    this.specialSort = req?.specialSort || 0;
    this.isShow = req.isShow !== undefined ? req.isShow : false;
    this.status = req?.status || 'ENABLE';
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonDTO:
 *       type: object
 *       properties:
 *         studiosId:
 *           type: string
 *           example: "abc123"
 *         lessonType:
 *           type: string
 *           example: "Special"
 *         title:
 *           type: string
 *           example: "Lesson Title"
 *         content:
 *           type: string
 *           example: "Lesson Content"
 *         sortOrder:
 *           type: number
 *           example: 1
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             example:
 *               url: "https://example.com/image1.jpg"
 *               alt: "Image 1"
 *         specialSort:
 *           type: number
 *           example: 1
 */
export class LessonDTO {
  id: string;
  @IsNotEmpty()
  studiosId: string;
  @IsNotEmpty()
  lessonType: string;
  @IsNotEmpty()
  title: string;
  contents: string;
  images: Array<S3Image>;
  sortOrder: number;
  specialSort: number;
  isShow: boolean;
  constructor(req: any) {
    this.id = req?.id || '';
    this.studiosId = req.studiosId;
    this.lessonType = req.lessonType;
    this.title = req.title;
    this.contents = req?.contents || '';
    this.images = req.images.reduce((prev: S3Image[], data: S3Image) => {
      const image: S3Image = new S3Image(data);
      prev.push(image);
      return prev;
    }, []);
    this.sortOrder = req?.sortOrder || 1;
    this.specialSort = req?.specialSort || 0;
    this.isShow = req.isShow !== undefined ? req.isShow : false;
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

export class GetLessonList {
  studiosId?: string;
  cursor: string;
  limit: number;
  keyword: string;
  constructor(query: any) {
    this.studiosId = query.studiosId;
    this.cursor = query.cursor;
    this.limit = query.limit;
    this.keyword = query.keyword;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonDataType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         studiosId:
 *           type: string
 *         before:
 *           type: number
 *         after:
 *           type: number
 *       example:
 *         id: "게시글의 ID 값, before : 이동하기전 게시물의 sortOrder 값, after : 이동한후에 게시글의 sortOrder 값"
 *         studiosId: "해당 클래스가 속해있는 Studios 의 Id 값"
 *         before: 5
 *         after: 1
 */
export interface LessonDataType {
  id: string;
  before: number;
  after: number;
  studiosId: string;
}

export class LessonSortData {
  id: string;
  studiosId: string;
  sortOrder: number;

  constructor(data: any) {
    this.id = data.id.S;
    this.studiosId = data.studiosId.S;
    this.sortOrder = parseInt(data.sortOrder.N);
  }
}

export class LessonSpecialSortData {
  id: string;
  specialSort: number;

  constructor(data: any) {
    this.id = data.id.S;
    this.specialSort = parseInt(data.specialSort.N);
  }
}

export class LessonShort {
  id: string;
  studiosId: string;
  title: string;
  images: S3ImageDdb;

  constructor(data: any) {
    this.id = data.id.S;
    this.studiosId = data.studiosId.S;
    this.title = data.title.S;
    this.images = new S3ImageDdb(data.images.L[0].M);
  }
}
