import { IsString, MaxLength, MinLength } from 'class-validator';
import { Request } from 'express';
/**
 * @swagger
 * components:
 *   InfoDTO:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         description: Info ID
 *         minLength: 3
 *         maxLength: 5000
 *       title:
 *         type: string
 *         description: Info title
 *         minLength: 3
 *         maxLength: 5000
 *       addr:
 *         type: string
 *         description: Info address
 *       addrEn:
 *         type: string
 *         description: Info address in English
 *       email:
 *         type: string
 *         description: Info email
 *       fax:
 *         type: string
 *         description: Info fax number
 *       tel:
 *         type: string
 *         description: Info telephone number
 *     example:
 *       id: exampleID
 *       title: Example Title
 *       addr: Example Address
 *       addrEn: Example Address (English)
 *       email: example@example.com
 *       fax: 123456789
 *       tel: 987654321
 */
export class InfoDTO implements Partial<Info> {
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  id: string;

  @IsString()
  @MinLength(3)
  title: string;

  addr: string;
  addrEn: string;
  email: string;
  fax: string;
  tel: string;

  constructor(info: any) {
    this.id = info?.id;
    this.addr = info?.addr;
    this.addrEn = info?.addrEn;
    this.email = info?.email;
    this.fax = info?.fax;
    this.tel = info?.tel;
    this.title = info?.title;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Info:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id
 *         title:
 *           type: string
 *           description: The title of your object
 */
export class Info {
  id: string = '';
  title: string = '';
  addr: string = '';
  addrEn: string = '';
  email: string = '';
  fax: string = '';
  tel: string = '';
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

  constructor(info: InfoDTO, id: string, footpint: any) {
    this.id = id;
    this.title = info.title;
    this.addr = info.addr;
    this.addrEn = info.addrEn;
    this.email = info.email;
    this.fax = info.fax;
    this.tel = info.tel;

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
 *     InfoListDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Info ID
 *         title:
 *           type: string
 *           description: Info title
 *         addr:
 *           type: string
 *           description: Info address
 *         addrEn:
 *           type: string
 *           description: Info address in English
 *         email:
 *           type: string
 *           description: Info email
 *         fax:
 *           type: string
 *           description: Info fax number
 *         tel:
 *           type: string
 *           description: Info telephone number
 *       example:
 *         id: exampleID
 *         title: Example Title
 *         addr: Example Address
 *         addrEn: Example Address (English)
 *         email: example@example.com
 *         fax: 123456789
 *         tel: 987654321
 */
export class InfoListDTO {
  id: string = '';
  title: string = '';
  addr: string = '';
  addrEn: string = '';
  email: string = '';
  fax: string = '';
  tel: string = '';

  constructor(info: any) {
    this.id = info.id;
    this.title = info.title;
    this.addr = info.addr;
    this.addrEn = info.addrEn;
    this.email = info.email;
    this.fax = info.fax;
    this.tel = info.tel;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<InfoListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}

//================================================
//TODO Request 상속받은 DTO 테스트용

export interface InfoReqDTO extends Request {
  body: InfoReqBody;
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
}

/**
 * @swagger
 * components:
 *   schemas:
 *     InfoReqBody:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: exampleUUID
 *         companyName:
 *           type: string
 *           description: 상호명
 *         ceo:
 *           type: string
 *           description: 대표이사
 *         contact:
 *           type: string
 *           description: 연락처
 *         address:
 *           type: string
 *           description: 주소
 *         informationManager:
 *           type: string
 *           description: 개인정보책임자
 *         companyRegistrationNumber:
 *           type: string
 *           description: 사업자등록번호
 *         telecommunicationNumber:
 *           type: string
 *           description: 통신판매업신고번호
 *         terms:
 *           type: string
 *           description: 이용역관
 *         privacyPolicy:
 *           type: string
 *           description: 개인정보처리방침
 *         email:
 *           type: string
 *       example:
 *         id: exampleUUID
 *         companyName: OBUD
 *         ceo: 우과장님
 *         contact: 010-1234-1234
 *         address: 한국
 *         informationManager: 우과장님
 *         companyRegistrationNumber: 1234-1234-4567
 *         telecommunicationNumber: 1345-15348
 *         terms: 이용역관
 *         privacyPolicy: 개인정보처리방침;
 *         email: tskim@atozsoft.co.kr
 */
export class InfoReqBody extends FootPrint {
  id: string;
  companyName?: string;
  ceo?: string;
  contact?: string;
  address?: string;
  informationManager?: string;
  companyRegistrationNumber?: string;
  telecommunicationNumber?: string;
  terms?: string;
  privacyPolicy?: string;
  email?: string;

  constructor(req: InfoReqDTO, footPrint: FootPrint) {
    super(footPrint);
    this.id = req.body.id;
    if (req.body.companyName) this.companyName = req.body.companyName;
    if (req.body.ceo) this.ceo = req.body.ceo;
    if (req.body.contact) this.contact = req.body.contact;
    if (req.body.address) this.address = req.body.address;
    if (req.body.informationManager) this.informationManager = req.body.informationManager;
    if (req.body.companyRegistrationNumber) this.companyRegistrationNumber = req.body.companyRegistrationNumber;
    if (req.body.telecommunicationNumber) this.telecommunicationNumber = req.body.telecommunicationNumber;
    if (req.body.terms) this.terms = req.body.terms;
    if (req.body.privacyPolicy) this.privacyPolicy = req.body.privacyPolicy;
    this.email = req.body?.email || '';
  }
}
