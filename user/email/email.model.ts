/**
 * @swagger
 * components:
 *   schemas:
 *     EmailDTO:
 *       type: object
 *       properties:
 *         toEmail:
 *           type: string
 *           description: 수신자 이메일 주소
 *         subject:
 *           type: string
 *           description: 메일 제목
 *         message:
 *           type: string
 *           description: 메일 본문 내용
 *         name:
 *           type: string
 *           description: 수신자 이름
 *       example:
 *         toEmail: "수신자의 이메일 주소"
 */
export class EmailDTO {
  toEmail: string = '';
  subject: string = '';
  message: string = '';
  name: string = '';
  code: string = '';

  constructor(email: any) {
    this.toEmail = email?.toEmail;
    this.subject = email?.subject;
    this.message = email?.message;
    this.name = email?.name;
    this.code = email?.code;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckDTO:
 *       type: object
 *       properties:
 *         toEmail:
 *           type: string
 *           description: 수신자 이메일 주소
 *         code:
 *           type: string
 *           description: 받은 인증 코드
 *       example:
 *         toEmail: "수신자의 이메일 주소"
 */
export class CheckDTO {
  toEmail: string = '';
  code: string = '';

  constructor(email: any) {
    this.toEmail = email?.toEmail;
    this.code = email?.code;
  }
}

export class SetPwDTO {
  id: string;
  code: string;
  newPassword: string;

  constructor(data: any) {
    this.id = data?.id || '';
    this.code = data?.code || '';
    this.newPassword = data?.newPassword || '';
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Verify:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 수신자 이메일 주소
 *         code:
 *           type: string
 *           description: 인증 코드
 *       example:
 *         toEmail: "수신자의 이메일 주소"
 */
export class Verify {
  id: string = '';
  code: string = '';
  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(verify: CheckDTO, footpint: any) {
    this.id = verify?.toEmail;
    this.code = verify?.code;

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
