import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { FootPrint } from '../dto/request/RequestDTO';

export class CodeDTO implements Partial<Code> {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(5000)
  hp: string;

  constructor(code: any) {
    this.name = code?.name;
    this.hp = code?.hp;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Code:
 *       type: object
 *       required:
 *         - name
 *         - hp
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id
 *         name:
 *           type: string
 *           description: The name of your object
 *         hp:
 *           type: string
 *           description: hp
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the object was added
 */
export class Code {
  id: string = '';
  name: string = '';
  hp: string = '';
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

  constructor(code: CodeDTO, id: string, footpint: any) {
    this.id = id;
    this.name = code.name;
    this.hp = code.hp;

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
 *     CodeListItem:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of your object
 */
export class CodeListDTO {
  name: string = '';
  hp: string = '';

  constructor(code: any) {
    this.name = code.name;
    this.hp = code.hp;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<CodeListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CodeInfoDTO:
 *       type: object
 *       properties:
 *         convenience:
 *           type: array
 *           items:
 *             type: object
 *         type:
 *           type: array
 *           items:
 *             type: object
 *         category:
 *           type: array
 *           items:
 *             type: object
 *         information:
 *           type: string
 *         refundPolicy:
 *           type: string
 *         serviceCenter:
 *           type: string
 *         status:
 *           type: string
 *       example:
 *         convenience:
 *           - example: "convenience_1"
 *           - example: "convenience_2"
 *         type:
 *           - example: "type_1"
 *           - example: "type_2"
 *         category:
 *           - example: "category_1"
 *           - example: "category_2"
 *         information: "example_information"
 *         refundPolicy: "example_refund_policy"
 *         serviceCenter: "example_service_center"
 *         status: "ENABLE"
 */
export class CodeInfoDTO extends FootPrint {
  id: string;
  convenience?: Array<object>;
  type?: Array<object>;
  category?: Array<object>;
  information?: string;
  refundPolicy?: string;
  serviceCenter?: string;
  status: string = 'ENABLE';

  constructor(req: any, footPrint: FootPrint) {
    super(footPrint);
    this.id = req.body.id;
    this.convenience = req.body.convenience ? req.body.convenience : [];
    this.type = req.body.type ? req.body.type : [];
    this.category = req.body.category ? req.body.category : [];
    this.information = req.body.information ? req.body.information : '';
    this.refundPolicy = req.body.refundPolicy ? req.body.refundPolicy : '';
    this.serviceCenter = req.body.serviceCenter ? req.body.serviceCenter : '';
  }

  setFootPrint(footPrint: any) {
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

export const enum OrderStatus {
  CANCEL = 'CANCEL',
  COMPLETE = 'COMPLETE',
  FAIL = 'FAIL',
  WAIT = 'WAIT',
  CANCELING = 'CANCELING',
  REFUSAL = 'REFUSAL',
}
