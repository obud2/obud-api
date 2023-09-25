import { Banner } from './banner.model';
import IBannerRepository from './banner.repository';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class BannerRepositoryDdb implements IBannerRepository {
  private readonly BANNER_TABLE: string = 'banner';
  constructor(
    private jthor = new Jthor(config, 'DDB', false),
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) {}

  async create(banner: Banner): Promise<any> {
    const params: any = {
      TableName: this.BANNER_TABLE,
      Item: banner,
    };
    try {
      return await this.jthor.ddbUtil.create(params);
    } catch (e: any) {
      throw e;
    }
  }

  async findById(id: string): Promise<any> {
    const params: any = { TableName: this.BANNER_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async update(banner: Banner): Promise<any> {
    const updateParams: any = {
      TableName: this.BANNER_TABLE,
      Key: { id: banner.id },
      SetData: banner,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }

  async deleteS3File(key: string): Promise<any> {
    try {
      const command: DeleteObjectCommand = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      console.log(`File ${key} deleted successfully from bucket ${config.bucket}.`);
    } catch (error) {
      console.error(`Error deleting file ${key} from bucket ${config.bucket}:`, error);
      throw error;
    }
  }
}
