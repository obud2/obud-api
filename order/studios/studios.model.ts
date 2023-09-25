import { FootPrint, S3Image } from '../dto/request/RequestDTO';
import { IsArray, IsNotEmpty, IsString, MaxLength, MinLength, validate } from 'class-validator';

export class Studios extends FootPrint {
  id: string;
  title: string;
  contents: string;
  category: Array<string>;
  images: Array<S3Image>;
  homepage: string;
  information: string;
  parking: boolean;
  addr: string;
  addrDetail: string;
  parkingInfo: string;
  refundPolicy: string;
  serviceCenter: string;
  convenience: Array<string>;
  status: string;
  sortOrder: number;
  isShow: boolean;
  wishCount: number;

  constructor(req: any, id: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.title = req.title;
    this.contents = req.contents;
    this.category = req.category;
    this.images = req.images.reduce((prev: S3Image[], data: S3Image) => {
      const image: S3Image = new S3Image(data);
      prev.push(image);
      return prev;
    }, []);
    this.homepage = req.homepage;
    this.information = req.information;
    this.parking = req.parking;
    this.addr = req.addr;
    this.addrDetail = req.addrDetail;
    this.parkingInfo = req.parkingInfo;
    this.refundPolicy = req.refundPolicy;
    this.serviceCenter = req.serviceCenter;
    this.convenience = req.convenience;
    this.status = req?.status || 'ENABLE';
    this.sortOrder = req?.sortOrder || 1;
    this.isShow = req.isShow !== undefined ? req.isShow : false;
    this.wishCount = req?.wishCount || 0;
  }

  async changeCloneInfo() {
    this.title = this.title + ' (복제됨)';
    this.isShow = false;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     StudiosInfoDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         contents:
 *           type: string
 *         category:
 *           type: array
 *           items: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *         homepage:
 *           type: string
 *         information:
 *           type: string
 *         parking:
 *           type: boolean
 *         addr:
 *           type: string
 *         addrDetail:
 *           type: string
 *         parkingInfo:
 *           type: string
 *         refundPolicy:
 *           type: string
 *         serviceCenter:
 *           type: string
 *         convenience:
 *           type: array
 *           items:
 *             type: string
 *         isShow:
 *           type: boolean
 *       example:
 *         id : "put 에는 필수로 넣어야합니다"
 *         title: "제목"
 *         contents: "내용"
 *         category: ["category1", "category2"]
 *         images:
 *           -
 *             url: "https://example.com/image1.jpg"
 *             alt: "Image 1"
 *           -
 *             url: "https://example.com/image2.jpg"
 *             alt: "Image 2"
 *         homepage: "홈페이지"
 *         information: "이용안내"
 *         parking: true
 *         addr: "서울시"
 *         addrDetail: "상세주소"
 *         parkingInfo: "주차정보 추가안내사항"
 *         refundPolicy: "환불규정"
 *         serviceCenter: "고객센터"
 *         convenience:
 *           - "WiFi"
 *           - "Air conditioning"
 *           - "Coffee machine"
 *         isSHow: true
 */

export class StudiosDTO {
  id: string;
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;
  contents: string;
  category: Array<string>;
  images: Array<S3Image>;
  homepage: string;
  information: string;
  parking: boolean;
  addr: string;
  addrDetail: string;
  parkingInfo: string;
  refundPolicy: string;
  serviceCenter: string;
  convenience: Array<string>;
  status: string = 'ENABLE';
  sortOrder: number;
  isShow: boolean;
  wishCount: number;
  constructor(req: any) {
    this.id = req?.id || '';
    this.title = req?.title;
    this.images = req.images.reduce((prev: S3Image[], data: S3Image) => {
      const image: S3Image = new S3Image(data);
      prev.push(image);
      return prev;
    }, []);
    this.contents = req?.contents || '';
    this.category = req?.category || [];
    this.homepage = req?.homepage || '';
    this.information = req?.information || '';
    this.parking = req?.parking || false;
    this.addr = req?.addr || '';
    this.addrDetail = req?.addrDetail || '';
    this.parkingInfo = req?.parkingInfo || '';
    this.refundPolicy = req?.refundPolicy || '';
    this.serviceCenter = req?.serviceCenter || '';
    this.convenience = req?.convenience || [];
    this.sortOrder = req?.sortOrder || 1;
    this.isShow = req.isShow !== undefined ? req.isShow : false;
    this.wishCount = req?.wishCount || 0;
  }

  async valid() {
    const errors = await validate(this);
    if (errors.length) {
      throw errors;
    } else {
      return this;
    }
  }
}

export class StudiosList {
  id: string;
  title: string;
  category: Array<string>;
  sortOrder: number;
  images: S3Image[];
  isShow: boolean;
  isSpacial: boolean;
  createdAt: number;
  updatedAt?: number;
  createdBy: string;

  constructor(req: any) {
    this.id = req.id;
    this.title = req.title;
    this.category = req.category;
    this.sortOrder = req.sortOrder;
    this.images = req.images.reduce((prev: S3Image[], data: S3Image) => {
      const image: S3Image = new S3Image(data);
      prev.push(image);
      return prev;
    }, []);
    this.isShow = req.isShow;
    this.isSpacial = req.isSpacial;
    this.createdAt = req.createdAt;
    this.updatedAt = req.updatedAt;
    this.createdBy = req.createdBy;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     DataType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         before:
 *           type: number
 *         after:
 *           type: number
 *       example:
 *         id : "게시글의 ID 값, before : 이동하기전 게시물의 sortOrder 값, after : 이동한후에 게시글의 sortOrder 값"
 *         before: 5
 *         after: 1
 */
export interface StudiosDataType {
  id: string;
  before: number;
  after: number;
}

export class StudiosSortData {
  id: string;
  sortOrder: number;

  constructor(data: any) {
    this.id = data.id.S;
    this.sortOrder = parseInt(data.sortOrder.N);
  }
}

export class StudiosForLesson {
  id: string;
  title: string;
  addr: string;
  addrDetail: string;
  information: string;
  refundPolicy: string;

  constructor(data: any) {
    this.id = data.id.S;
    this.title = data.title.S;
    this.addr = data.addr.S;
    this.addrDetail = data.addrDetail.S;
    this.information = data.information.S;
    this.refundPolicy = data.refundPolicy.S;
  }
}

export class StudiosShort {
  id: string;
  title: string;

  constructor(data: any) {
    this.id = data.id.S;
    this.title = data.title.S;
  }
}
