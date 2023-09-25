import { IsString, MaxLength, MinLength } from 'class-validator';
import { Request } from 'express';

export class ContactDTO implements Partial<Contact> {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  id: string;
  name: string = '';
  email: string = '';
  hp: string = '';
  type: string = '';
  region: string = '';
  num: string = '';
  date: string = '';
  yogaStyle: string = '';
  classStyle: string = '';
  etc: string = '';
  sns: string = '';
  career: string = '';
  process: string = '';

  constructor(contact: any) {
    this.id = contact.id;
    this.name = contact.name;
    this.email = contact.email;
    this.hp = contact.hp;
    this.region = contact.region;
    this.num = contact.num;
    this.date = contact.date;
    this.yogaStyle = contact.yogaStyle;
    this.classStyle = contact.classStyle;
    this.etc = contact.etc;
    this.sns = contact.sns;
    this.type = contact.type;
    this.career = contact.career;
    this.process = contact.process;
  }
}

// /**
// @swagger
// components:
// schemas:
// Contact:
// properties:
// id:
// type: string
// description: The auto - generated id
// name:
// type: string
// description: [공용]성함
// hp:
// type: string
// description: [공용]연락처
// email:
// type: string
// description: [공용]이메일
// region:
// type: string
// description: [공용]희망지역
// num:
// type: string
// description: [클래스]희망인원
// date:
// type: string
// description: [클래스]희망시간대
// yogaStyle:
// type: string
// description: [공용]희망요가스타일 / 가능요가스타일
// classStyle:
// type: string
// description: [공용]희망수업스타일 / 가능수업스타일
// etc:
// type: string
// description: [클래스]추가요청사항
// sns:
// type: string
// description: [구직]sns계정
// attachment:
// type: string
// description: [구직]첨부문서 url(s3 file bucket)
// career:
// type: string
// description: [구직]경력
// createdAt:
// type: string
// format: date
// description: The date the object was added
// */
export class Contact {
  id: string = '';
  type: string = '';
  name: string = '';
  email: string = '';
  hp: string = '';
  region: string = '';
  num: string = '';
  date: string = '';
  yogaStyle: string = '';
  classStyle: string = '';
  etc: string = '';
  sns: string = '';
  career: string = '';
  process: string = '';

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

  constructor(contact: any, id: string, footpint: any) {
    this.id = id;
    this.type = contact?.type;
    this.name = contact?.name;
    this.email = contact?.email;
    this.hp = contact?.hp;
    this.region = contact?.region;
    this.num = contact?.num;
    this.date = contact?.date;
    this.yogaStyle = contact?.yogaStyle;
    this.classStyle = contact?.classStyle;
    this.etc = contact?.etc;
    this.sns = contact?.sns;
    this.career = contact?.career;
    this.process = contact?.process;

    if (footpint.createdAt) this.createdAt = footpint.createdAt;
    if (footpint.createdID) this.createdID = footpint.createdID;
    if (footpint.createdIP) this.createdIP = footpint.createdIP;
    if (footpint.createdBy) this.createdBy = footpint.createdBy;

    if (footpint.updatedAt) this.updatedAt = footpint.updatedAt;
    if (footpint.updatedID) this.updatedID = footpint.updatedID;
    if (footpint.updatedIP) this.updatedIP = footpint.updatedIP;
    if (footpint.updatedBy) this.updatedBy = footpint.updatedBy;
  }
  setCreated(data: any) {
    this.createdAt = data?.createdAt || this.createdAt;
    this.createdID = data?.createdID || this.createdID;
    this.createdIP = data?.createdIP || this.createdIP;
    this.createdBy = data?.createdBy || this.createdBy;
  }

  setUpdated(data: any) {
    this.updatedAt = data?.updatedAt || this.updatedAt;
    this.updatedID = data?.updatedID || this.updatedID;
    this.updatedIP = data?.updatedIP || this.updatedIP;
    this.updatedBy = data?.updatedBy || this.updatedBy;
  }
}

export class ContactListDTO {
  id: string = '';
  type: string = '';
  name: string = '';
  email: string = '';
  hp: string = '';
  region: string = '';
  num: string = '';
  date: string = '';
  yogaStyle: string = '';
  classStyle: string = '';
  etc: string = '';
  sns: string = '';
  career: string = '';
  process: string = '';

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

  constructor(contact: any) {
    this.id = contact.id;
    this.type = contact?.type;
    this.email = contact?.email;
    this.name = contact?.name;
    this.hp = contact?.hp;
    this.region = contact?.region;
    this.num = contact?.num;
    this.date = contact?.date;
    this.yogaStyle = contact?.yogaStyle;
    this.classStyle = contact?.classStyle;
    this.etc = contact?.etc;
    this.sns = contact?.sns;
    this.career = contact?.career;
    this.process = contact?.process;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<ContactListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}

export interface ContactReqDTO extends Request {
  body: ContactReqBody;
}

export class FootPrint {
  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(footPrint: FootPrint) {
    if (footPrint.createdAt) this.createdAt = footPrint.createdAt;
    if (footPrint.createdID) this.createdID = footPrint.createdID;
    if (footPrint.createdIP) this.createdIP = footPrint.createdIP;
    if (footPrint.createdBy) this.createdBy = footPrint.createdBy;

    if (footPrint.updatedAt) this.updatedAt = footPrint.updatedAt;
    if (footPrint.updatedID) this.updatedID = footPrint.updatedID;
    if (footPrint.updatedIP) this.updatedIP = footPrint.updatedIP;
    if (footPrint.updatedBy) this.updatedBy = footPrint.updatedBy;
  }
  setCreated(data: any) {
    this.createdAt = data.createdAt;
    this.createdID = data.createdID;
    this.createdIP = data.createdIP;
    this.createdBy = data.createdBy;
  }

  setUpdated(data: any) {
    this.updatedAt = data.updatedAt;
    this.updatedID = data.updatedID;
    this.updatedIP = data.updatedIP;
    this.updatedBy = data.updatedBy;
  }
}

export class ContactReqBody extends FootPrint {
  id: string = '';
  type: string = '';
  name: string = '';
  email: string = '';
  hp: string = '';
  region: string = '';
  num: string = '';
  date: string = '';
  yogaStyle: string = '';
  classStyle: string = '';
  etc: string = '';
  sns: string = '';
  career: string = '';
  process: string = '';

  alwaysTop: boolean = false;
  status: string = 'ENABLE';
  isShow: string = 'Y';
  sortOrder: number = 0;

  constructor(req: ContactReqDTO, footPrint: FootPrint) {
    super(footPrint);
    this.id = req.body.id;
    if (req.body.email) this.type = req.body.email;
    if (req.body.type) this.type = req.body.type;
    if (req.body.name) this.name = req.body.name;
    if (req.body.hp) this.hp = req.body.hp;
    if (req.body.region) this.region = req.body.region;
    if (req.body.num) this.num = req.body.num;
    if (req.body.date) this.date = req.body.date;
    if (req.body.yogaStyle) this.yogaStyle = req.body.yogaStyle;
    if (req.body.classStyle) this.classStyle = req.body.classStyle;
    if (req.body.etc) this.etc = req.body.etc;
    if (req.body.sns) this.sns = req.body.sns;
    if (req.body.career) this.career = req.body.career;
    if (req.body.process) this.process = req.body.process;
  }
}
