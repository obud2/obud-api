import { IsNotEmpty, IsString, MaxLength, MinLength, validate } from 'class-validator';
import { FootPrint, S3Image } from '../dto/request/RequestDTO';
export class Banner extends FootPrint {
  id: string;
  bannerType: BannerType;
  images: S3Image[];
  images_m: S3Image[];
  video: S3Image[];
  video_m: S3Image[];
  status: string = 'ENABLE';

  constructor(data: any, id: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.bannerType = data?.bannerType || BannerType.IMAGE;
    this.images = data?.images || [];
    this.images_m = data?.images_m || [];
    this.video = data?.video || [];
    this.video_m = data?.video_m || [];
  }
}

export enum BannerType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

/**
 * @swagger
 * components:
 *   schemas:
 *     BannerDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "abc123"
 *         bannerType:
 *           type: string
 *           example: "IMAGE"
 *         images:
 *           type: array
 *           items:
 *             type: object
 *         images_m:
 *           type: array
 *           items:
 *             type: object
 *         video:
 *           type: array
 *           items:
 *             type: object
 *         video_m:
 *           type: array
 *           items:
 *             type: object
 *         status:
 *           type: string
 *           example: "ENABLE"
 */
export class BannerDTO {
  id: string;
  @IsNotEmpty()
  bannerType: BannerType;
  images: S3Image[];
  images_m: S3Image[];
  video: S3Image[];
  video_m: S3Image[];
  status: string = 'ENABLE';
  constructor(data: any) {
    this.id = data?.id || '';
    this.bannerType = data?.bannerType || BannerType.IMAGE;
    this.images = data?.images || [];
    this.images_m = data?.images_m || [];
    this.video = data?.video || [];
    this.video_m = data?.video_m || [];
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
