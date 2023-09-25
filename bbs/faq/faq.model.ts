import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class FaqDTO implements Partial<Faq> {
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

  constructor(faq: any) {
    this.evt = faq.evt;
    this.title = faq?.title;
    this.contents = faq?.contents;
    this.sortOrder = faq?.sortOrder ?? 0;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Faq:
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
export class Faq {
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

  constructor(faq: FaqDTO, id: string, footpint: any) {
    this.id = id;
    this.evt = faq.evt;
    this.title = faq.title;
    this.contents = faq.contents;
    this.sortOrder = faq.sortOrder;

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
 *     FaqListItem:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of your object
 */
export class FaqListDTO {
  id: string = '';
  evt: string = '';
  title: string = '';
  contents: string = '';
  sortOrder: number = 0;

  constructor(faq: any) {
    this.id = faq.id;
    this.evt = faq.evt;
    this.title = faq.title;
    this.contents = faq.contents;
    this.sortOrder = faq.sortOrder;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<FaqListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}
