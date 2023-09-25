const moment = require('moment');
require('moment-timezone');

const VERSION = '1.0.0';
const SUCCESS = 'success';
const FAIL = 'fail';

export class AuthDTO implements Partial<Auth> {}

export class Auth {
  constructor() {}
}

export class AuthListDTO {
  constructor() {}
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: string = '';
  cursor: string = '';
  backCursor: string = '';

  constructor(result: string) {
    this.val = result;
  }
}

export class ResponseFail {
  version: string = VERSION;
  status: string = FAIL;
  code: number = 500;
  datetime: any = moment().format('YYYY-MM-DD HH:mm:ss');
  url: string = '';
  message: string = FAIL;
  value: object = {};
  count: number = 0;
  total: number = 0;
  originalUrl: string = '';
}
