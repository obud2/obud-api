import IBannerRepository from './banner.repository';
import BannerRepositoryDdb from './banner.repository.ddb';
import BannerRepositoryMongo from './banner.repository.mongo';
import { Banner, BannerDTO } from './banner.model';
import { FootPrint } from '../dto/request/RequestDTO';
import { randomUUID } from 'crypto';
export default class BannerService {
  constructor(private bannerRepository: IBannerRepository = new BannerRepositoryDdb()) {}

  async create(dto: BannerDTO, footPrint: FootPrint) {
    // const id: string = randomUUID();
    const banner: Banner = new Banner(dto, dto.id, footPrint);
    return await this.bannerRepository.create(banner);
  }

  async findById(id: string) {
    const result = await this.bannerRepository.findById(id);
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    return result;
  }

  async update(dto: BannerDTO, footPrint: FootPrint) {
    const existBanner: Banner = (await this.findById(dto.id)).val;
    if (existBanner === undefined) {
      throw new Error('해당 Banner 가 존재하지 않습니다.');
    }
    const banner: Banner = new Banner(dto, dto.id, footPrint);
    banner.setCreated(existBanner);
    if (existBanner?.images[0]?.key !== banner?.images[0]?.key) {
      await this.bannerRepository.deleteS3File(existBanner.images[0].key);
    }
    if (existBanner?.images_m[0]?.key !== banner?.images_m[0]?.key) {
      await this.bannerRepository.deleteS3File(existBanner.images[0].key);
    }
    if (existBanner?.video[0]?.key !== banner?.video[0]?.key) {
      await this.bannerRepository.deleteS3File(existBanner.images[0].key);
    }
    if (existBanner?.video_m[0]?.key !== banner?.video_m[0]?.key) {
      await this.bannerRepository.deleteS3File(existBanner.images[0].key);
    }
    return await this.bannerRepository.update(banner);
  }
}
