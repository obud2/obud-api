import IPlanRepository from './plan.repository';
import { S3Client } from '@aws-sdk/client-s3';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { GetCalendarList, GetPlanList, Instructor, Plan, PlanCheck } from './plan.model';
import { GetLessonList, LessonShort } from '../lesson/lesson.model';
import { UserInfo } from '../order/order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class PlanRepositoryDdb implements IPlanRepository {
  private readonly PLAN_TABLE: string = 'plan';
  private readonly USER_TABLE: string = 'user';
  private readonly CART_TABLE: string = 'cart';
  constructor(private jthor = new Jthor(config, 'DDB', true)) {}
  async create(plan: Plan): Promise<ResponseDTO<Plan>> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      Item: plan,
    };
    try {
      return await this.jthor.ddbUtil.create(params);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }
  async update(plan: Plan): Promise<Promise<any>> {
    const updateParams: any = {
      TableName: this.PLAN_TABLE,
      Key: { id: plan.id },
      SetData: plan,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }
  async findByInstructor(instructor: string): Promise<ResponseSingleDTO<Instructor>> {
    const params = { TableName: this.USER_TABLE, Key: { id: instructor } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async getListByLesson(query: GetPlanList): Promise<any> {
    return await this.getList(query, true);
  }
  async getListAllByLesson(query: GetPlanList): Promise<any> {
    return await this.getList(query, false);
  }

  async getListByMonth(query: GetPlanList): Promise<any> {
    return await this.getListByMonthFunc(query);
  }

  async getListByMonthAll(query: GetPlanList): Promise<any> {
    return await this.getListByMonthFunc(query, false);
  }

  private async getListByMonthFunc(query: GetPlanList, isShow: boolean = true) {
    let params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'lessonId-startDate-index',
      ScanIndexForward: false,
      ProjectionExpression:
        'id, title, startDate, endDate, price, currentMember, maxMember, instructor, reservationStatus, payOption, fakePrice',
      KeyConditionExpression: '#key = :value and begins_with(#start, :start)',
      ExpressionAttributeNames: { '#key': 'lessonId', '#start': 'startDate' },
      ExpressionAttributeValues: {
        ':value': query.lessonId,
        ':start': query.date,
      },
    };
    if (query.keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' ( contains(#instructor, :keyword) ) ';
      params.ExpressionAttributeNames['#instructor'] = 'instructor';
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

  async getListByInstructor(query: GetPlanList, userInfo: UserInfo): Promise<any> {
    let params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'instructor-startDate-index',
      ScanIndexForward: false,
      ProjectionExpression:
        'id, title, startDate, endDate, price, currentMember, maxMember, instructor, reservationStatus, payOption, lessonId',
      KeyConditionExpression: '#key = :value and begins_with(#start, :start)',
      ExpressionAttributeNames: { '#key': 'instructor', '#start': 'startDate' },
      ExpressionAttributeValues: {
        ':value': userInfo.id,
        ':start': query.date,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }

  async getListByInstructorAll(userInfo: UserInfo): Promise<any> {
    let params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'instructor-startDate-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, lessonId',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'instructor' },
      ExpressionAttributeValues: {
        ':value': userInfo.id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  private async getList(query: GetPlanList, isShow: boolean = true) {
    const params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'lessonId-startDate-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, title, startDate, endDate, price, currentMember, maxMember, instructor, reservationStatus, payOption',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'lessonId' },
      ExpressionAttributeValues: {
        ':value': query.lessonId,
      },
    };
    if (query.keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' ( contains(#instructor.#name, :keyword) ) ';
      params.ExpressionAttributeNames['#instructor'] = 'instructor';
      params.ExpressionAttributeNames['#name'] = 'name';
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

  async findById(id: string): Promise<any> {
    const params = { TableName: this.PLAN_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async delete(id: string, bucket: string | string[] | undefined): Promise<any> {
    const params: any = { TableName: this.PLAN_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.removeItem(params, bucket);
  }

  async findByIdShort(planId: string): Promise<PlanCheck> {
    let params: any = {
      TableName: this.PLAN_TABLE,
      ProjectionExpression: 'id, maxMember, currentMember',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':value': { S: planId } },
    };
    try {
      const command: QueryCommand = new QueryCommand(params);
      const item = await this.jthor.docClient.send(command);
      if (item.Items.length === 0) {
        throw new Error(`Lesson ID :: ${planId} 해당 Lesson 이 존재하지 않습니다.`);
      }
      return new PlanCheck(item.Items[0]);
    } catch (e: any) {
      throw e;
    }
  }

  async findCartByPlanId(id: string): Promise<any[]> {
    const params: any = {
      TableName: this.CART_TABLE,
      IndexName: 'planId-createdID-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'planId' },
      ExpressionAttributeValues: {
        ':value': id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async deleteCartByPlanId(id: string): Promise<any> {
    const params: any = { TableName: this.CART_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.removeItem(params);
  }

  async findPlanByStudios(query: GetCalendarList, lessonList: any, userInfo: any): Promise<any> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'status-startDate-index',
      ScanIndexForward: true,
      ProjectionExpression: 'id, lessonId, startDate, currentMember, maxMember',
      KeyConditionExpression: `#key = :key and begins_with(#start, :start)`,
      ExpressionAttributeNames: { '#key': 'status', '#start': 'startDate' },
      ExpressionAttributeValues: { ':key': 'ENABLE', ':start': query.date },
    };
    if (userInfo) {
      params.IndexName = 'instructor-startDate-index';
      params.ExpressionAttributeNames['#key'] = 'instructor';
      params.ExpressionAttributeValues[':key'] = userInfo.id;
    }
    if (lessonList) {
      const lessonExpressionValues: any = {};
      lessonList.forEach((lesson: any, index: number) => {
        lessonExpressionValues[`:lesson${index}`] = lesson.id;
      });
      params.FilterExpression = lessonList.map((_: string, index: number) => `#lesson = :lesson${index}`).join(` OR `);
      params.ExpressionAttributeNames['#lesson'] = 'lessonId';
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        ...lessonExpressionValues,
      };
    } else {
      params.FilterExpression = `#lesson = :lesson`;
      params.ExpressionAttributeNames[`#lesson`] = 'lessonId';
      params.ExpressionAttributeValues[':lesson'] = query.lessonId;
    }
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async findPlanByStudiosAndDay(query: GetCalendarList, lessonList: any, userInfo: any): Promise<any> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'status-startDate-index',
      ScanIndexForward: true,
      KeyConditionExpression: `#key = :key and begins_with(#start, :start)`,
      ExpressionAttributeNames: { '#key': 'status', '#start': 'startDate' },
      ExpressionAttributeValues: { ':key': 'ENABLE', ':start': query.date },
    };
    if (userInfo) {
      params.IndexName = 'instructor-startDate-index';
      params.ExpressionAttributeNames['#key'] = 'instructor';
      params.ExpressionAttributeValues[':key'] = userInfo.id;
    }
    if (lessonList) {
      const lessonExpressionValues: any = {};
      lessonList.forEach((lesson: any, index: number) => {
        lessonExpressionValues[`:lesson${index}`] = lesson.id;
      });
      params.FilterExpression = lessonList.map((_: string, index: number) => `#lesson = :lesson${index}`).join(` OR `);
      params.ExpressionAttributeNames['#lesson'] = 'lessonId';
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        ...lessonExpressionValues,
      };
    } else {
      params.FilterExpression = `#lesson = :lesson`;
      params.ExpressionAttributeNames[`#lesson`] = 'lessonId';
      params.ExpressionAttributeValues[':lesson'] = query.lessonId;
    }
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async getListByLessonAndDate(lessonId: string, date: string): Promise<any> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      IndexName: 'lessonId-startDate-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, startDate, currentMember, maxMember, reservationStatus, price',
      KeyConditionExpression: '#key = :value AND #startDate > :date',
      FilterExpression: '#isShow = :isShow AND #reservationStatus = :reservationStatus',
      ExpressionAttributeNames: {
        '#key': 'lessonId',
        '#startDate': 'startDate',
        '#isShow': 'isShow',
        '#reservationStatus': 'reservationStatus',
      },
      ExpressionAttributeValues: {
        ':value': lessonId,
        ':date': date,
        ':isShow': true,
        ':reservationStatus': 'possible',
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }
}
