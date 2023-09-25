import { GetCalendarList, GetPlanList, Instructor, Plan, PlanCheck } from './plan.model';
import { ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { UserInfo } from '../order/order.model';

export default interface IPlanRepository {
  create(plan: Plan): Promise<ResponseDTO<Plan>>;
  findByInstructor(instructor: string): Promise<ResponseSingleDTO<Instructor>>;
  getListByLesson(query: GetPlanList): Promise<any>;
  getListAllByLesson(query: GetPlanList): Promise<any>;
  findById(id: string): Promise<any>;
  update(plan: Plan): Promise<Promise<any>>;
  delete(id: string, bucket: string | string[] | undefined): Promise<any>;
  findByIdShort(planId: string): Promise<PlanCheck>;
  getListByMonth(query: GetPlanList): Promise<any>;
  getListByMonthAll(query: GetPlanList): Promise<any>;
  findCartByPlanId(id: string): Promise<Array<any>>;
  deleteCartByPlanId(id: string): Promise<Promise<any>>;
  getListByInstructor(query: GetPlanList, userInfo: UserInfo): Promise<any>;
  getListByInstructorAll(userInfo: UserInfo): Promise<any>;
  findPlanByStudios(query: GetCalendarList, lessonList: any, userInfo: any): Promise<any>;
  findPlanByStudiosAndDay(query: GetCalendarList, lessonList: any, userInfo: any): Promise<any>;
  getListByLessonAndDate(id: string, date: string): Promise<any>;
}
