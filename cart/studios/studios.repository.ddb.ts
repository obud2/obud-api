import { StudiosSortData, Studios, StudiosDTO, StudiosForLesson, StudiosShort } from './studios.model';
import IStudiosRepository from './studios.repository';
import { GetListRequestDTO, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { LessonShort } from '../lesson/lesson.model';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);

const TABLE_NAME = 'studios';
export default class StudiosRepositoryDdb implements IStudiosRepository {
  private readonly WISH_TABLE: string = 'wish';
  constructor(
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
    private jthor = new Jthor(config, 'DDB', true),
  ) {}

  async findByIdInfo(studiosId: string): Promise<StudiosShort> {
    let params: any = {
      TableName: TABLE_NAME,
      ProjectionExpression: 'id, title',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':value': { S: studiosId } },
    };
    try {
      const command: QueryCommand = new QueryCommand(params);
      const item = await this.jthor.docClient.send(command);
      if (item.Items.length === 0) {
        throw new Error(`Studios ID :: ${studiosId} 해당 Studios 가 존재하지 않습니다.`);
      }
      return new StudiosShort(item.Items[0]);
    } catch (e: any) {
      throw e;
    }
  }
}
