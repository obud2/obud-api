import { Banner } from './banner.model';

export default interface IBannerRepository {
  create(banner: Banner): Promise<any>;
  findById(id: string): Promise<any>;
  update(banner: Banner): Promise<any>;
  deleteS3File(key: string): Promise<any>;
}
