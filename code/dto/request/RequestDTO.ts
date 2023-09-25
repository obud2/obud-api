export class FootPrint {
  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(footPrint: any) {
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

export class GetListRequestDTO {
  cursor: string;
  limit: number;
  keyword: string;

  constructor(query: any) {
    this.cursor = query.cursor;
    this.limit = query.limit;
    this.keyword = query.keyword;
  }
}

export class ResponseDTO<T> {
  result: string = '';
  message: string = '';
  val: Array<T> = [];
  cursor: string = '';
  backCursor: string = '';
}
