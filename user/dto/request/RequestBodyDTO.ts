import { Request } from 'express';

export interface RequestBodyDTO<B> extends Request {
  body: B;
}
export interface RequestQueryDTO extends Request {
  query: UserQuery;
}

type typeCheck = 'limit' | 'group';
type UserQuery = {
  limit: string;
  group: string;
};

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
