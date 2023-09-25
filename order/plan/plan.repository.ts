import { GetPlanList, Instructor, Plan, PlanCheck } from './plan.model';
import { ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { OrderCancelDTO, OrderItem } from '../order/order.model';

export default interface IPlanRepository {
  findById(id: string): Promise<any>;
  putCurrentMember(planId: string, reservationCount: number): Promise<void>;
  putCurrentMemberAndOption(planId: string, reservationCount: number, payOptionCount: number): Promise<void>;
  putCancelCurrentMember(oderItem: OrderItem): Promise<any>;
}
