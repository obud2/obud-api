import ISearchRepository from './search.repository';
import { SearchDTO } from './search.model';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class SearchRepositoryDdb implements ISearchRepository {
  private readonly STUDIOS_TABLE: string = 'studios';
  private readonly LESSON_TABLE: string = 'lesson';
  private PLAN_TABLE: string = 'plan';
  private KEYWORD_TABLE: string = 'keyword';
  constructor(private jthor = new Jthor(config, 'DDB', true)) {}
  async findStudiosByKeyword(query: SearchDTO): Promise<any> {
    const params: any = {
      TableName: this.STUDIOS_TABLE,
      IndexName: 'status-sortOrder-index',
      ProjectionExpression: 'id, category, title, sortOrder, images, isShow, createdAt, updatedAt, createdBy, addr, addrDetail',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      FilterExpression: 'contains(#title, :keyword) or contains(#addr, :keyword) or contains(#category, :keyword) AND #isShow = :isShow',
      ExpressionAttributeNames: {
        '#key': 'status',
        '#title': 'title',
        '#addr': 'addr',
        '#category': 'category',
        '#isShow': 'isShow',
      },
      ExpressionAttributeValues: { ':value': 'ENABLE', ':keyword': query.keyword, ':isShow': true },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }
  // async findLessonByKeyword(query: SearchDTO): Promise<any> {
  //   const params: any = {
  //     TableName: this.LESSON_TABLE,
  //     IndexName: 'lessonType-specialSort-index',
  //     ProjectionExpression: 'id, studiosId, lessonType, title, createdAt, updatedAt, createdBy, sortOrder, specialSort, images, isShow',
  //     ScanIndexForward: false,
  //     KeyConditionExpression: '#lessonType = :lessonType',
  //     FilterExpression: 'contains(#title, :keyword) or contains(#content, :keyword) AND #isShow = :isShow',
  //     ExpressionAttributeNames: {
  //       '#lessonType': 'lessonType',
  //       '#title': 'title',
  //       '#content': 'content',
  //       '#isShow': 'isShow',
  //     },
  //     ExpressionAttributeValues: { ':lessonType': 'Special', ':keyword': query.keyword, ':isShow': true },
  //   };
  //   return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  // }
  async findPlanByStartDate(query: SearchDTO): Promise<any> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'status-startDate-index',
      ProjectionExpression: 'id, lessonId',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value and begins_with(#start, :start)',
      FilterExpression: '#isShow = :isShow',
      ExpressionAttributeNames: { '#key': 'status', '#start': 'startDate', '#isShow': 'isShow' },
      ExpressionAttributeValues: {
        ':value': 'ENABLE',
        ':start': query.date,
        ':isShow': true,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }
  async findLessonById(lessonId: string): Promise<any> {
    const params = {
      TableName: this.LESSON_TABLE,
      Key: { id: lessonId },
      ProjectionExpression: 'id, studiosId',
    };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async findStudiosById(studiosId: string): Promise<any> {
    const params = {
      TableName: this.STUDIOS_TABLE,
      Key: { id: studiosId },
      ProjectionExpression: 'id, category, title, sortOrder, images, isShow, createdAt, updatedAt, createdBy, addr, addrDetail',
    };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async pushKeyword(keyword: string): Promise<void> {
    const updateParams = {
      TableName: this.KEYWORD_TABLE,
      Key: {
        id: keyword,
      },
      UpdateExpression: 'set #val = if_not_exists(#val, :def) + :inc , #status = :status',
      ExpressionAttributeNames: {
        '#val': 'val',
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':def': 0,
        ':inc': 1,
        ':status': 'ENABLE',
      },
      ReturnValues: 'UPDATED_NEW',
    };
    const updateRes = await this.jthor.docClient.send(new UpdateCommand(updateParams));
  }

  async getKeywordList(): Promise<any> {
    const params: any = {
      TableName: this.KEYWORD_TABLE,
      IndexName: 'status-val-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'status' },
      ExpressionAttributeValues: {
        ':value': 'ENABLE',
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', undefined, 6);
  }
}
