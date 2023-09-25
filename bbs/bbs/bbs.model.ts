import { IsString, MaxLength, MinLength } from 'class-validator';

export class BbsDTO implements Partial<Bbs> {
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
  company: string = '';
  email: string = '';
  hp: string = '';
  name: string = '';

  constructor(bbs: any) {
    this.evt = bbs.evt;
    this.title = bbs?.title;
    this.contents = bbs?.contents;
    this.sortOrder = bbs?.sortOrder ?? 0;
    this.company = bbs?.company;
    this.email = bbs?.email;
    this.hp = bbs?.hp;
    this.name = bbs?.name;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Bbs:
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
export class Bbs {
  id: string = '';
  evt: string = '';
  title: string = '';
  contents: string = '';
  alwaysTop: boolean = false;
  status: string = 'ENABLE';
  isShow: string = 'Y';
  sortOrder: number = 0;
  company: string = '';
  email: string = '';
  hp: string = '';
  name: string = '';

  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(bbs: BbsDTO, id: string, footpint: any) {
    this.id = id;
    this.evt = bbs.evt;
    this.title = bbs.title;
    this.contents = bbs.contents;
    this.sortOrder = bbs.sortOrder;
    this.company = bbs?.company;
    this.email = bbs?.email;
    this.hp = bbs?.hp;
    this.name = bbs?.name;

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
 *     BbsListItem:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of your object
 */
export class BbsListDTO {
  id: string = '';
  evt: string = '';
  title: string = '';
  sortOrder: number = 0;
  company: string = '';
  email: string = '';
  hp: string = '';
  name: string = '';

  constructor(bbs: any) {
    this.id = bbs.id;
    this.evt = bbs.evt;
    this.title = bbs.title;
    this.sortOrder = bbs.sortOrder;
    this.company = bbs?.company;
    this.email = bbs?.email;
    this.hp = bbs?.hp;
    this.name = bbs?.name;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<BbsListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}
