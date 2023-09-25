import IPlanRepository from './plan.repository';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ReservationStatus } from './plan.model';
import { OrderItem } from '../order/order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export default class PlanRepositoryDdb implements IPlanRepository {
  private PLAN_TABLE: string = 'plan';
  private USER_TABLE: string = 'user';
  constructor(private jthor = new Jthor(config, 'DDB', false)) {}

  async findById(id: string): Promise<any> {
    const params = { TableName: this.PLAN_TABLE, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async putCurrentMember(planId: string, reservationCount: number): Promise<void> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      Key: {
        id: { S: planId },
      },
      UpdateExpression: 'SET currentMember = currentMember + :currentMember',
      ExpressionAttributeValues: {
        ':currentMember': { N: reservationCount.toString() },
        // ':impossible': { S: ReservationStatus.RESERVATION_IMPOSSIBLE },
      },
      ReturnValues: 'ALL_NEW',
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      const newPlan = await this.jthor.ddb.send(command);
      if (parseInt(newPlan.Attributes.currentMember.N) >= parseInt(newPlan.Attributes.maxMember.N)) {
        await this.planStatusUpdate(planId, ReservationStatus.RESERVATION_IMPOSSIBLE);
      }
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async putCurrentMemberAndOption(planId: string, reservationCount: number, payOptionCount: number): Promise<void> {
    const params = {
      TableName: this.PLAN_TABLE,
      Key: {
        id: { S: planId },
      },
      UpdateExpression:
        'SET currentMember = currentMember + :currentMember, payOption.currentMember = if_not_exists(payOption.currentMember, :def) + :optionMember',
      ExpressionAttributeValues: {
        ':currentMember': { N: reservationCount.toString() },
        ':optionMember': { N: payOptionCount.toString() },
        ':def': { N: '0' },
        // ':impossible': { S: ReservationStatus.RESERVATION_IMPOSSIBLE },
      },
      ReturnValues: 'ALL_NEW',
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      const newPlan = await this.jthor.ddb.send(command);
      if (parseInt(newPlan.Attributes.currentMember.N) >= parseInt(newPlan.Attributes.maxMember.N)) {
        await this.planStatusUpdate(planId, ReservationStatus.RESERVATION_IMPOSSIBLE);
      }
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  private async planStatusUpdate(planId: string, status: ReservationStatus) {
    const params = {
      TableName: this.PLAN_TABLE,
      Key: {
        id: { S: planId },
      },
      UpdateExpression: 'SET reservationStatus = :status',
      ExpressionAttributeValues: {
        ':status': { S: status },
      },
    };
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      await this.jthor.ddb.send(command);
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }

  async putCancelCurrentMember(orderItem: OrderItem): Promise<any> {
    const params: any = {
      TableName: this.PLAN_TABLE,
      Key: {
        id: { S: orderItem.planId },
      },
      UpdateExpression: 'SET currentMember = currentMember - :currentMember',
      ExpressionAttributeValues: {
        ':currentMember': { N: orderItem.reservationCount.toString() },
        // ':impossible': { S: ReservationStatus.RESERVATION_IMPOSSIBLE },
      },
      ReturnValues: 'ALL_NEW',
    };

    if (orderItem.payOptionCount) {
      params.UpdateExpression += ', payOption.currentMember = if_not_exists(payOption.currentMember, :def) - :optionMember';
      params.ExpressionAttributeValues[':optionMember'] = { N: orderItem.payOptionCount.toString() };
      params.ExpressionAttributeValues[':def'] = { N: '0' };
    }
    try {
      const command: UpdateItemCommand = new UpdateItemCommand(params);
      const plan = await this.jthor.ddb.send(command);
      const beforeMember: number = parseInt(plan.Attributes.currentMember.N) + orderItem.reservationCount;
      if (
        beforeMember >= parseInt(plan.Attributes.maxMember.N) &&
        plan.Attributes.reservationStatus.S === ReservationStatus.RESERVATION_IMPOSSIBLE
      ) {
        await this.planStatusUpdate(orderItem.planId, ReservationStatus.RESERVATION_POSSIBLE);
      }
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }
}
