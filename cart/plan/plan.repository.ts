import { GetPlanList, Instructor, Plan, PlanCheck } from './plan.model';
import { ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';

export default interface IPlanRepository {
  findById(id: string): Promise<any>;
  findByIdShort(planId: string): Promise<PlanCheck>;
}
