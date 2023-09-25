import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class NoticeDTO implements Partial<Notice> {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  evt: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;
  contents: string;
  sortOrder: number;

  constructor(notice: any) {
    this.evt = notice.evt;
    this.title = notice?.title;
    this.contents = notice?.contents;
    this.sortOrder = notice?.sortOrder ?? 0;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Notice:
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
export class Notice {
  id: string = '';
  evt: string = '';
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

  constructor(notice: NoticeDTO, id: string, footpint: any) {
    this.id = id;
    this.evt = notice.evt;
    this.title = notice.title;
    this.contents = notice.contents;
    this.sortOrder = notice.sortOrder;

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
 *     NoticeListItem:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of your object
 */
export class NoticeListDTO {
  id: string = '';
  evt: string = '';
  title: string = '';
  contents: string = '';
  sortOrder: number = 0;

  constructor(notice: any) {
    this.id = notice.id;
    this.evt = notice.evt;
    this.title = notice.title;
    this.contents = notice.contents;
    this.sortOrder = notice.sortOrder;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<NoticeListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}
