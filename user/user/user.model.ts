import { IsNotEmpty, IsString, MaxLength, MinLength, validate } from 'class-validator';
import { FootPrint, RequestBodyDTO } from '../dto/request/RequestBodyDTO';
import * as querystring from 'querystring';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           description: 이메일 주소
 *         group:
 *           type: string
 *           default: 'GR0200'
 *         role:
 *           type: string
 *           default: 'USR'
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         password:
 *           type: string
 *         hp:
 *           type: string
 *         birthdate:
 *           type: string
 *         gender:
 *           type: string
 *       example:
 *         id: "사용자의 ID 값"
 *         email: "사용자의 이메일 주소"
 *         group: "GR0200"
 *         role: "USR"
 *         name: "사용자의 이름"
 *         password: "사용자의 비밀번호"
 *         hp: "사용자의 휴대폰 번호"
 *         birthdate: "사용자의 생년월일"
 *         gender: "사용자의 성별"
 */
export class UserDTO implements Partial<User> {
  id: string;
  email: string;
  group: string = 'GR0200';
  role: string = 'USR';
  name: string;
  password: string;
  hp: string;
  birthdate: string;
  gender: string;
  adr: string;
  adrDetail: string;
  visitCount: number;
  studiosAdminList: string[];

  constructor(user: any) {
    this.id = user?.id || '';
    this.email = user?.email;
    this.role = user?.role;
    this.group = user?.group;
    this.gender = user?.gender;
    this.name = user?.name;
    this.password = user?.password;
    this.hp = user?.hp || '';
    this.birthdate = user?.birthdate || '';
    this.adr = user?.adr;
    this.adrDetail = user?.adrDetail;
    this.visitCount = user?.visitCount || 0;
    this.studiosAdminList = user?.studiosAdminList || [];
  }
}

const customKey = ['role', 'group', 'hp'];
const exceptKey = [
  'id',
  'createdAt',
  'password',
  'createdIP',
  'createdBy',
  'createdID',
  'updatedAt',
  'updatedID',
  'updatedIP',
  'updatedBy',
  'sortOrder',
  'viewCnt',
  'status',
  'isShow',
  'isDel',
  'uploadKey',
  'adr',
  'adrDetail',
  'visitCount',
  'studiosAdminList',
];

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - hp
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         password:
 *           type: string
 *         hp:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the object was added
 */
export class User {
  id: string = '';
  email: string = '';
  name: string = '';
  hp: string = '';
  birthdate: string = '';
  group: string = 'GR0200';
  gender: string;
  role: string = 'USR';
  status: string = 'ENABLE';
  isShow: string = 'Y';
  isDel: string = 'N';
  sortOrder: number = 0;
  uploadKey: string = '';
  adr: string;
  adrDetail: string;
  visitCount: number;
  studiosAdminList: string[];

  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(user: UserDTO, id: string, footPrint: any) {
    this.id = id;
    this.email = user.email;
    this.name = user.name;
    this.hp = user.hp;
    this.birthdate = user?.birthdate || '';
    this.group = user.group ?? 'GR0200';
    this.gender = user?.gender || '';
    this.role = user.role ?? 'USR';
    this.adr = user?.adr || '';
    this.adrDetail = user?.adrDetail || '';
    this.visitCount = user?.visitCount || 0;
    this.studiosAdminList = user?.studiosAdminList || [];

    if (footPrint.createdAt) this.createdAt = footPrint.createdAt;
    if (footPrint.createdID) this.createdID = footPrint.createdID;
    if (footPrint.createdIP) this.createdIP = footPrint.createdIP;
    if (footPrint.createdBy) this.createdBy = footPrint.createdBy;

    if (footPrint.updatedAt) this.updatedAt = footPrint.updatedAt;
    if (footPrint.updatedID) this.updatedID = footPrint.updatedID;
    if (footPrint.updatedIP) this.updatedIP = footPrint.updatedIP;
    if (footPrint.updatedBy) this.updatedBy = footPrint.updatedBy;
  }

  getCogParams(): object[] {
    const arrCognito: any[] = [];
    for (const [key, value] of Object.entries(this)) {
      if (!exceptKey.includes(key)) {
        if (customKey.includes(key)) {
          const cogParam = {
            Name: `custom:${key}`,
            Value: `${value}`,
          };
          arrCognito.push(cogParam);
        } else {
          if (key === 'birthdate') {
            if (value !== undefined && value !== '') {
              const cogParam = {
                Name: `${key}`,
                Value: `${value}`,
              };
              arrCognito.push(cogParam);
            }
          } else {
            const cogParam = {
              Name: `${key}`,
              Value: `${value}`,
            };
            arrCognito.push(cogParam);
          }
        }
      }
    }
    return arrCognito;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserListItem:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of your object
 */
export class UserListDTO {
  id: string = '';
  email: string = '';
  name: string = '';
  hp: string = '';
  evt: string = '';

  createdAt: number = 0;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.hp = user.hp;
    this.evt = user.evt;

    this.createdAt = user.createdAt;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<UserListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GetUserInfoReq:
 *       type: object
 *       properties:
 *         cursor:
 *           type: string
 *         limit:
 *           type: string
 *         keyword:
 *           type: string
 *         group:
 *           type: string
 *         role:
 *           type: string
 *       example:
 *         cursor: cursor
 *         limit: 6
 *         keyword: search keyword
 *         group: GR0200
 *         role: ADMIN or USR
 */
export class GetUserInfoReq {
  cursor: string;
  limit: number;
  keyword: string;
  group: string;
  role: string;

  constructor(query: any, role: string) {
    this.cursor = query.cursor;
    this.limit = query.limit;
    this.keyword = query.keyword;
    this.group = query.group;
    this.role = role;
  }
}

export class UserResponse {
  id: string;
  email: string;
  createdAt: number;
  group: string;
  name: string;
  createdBy: string;
  viewCnt: number;
  createdID: string;
  role: string;
  createdIP: string;
  sortOrder: number;
  adr: string;
  adrDetail: string;

  constructor(values: any) {
    this.id = values.id;
    this.email = values.email;
    this.name = values.name;
    this.role = values.role;
    this.group = values.group;
    this.adr = values.adr;
    this.adrDetail = values.adrDetail;
    this.viewCnt = values.viewCnt;
    this.sortOrder = values.sortOrder;
    this.createdAt = values.createdAt;
    this.createdBy = values.createdBy;
    this.createdID = values.createdID;
    this.createdIP = values.createdIP;
  }
}

export class FindIdRequest {
  name: string;
  hp: string;

  constructor(req: any) {
    this.name = req?.name;
    this.hp = req?.hp;
  }

  async valid() {
    const validationErrors = await validate(this);
    if (validationErrors.length) {
      throw validationErrors;
    } else {
      return this;
    }
  }
}

export class TempUser {
  email: string;
  code: string;
  newPassword: string;

  constructor(data: any) {
    this.email = data.email;
    this.code = data.code;
    this.newPassword = data?.newPassword || '';
  }
}

export class UserInfo {
  id: string;
  email: string;
  group: string;
  role: string;
  name: string;
  hp: string;

  constructor(headers: any) {
    this.id = headers?.decoded['cognito:username'];
    this.email = headers?.decoded['email'];
    this.group = headers?.decoded['custom:group'];
    this.role = headers?.decoded['custom:role'];
    this.name = headers?.decoded['name'] || '';
    this.hp = headers?.decoded['custom:hp'] === undefined ? '' : headers?.decoded['custom:hp'];
  }
}

export class FindUserDTO {
  studiosAdminId: string;
  email: string;
  name: string;
  constructor(req: any) {
    this.studiosAdminId = req?.studiosAdminId;
    this.email = req?.email;
    this.name = req?.name;
  }
}

export class DeleteInstructorDTO {
  instructorId: string;
  studiosAdminId: string;

  constructor(data: any) {
    this.instructorId = data?.instructorId;
    this.studiosAdminId = data?.studiosAdminId;
  }
}
