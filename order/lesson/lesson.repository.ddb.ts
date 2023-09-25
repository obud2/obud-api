import ILessonRepository from './lesson.repository';
import { GetLessonList, Lesson, LessonShort, LessonSortData, LessonSpecialSortData } from './lesson.model';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

const TABLE_NAME: string = 'lesson';

export default class LessonRepositoryDdb implements ILessonRepository {
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
  async findByIdInfo(lessonId: string): Promise<LessonShort> {
    let params: any = {
      TableName: TABLE_NAME,
      ProjectionExpression: 'id, title, studiosId, images',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':value': { S: lessonId } },
    };
    try {
      const command: QueryCommand = new QueryCommand(params);
      const item = await this.jthor.docClient.send(command);
      if (item.Items.length === 0) {
        throw new Error(`Lesson ID :: ${lessonId} 해당 Lesson 이 존재하지 않습니다.`);
      }
      return new LessonShort(item.Items[0]);
    } catch (e: any) {
      throw e;
    }
  }

  async findById(id: string): Promise<any> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
}
