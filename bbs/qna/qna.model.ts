import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class QnADTO implements Partial<QnA> {
  @IsNotEmpty()
  evt: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;
  contents: string;
  sortOrder: number;

  @IsNotEmpty()
  userId: string;
  userName: string;

  constructor(qna: any) {
    this.evt = qna.evt;
    this.userId = qna.userId || '';
    this.userName = qna.userName || '';
    this.title = qna?.title || '';
    this.contents = qna?.contents || '';
    this.sortOrder = qna?.sortOrder ?? 0;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     QnA:
 *       type: object
 *       required:
 *         - title
 *         - contents
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id
 *         title:
 *           type: string
 *           description: The title of your object
 *         contents:
 *           type: string
 *           description: contents
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the object was added
 */
export class QnA {
  id: string = '';
  evt: string = '';
  userId: string = '';
  userName: string = '';
  title: string = '';
  contents: string = '';
  alwaysTop: boolean = false;
  status: string = 'ENABLE';
  isShow: string = 'Y';
  sortOrder: number = 0;

  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(qna: QnADTO, id: string, footpint: any) {
    this.id = id;
    this.evt = qna.evt;
    this.userId = qna.userId;
    this.userName = qna.userName;
    this.title = qna.title;
    this.contents = qna.contents;
    this.sortOrder = qna.sortOrder;

    if (footpint.createdAt) this.createdAt = footpint.createdAt;
    if (footpint.createdID) this.createdID = footpint.createdID;
    if (footpint.createdIP) this.createdIP = footpint.createdIP;
    if (footpint.createdBy) this.createdBy = footpint.createdBy;

    if (footpint.updatedAt) this.updatedAt = footpint.updatedAt;
    if (footpint.updatedID) this.updatedID = footpint.updatedID;
    if (footpint.updatedIP) this.updatedIP = footpint.updatedIP;
    if (footpint.updatedBy) this.updatedBy = footpint.updatedBy;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     QnAListItem:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of your object
 */
export class QnAListDTO {
  id: string = '';
  evt: string = '';
  userId: string = '';
  userName: string = '';
  title: string = '';
  contents: string = '';
  sortOrder: number = 0;
  createdAt: number = 0;

  constructor(qna: any) {
    this.id = qna.id;
    this.evt = qna.evt;
    this.userId = qna.userId;
    this.userName = qna.userName;
    this.title = qna.title;
    this.contents = qna.contents;
    this.sortOrder = qna.sortOrder;
    this.createdAt = qna.createdAt;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<QnAListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}
