export class GetMyPageReservationList {
  cursor: string;
  limit: number;
  keyword: string;
  constructor(query: any) {
    this.cursor = query?.cursor || '';
    this.limit = query?.limit;
    this.keyword = query?.keyword || '';
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

export const enum OrderStatus {
  CANCEL = 'CANCEL',
  COMPLETE = 'COMPLETE',
  FAIL = 'FAIL',
  WAIT = 'WAIT',
  CANCELING = 'CANCELING',
  REFUSAL = 'REFUSAL',
}
