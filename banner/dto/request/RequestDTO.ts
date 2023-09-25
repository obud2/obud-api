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

/**
 * @swagger
 * components:
 *   schemas:
 *     S3Image:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           example: "abc123"
 *         name:
 *           type: string
 *           example: "image.jpg"
 *         size:
 *           type: number
 *           example: 1024
 *         type:
 *           type: string
 *           example: "image/jpeg"
 *         upload:
 *           type: boolean
 *           example: true
 *         url:
 *           type: string
 *           example: "https://example.com/images/image.jpg"
 */
export class S3Image {
  key: string;
  name: string;
  size: number;
  type: string;
  upload: boolean;
  url: string;

  constructor(image: S3Image) {
    this.key = image.key;
    this.name = image.name;
    this.size = image.size;
    this.type = image?.type || 'image/jpeg';
    this.upload = image.upload;
    this.url = image.url;
  }
}

export class ResponseDTO<T> {
  result: string = '';
  message: string = '';
  val: Array<T> = [];
  cursor: string = '';
  backCursor: string = '';
}

export class ResponseSingleDTO<T> {
  result: string = '';
  message: string = '';
  val?: T;
  cursor: string = '';
  backCursor: string = '';
}
