import IPlanRepository from './plan.repository';
import { S3Client } from '@aws-sdk/client-s3';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { GetPlanList, Instructor, Plan, PlanCheck } from './plan.model';
import { GetLessonList, LessonShort } from '../lesson/lesson.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class PlanRepositoryDdb implements IPlanRepository {
  private PLAN_TABLE: string = 'plan';
  private USER_TABLE: string = 'user';
  constructor(private jthor = new Jthor(config, 'DDB', true)) {}

  async findById(id: string): Promise<any> {
    const params = { TableName: this.PLAN_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async findByIdShort(planId: string): Promise<PlanCheck> {
    let params: any = {
      TableName: this.PLAN_TABLE,
      ProjectionExpression: 'id, reservationStatus',
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
}
