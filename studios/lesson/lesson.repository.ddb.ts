import ILessonRepository from './lesson.repository';
import { GetLessonList, Lesson, LessonShort, LessonSortData, LessonSpecialSortData } from './lesson.model';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { GetCalendarList } from '../plan/plan.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

const TABLE_NAME: string = 'lesson';

export default class LessonRepositoryDdb implements ILessonRepository {
  private readonly CART_TABLE: string = 'cart';
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  constructor(
    private jthor = new Jthor(config, 'DDB', true),
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) {}
  async create(lesson: Lesson): Promise<any> {
    const params: any = {
      TableName: TABLE_NAME,
      Item: lesson,
    };
    return await this.jthor.ddbUtil.create(params);
  }
  async getListByStudios(query: GetLessonList): Promise<any> {
    return await this.getList(query, true);
  }
  async getListAllByStudios(query: GetLessonList): Promise<any> {
    return await this.getList(query, false);
  }
  async getListSpecialByStudios(query: GetLessonList): Promise<any> {
    return await this.getSpecialList(query, true);
  }
  async getListAllSpecialByStudios(query: GetLessonList): Promise<any> {
    return await this.getSpecialList(query, false);
  }
  private async getList(query: GetLessonList, isShow: boolean = true, isSpacial: string | undefined = undefined) {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'studiosId-sortOrder-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, studiosId, lessonType, title, createdAt, updatedAt, createdBy, sortOrder, images, isShow',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'studiosId' },
      ExpressionAttributeValues: {
        ':value': query.studiosId,
      },
    };
    if (query instanceof GetCalendarList) {
      params.ProjectionExpression = 'id, title';
    }
    if (query.keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' ( contains(#title, :keyword) or contains(#content, :keyword) ) ';
      params.ExpressionAttributeNames['#title'] = 'title';
      params.ExpressionAttributeNames['#content'] = 'content';
      params.ExpressionAttributeValues[':keyword'] = query.keyword;
    }
    if (isShow) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' #isShow = :isShow ';
      params.ExpressionAttributeNames['#isShow'] = 'isShow';
      params.ExpressionAttributeValues[':isShow'] = true;
    }
    if (isSpacial) {
      let prefix: string = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' #lessonType = :lessonType ';
      params.ExpressionAttributeNames['#lessonType'] = 'lessonType';
      params.ExpressionAttributeValues[':lessonType'] = isSpacial;
    }
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }

  private async getSpecialList(query: GetLessonList, isShow: boolean = true) {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'lessonType-specialSort-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, studiosId, lessonType, title, createdAt, updatedAt, createdBy, sortOrder, specialSort, images, isShow',
      KeyConditionExpression: '#lessonType = :lessonType',
      ExpressionAttributeNames: { '#lessonType': 'lessonType' },
      ExpressionAttributeValues: {
        ':lessonType': 'Special',
      },
    };
    if (query.keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' ( contains(#title, :keyword) or contains(#content, :keyword) ) ';
      params.ExpressionAttributeNames['#title'] = 'title';
      params.ExpressionAttributeNames['#content'] = 'content';
      params.ExpressionAttributeValues[':keyword'] = query.keyword;
    }
    if (isShow) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' #isShow = :isShow ';
      params.ExpressionAttributeNames['#isShow'] = 'isShow';
      params.ExpressionAttributeValues[':isShow'] = true;
    }
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }

  async getListByHasSpecial(id: string): Promise<any> {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'studiosId-sortOrder-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, isShow, lessonType, sortOrder',
      KeyConditionExpression: '#studiosId = :studiosId ',
      FilterExpression: '#lessonType = :lessonType',
      ExpressionAttributeNames: { '#studiosId': 'studiosId', '#lessonType': 'lessonType' },
      ExpressionAttributeValues: {
        ':studiosId': id,
        ':lessonType': 'Special',
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }
  async getListByHasRegular(id: string): Promise<any> {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'studiosId-sortOrder-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, isShow, lessonType, sortOrder',
      KeyConditionExpression: '#studiosId = :studiosId ',
      FilterExpression: '#lessonType = :lessonType',
      ExpressionAttributeNames: { '#studiosId': 'studiosId', '#lessonType': 'lessonType' },
      ExpressionAttributeValues: {
        ':studiosId': id,
        ':lessonType': 'Regular',
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }
  async findById(id: string): Promise<any> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async update(lesson: Lesson): Promise<any> {
    const updateParams: any = {
      TableName: TABLE_NAME,
      Key: { id: lesson.id },
      SetData: lesson,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }

  async delete(id: string, bucket: string | string[] | undefined): Promise<any> {
    const params: any = { TableName: TABLE_NAME, Key: { id: id } };
    return await this.jthor.ddbUtil.removeItem(params, bucket);
  }

  async getSpecialListByStudiosId(query: GetLessonList, studiosList: string[]): Promise<any> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'lessonType-specialSort-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, studiosId, lessonType, title, createdAt, updatedAt, createdBy, sortOrder, specialSort, images, isShow',
      KeyConditionExpression: '#lessonType = :lessonType',
      ExpressionAttributeNames: { '#lessonType': 'lessonType' },
      ExpressionAttributeValues: {
        ':lessonType': 'Special',
      },
    };
    const studiosExpressionValues: any = {};

    studiosList.forEach((studioId, index) => {
      const placeholder: string = `:studio${index}`;
      studiosExpressionValues[placeholder] = studioId;
    });

    const studiosExpression: string = studiosList.map((_, index) => `#studio = :studio${index}`).join(' OR ');

    params.FilterExpression = `(${studiosExpression})`;
    params.ExpressionAttributeNames['#studio'] = 'studiosId';
    params.ExpressionAttributeValues = {
      ...params.ExpressionAttributeValues,
      ...studiosExpressionValues,
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }

  async copyS3File(image: any, uuid: string): Promise<any> {
    const params: any = {
      Bucket: config.bucket,
      ACL: 'public-read',
      CopySource: `/${config.bucket}/${image.key}`,
      Key: `lesson/lesson_${uuid}`,
    };
    const command: CopyObjectCommand = new CopyObjectCommand(params);
    try {
      await this.s3Client.send(command);
      console.log('File copied successfully.');
    } catch (error) {
      console.log('Error copying file:', error);
      throw error;
    }
    return params;
  }

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

  async getLastSortOrder(studiosId: string): Promise<number | undefined> {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'studiosId-sortOrder-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, sortOrder',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'studiosId' },
      ExpressionAttributeValues: { ':value': { S: studiosId } },
      Limit: 1,
    };
    const command: QueryCommand = new QueryCommand(params);
    const item = await this.jthor.docClient.send(command);
    if (item.Items[0]) {
      return parseInt(item.Items[0].sortOrder.N);
    } else {
      return undefined;
    }
  }

  async getLastSpecialSort(): Promise<number | undefined> {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'lessonType-specialSort-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, specialSort',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'lessonType' },
      ExpressionAttributeValues: { ':value': { S: 'Special' } },
      Limit: 1,
    };
    const command: QueryCommand = new QueryCommand(params);
    const item = await this.jthor.docClient.send(command);
    if (item.Items[0]) {
      return parseInt(item.Items[0].specialSort.N);
    } else {
      return undefined;
    }
  }

  async findSortList(id: string, max: number, min: number, studiosId: string): Promise<LessonSortData[]> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'studiosId-sortOrder-index',
      ProjectionExpression: 'id, studiosId, sortOrder',
      KeyConditionExpression: '#studiosId = :studiosId and sortOrder BETWEEN :start and :end',
      ExpressionAttributeNames: {
        '#studiosId': 'studiosId',
      },
      ExpressionAttributeValues: {
        ':studiosId': { S: studiosId },
        ':start': { N: min.toString() },
        ':end': { N: max.toString() },
      },
    };
    let items: any,
      scanResults: LessonSortData[] = [];
    do {
      const command: QueryCommand = new QueryCommand(params);
      items = await this.jthor.ddb.send(command);
      items?.Items?.forEach((item: LessonSortData) => {
        const items: LessonSortData = new LessonSortData(item);
        scanResults.push(items);
      });
      params.ExclusiveStartKey = items?.LastEvaluatedKey;
    } while (typeof items?.LastEvaluatedKey !== 'undefined');
    return scanResults;
  }

  async findSpecialSortList(id: string, max: number, min: number): Promise<LessonSpecialSortData[]> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'lessonType-specialSort-index',
      ProjectionExpression: 'id, specialSort',
      KeyConditionExpression: '#lessonType = :lessonType and specialSort BETWEEN :start and :end',
      ExpressionAttributeNames: {
        '#lessonType': 'lessonType',
      },
      ExpressionAttributeValues: {
        ':lessonType': { S: 'Special' },
        ':start': { N: min.toString() },
        ':end': { N: max.toString() },
      },
    };
    let items: any,
      scanResults: LessonSpecialSortData[] = [];
    do {
      const command: QueryCommand = new QueryCommand(params);
      items = await this.jthor.ddb.send(command);
      items?.Items?.forEach((item: LessonSpecialSortData) => {
        const items: LessonSpecialSortData = new LessonSpecialSortData(item);
        scanResults.push(items);
      });
      params.ExclusiveStartKey = items?.LastEvaluatedKey;
    } while (typeof items?.LastEvaluatedKey !== 'undefined');
    return scanResults;
  }

  async sorting(item: LessonSortData): Promise<void> {
    const params: any = {
      TableName: TABLE_NAME,
      Key: {
        id: {
          S: item.id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'sortOrder', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          N: item.sortOrder.toString(),
        }, // 수정할 컬럼값 설정
      },
      ReturnValues: 'NONE',
    };
    const command: UpdateItemCommand = new UpdateItemCommand(params);
    return await this.jthor.ddb.send(command);
  }

  async specialSorting(item: LessonSpecialSortData): Promise<void> {
    const params: any = {
      TableName: TABLE_NAME,
      Key: {
        id: {
          S: item.id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'specialSort', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          N: item.specialSort.toString(),
        }, // 수정할 컬럼값 설정
      },
      ReturnValues: 'NONE',
    };
    const command: UpdateItemCommand = new UpdateItemCommand(params);
    return await this.jthor.ddb.send(command);
  }

  async findCartByLessonId(id: string): Promise<any> {
    const params: any = {
      TableName: this.CART_TABLE,
      IndexName: 'lessonId-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'lessonId' },
      ExpressionAttributeValues: {
        ':value': id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async findOrderItemByLessonId(id: string): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'lessonId-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'lessonId' },
      ExpressionAttributeValues: {
        ':value': id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async updateCartByLessonId(id: string, lesson: Lesson) {
    const params: any = {
      TableName: this.CART_TABLE,
      Key: {
        id: {
          S: id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue, #columnName2 = :columnValue2`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'lessonTitle', // 수정할 컬럼명 설정
        '#columnName2': 'lessonImages', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          S: lesson.title,
        }, // 수정할 컬럼값 설정
        ':columnValue2': await this.convert(lesson.images),
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      return await this.jthor.ddb.send(command);
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  async updateOrderItemByLessonId(id: string, lesson: Lesson): Promise<void> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Key: {
        id: {
          S: id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue, #columnName2 = :columnValue2`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'lessonTitle', // 수정할 컬럼명 설정
        '#columnName2': 'images', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          S: lesson.title,
        }, // 수정할 컬럼값 설정
        ':columnValue2': await this.convertMap(lesson.images),
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      return await this.jthor.ddb.send(command);
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  private async convert(images: any): Promise<any> {
    const imageList = images.map((image: any) => ({
      M: {
        key: { S: image.key },
        name: { S: image.name },
        size: { N: image.size.toString() },
        type: { S: image.type },
        upload: { BOOL: image.upload },
        url: { S: image.url },
      },
    }));
    return {
      L: imageList,
    };
  }

  private async convertMap(images: any): Promise<any> {
    const image: any = images[0];
    return {
      M: {
        key: { S: image.key },
        name: { S: image.name },
        size: { N: image.size.toString() },
        type: { S: image.type },
        upload: { BOOL: image.upload },
        url: { S: image.url },
      },
    };
  }
  async findByIdStudiosId(lesson: string): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id: lesson },
      ProjectionExpression: 'id, studiosId',
    };
    return await this.jthor.ddbUtil.getInfo(params);
  }
}
