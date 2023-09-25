import IPlanRepository from './plan.repository';
import LessonRepositoryDdb from '../lesson/lesson.repository.ddb';
import { GetCalendarList, GetPlanList, Instructor, MultiDTO, Plan, PlanDTO, ReservationStatus, UpdatePlanDTO } from './plan.model';
import { FootPrint, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { randomUUID } from 'crypto';
import { Lesson, LessonShort } from '../lesson/lesson.model';
import ILessonRepository from '../lesson/lesson.repository';
import PlanRepositoryDdb from './plan.repository.ddb';
import IOrderRepository from '../order/order.repository';
import OrderRepositoryDdb from '../order/order.repository.ddb';
import { InstructorSet, UserInfo } from '../order/order.model';
import axios from 'axios';
import { API_URL, THIS_IS_ME } from '../constant';
import { StudiosShort } from '../studios/studios.model';
import IStudiosRepository from '../studios/studios.repository';
import StudiosRepositoryDdb from '../studios/studios.repository.ddb';
import { differenceInMonths, eachDayOfInterval, format, getDay, isBefore, parse } from 'date-fns';

export default class PlanService {
  constructor(
    private studiosRepository: IStudiosRepository = new StudiosRepositoryDdb(),
    private planRepositoryDdb: IPlanRepository = new PlanRepositoryDdb(),
    private lessonRepository: ILessonRepository = new LessonRepositoryDdb(),
    private orderRepository: IOrderRepository = new OrderRepositoryDdb(),
  ) {}

  async create(dto: PlanDTO, footPrint: FootPrint): Promise<ResponseDTO<Plan>> {
    const existLesson: ResponseSingleDTO<Lesson> = await this.lessonRepository.findById(dto.lessonId);
    if (existLesson.val === undefined) {
      throw new Error('해당 클래스의 아이디가 존재하지 않습니다.');
    }
    const id: string = randomUUID();
    const plan: Plan = new Plan(dto, id, footPrint);
    if (plan.payOption?.title === undefined) {
      plan.payOption = {};
    }
    await this.validByCreate(plan);
    return await this.planRepositoryDdb.create(plan);
  }

  async update(dto: UpdatePlanDTO, footPrint: FootPrint) {
    const existPlan: Plan = (await this.findById(dto.id)).val;
    if (existPlan === undefined) {
      throw new Error('해당 Plan 이 존재하지 않습니다.');
    }
    const updatePlan: any = {
      ...existPlan,
      ...dto,
    };
    const plan: Plan = new Plan(updatePlan, updatePlan.id, updatePlan);
    plan.setUpdated(footPrint);
    await this.validByUpdate(existPlan, plan);

    return await this.planRepositoryDdb.update(plan);
  }

  async clone(id: string, footPrint: FootPrint) {
    const existPlan: Plan = (await this.findById(id)).val;
    if (existPlan === undefined) {
      throw new Error('해당 Plan 이 존재하지 않습니다.');
    }
    const newId: string = randomUUID();
    const plan: Plan = new Plan(existPlan, newId, footPrint);
    plan.isShow = false;
    plan.currentMember = 0;
    return await this.planRepositoryDdb.create(plan);
  }

  async getListByLesson(query: GetPlanList) {
    const result = await this.planRepositoryDdb.getListByLesson(query);
    await this.setInstructorInfo(result);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  private async setInstructorInfo(result: any) {
    const instructorSet: Set<InstructorSet> = new Set<InstructorSet>();
    await result.val.reduce(async (promisePrev: Promise<Set<InstructorSet>>, item: any) => {
      const prev = await promisePrev;
      if (item?.instructor && item.instructor !== 'x') {
        let instVal: InstructorSet | undefined = Array.from(prev).find((instructor: InstructorSet) => {
          return instructor.id === item.instructor;
        });
        if (!instVal) {
          prev.add(await this.orderRepository.findInstructor(item.instructor));
          instVal = Array.from(prev).find((instructor: InstructorSet) => {
            return instructor.id === item.instructor;
          });
        }
        item.instructorInfo = instVal;
        return prev;
      } else {
        item.instructorInfo = {};
        return prev;
      }
    }, Promise.resolve(instructorSet));
  }

  async getListAllByLesson(query: GetPlanList) {
    const result = await this.planRepositoryDdb.getListAllByLesson(query);
    await this.setInstructorInfo(result);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getListByMonth(query: GetPlanList) {
    const result = await this.planRepositoryDdb.getListByMonth(query);
    await this.setInstructorInfo(result);
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    return result;
  }

  async getListByMonthAll(query: GetPlanList) {
    const result = await this.planRepositoryDdb.getListByMonthAll(query);
    await this.setInstructorInfo(result);
    if (result.result.toUpperCase() === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getListByInStudios(query: GetCalendarList, userInfo: UserInfo) {
    const result: any = {};
    const lessonList: any = (await this.lessonRepository.getListByStudios(query)).val;
    result.lessonList = lessonList;

    if (query.lessonId === undefined || query.lessonId === '') {
      result.sortDate = await this.findPlanByStudios(query, lessonList, undefined);
    } else if (lessonList.find((item: any) => item.id === query.lessonId)) {
      result.sortDate = await this.findPlanByLesson(query, undefined);
    } else {
      throw new Error('클래스가 해당 공간에 속해있지 않습니다.');
    }
    return result;
  }

  async getListByInStudiosAndDay(query: GetCalendarList, userInfo: UserInfo) {
    const lessonList: any = (await this.lessonRepository.getListByStudios(query)).val;
    if (query.lessonId === undefined || query.lessonId === '') {
      await this.findPlanByStudiosAndDay(query, lessonList, undefined);
    } else if (lessonList.find((item: any) => item.id === query.lessonId)) {
      const lesson = lessonList.find((item: any) => item.id === query.lessonId);
      await this.findPlanByLessonAndDay(query, lesson, undefined);
      return [lesson];
    } else {
      throw new Error('클래스가 해당 공간에 속해있지 않습니다.');
    }
    return lessonList;
  }

  async getListByInstructor(query: GetPlanList, userInfo: UserInfo) {
    const result = await this.planRepositoryDdb.getListByInstructor(query, userInfo);
    if (result.result.toUpperCase() === 'FAIL') {
      throw new Error(result.message);
    }
    const studiosList: StudiosShort[] = [];
    const lessonList: LessonShort[] = [];

    for await (const item of result.val) {
      let lesson: LessonShort | undefined = Array.from(lessonList).find((lesson: LessonShort) => lesson.id === item.lessonId);
      if (!lesson) {
        lessonList.push(await this.lessonRepository.findByIdInfo(item.lessonId));
        lesson = Array.from(lessonList).find((lesson: LessonShort) => lesson.id === item.lessonId);
      }
      await this.setLessonInfo(item, lesson);
      item.instructorInfo = userInfo;
    }
    for await (const item of result.val) {
      let studios: StudiosShort | undefined = Array.from(studiosList).find((studios: StudiosShort) => studios.id === item.studiosId);
      if (!studios) {
        studiosList.push(await this.studiosRepository.findByIdInfo(item.studiosId));
        studios = Array.from(studiosList).find((studios: StudiosShort) => studios.id === item.studiosId);
      }
      item.studiosTitle = studios?.title;
    }
    return result;
  }

  async findById(id: string) {
    const result = await this.planRepositoryDdb.findById(id);
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    if (result?.val.instructor && result.val.instructor !== 'x') {
      result.val.instructorInfo = await this.orderRepository.findInstructor(result.val.instructor);
    }
    const reservationList = await this.orderRepository.findOrderItemByPlanId(result.val.id);
    if (reservationList.result !== 'success') {
      throw new Error('예약자 정보를 불러오는데 실패하였습니다.');
    }
    result.val.reservationList = reservationList.val;
    return result;
  }

  private async validByCreate(plan: Plan) {}

  private async validByUpdate(existPlan: Plan, plan: Plan) {
    if (existPlan.instructor !== plan.instructor) {
      await this.validByCreate(plan);
    }
    if (existPlan.currentMember > 0) {
      if (existPlan.startDate !== plan.startDate || existPlan.endDate !== plan.endDate) {
        throw new Error('이미 예약한 회원이 있어 강의시간을 바꿀수 없습니다.');
      }
      if (existPlan.price !== plan.price) {
        throw new Error('이미 예약한 회원이 있어 강의가격을 바꿀수 없습니다.');
      }
      if (existPlan?.payOption?.price) {
        if (existPlan.payOption.price !== plan.payOption.price) {
          throw new Error('이미 예약한 회원이 있어 옵션의 가격을 바꿀수 없습니다.');
        }
        if (existPlan.payOption.title !== plan.payOption.title) {
          throw new Error('이미 예약한 회원이 있어 옵션의 정보를 변경할수 없습니다.');
        }
        if (existPlan.payOption.currentMember > plan.payOption.maxMember) {
          throw new Error('옵션의 최대인원을 옵션의 예약인원보다 적게 변경할수 없습니다.');
        }
      }
    }
    if (existPlan.currentMember > plan.maxMember) {
      throw new Error('최대인원을 예약자보자 적게 변경할수 없습니다.');
    }
    // 정원이 가득찬 플랜의 스테이터스가 임파서블일때 정원을 늘리면 파서블로 바뀌어야함
    if (
      existPlan.reservationStatus === ReservationStatus.RESERVATION_IMPOSSIBLE &&
      existPlan.currentMember >= existPlan.maxMember &&
      existPlan.maxMember < plan.maxMember
    ) {
      plan.reservationStatus = ReservationStatus.RESERVATION_POSSIBLE;
    }
    if (existPlan.reservationStatus === ReservationStatus.RESERVATION_POSSIBLE && existPlan.currentMember === plan.maxMember) {
      plan.reservationStatus = ReservationStatus.RESERVATION_POSSIBLE;
    }

    if (
      plan.price !== existPlan.price ||
      plan.startDate !== existPlan.startDate ||
      plan.endDate !== existPlan.endDate ||
      plan?.payOption?.price !== existPlan?.payOption?.price
    ) {
      axios.delete(`${API_URL}/studios/plan/deleteCartByPlanId/${existPlan.id}`, {
        headers: {
          'X-Internal-Request': THIS_IS_ME,
        },
      });
    }
  }

  async delete(id: string, bucket: string | string[] | undefined) {
    const existPlan: Plan = (await this.findById(id)).val;
    if (existPlan === undefined) {
      throw new Error('해당 플랜이 존재하지 않습니다.');
    }
    if (existPlan.currentMember > 0) {
      throw new Error('이미 예약한고객이 존재하여 삭제할수 없습니다.');
    }
    return await this.planRepositoryDdb.delete(id, bucket);
  }

  async deleteCartByPlanId(planId: string) {
    const cartIdList: any = await this.planRepositoryDdb.findCartByPlanId(planId);
    for await (const cart of cartIdList.val) {
      const result = await this.planRepositoryDdb.deleteCartByPlanId(cart.id);
      console.log(`LOG :: Plan :: ${planId} 의 정보가 변경되어 장바구니에서 삭제 \n CART ID :: ${cart.id} ::  RESULT :: ${result.result}`);
    }
    return {
      message: 'SUCCESS',
    };
  }

  async updateAttendance(orderItemId: string, isAttendance: boolean) {
    const result = await this.orderRepository.updateAttendance(orderItemId, isAttendance);
    return result;
  }

  async updateComment(orderItemId: string, comment: string) {
    const result = await this.orderRepository.updateComment(orderItemId, comment);
    return result;
  }

  private async setLessonInfo(item: any, lesson: LessonShort | undefined) {
    item.lessonTitle = lesson?.title || '삭제된 클래스 입니다.';
    item.studiosId = lesson?.studiosId || '레슨이 삭제되어 찾을수 없습니다.';
  }

  async getListByInStudiosAndInstructor(query: GetCalendarList, userInfo: UserInfo) {
    const result: any = {};
    const planList = (await this.planRepositoryDdb.getListByInstructorAll(userInfo)).val;
    const lessonIdList: Array<string> = await this.organizeLessonId(planList);
    const lessonList: any = await this.findLessonByInstructor(lessonIdList, query.studiosId);
    result.lessonList = lessonList;
    if (query.lessonId === undefined || query.lessonId === '') {
      result.sortDate = await this.findPlanByStudios(query, lessonList, userInfo);
    } else if (lessonList.find((item: any) => item.id === query.lessonId)) {
      result.sortDate = await this.findPlanByLesson(query, userInfo);
    } else {
      throw new Error('클래스가 해당 공간에 속해있지 않습니다.');
    }
    return result;
  }

  async getListByInStudiosAndInstructorAndDay(query: GetCalendarList, userInfo: UserInfo) {
    const planList = (await this.planRepositoryDdb.getListByInstructorAll(userInfo)).val;
    const lessonIdList: Array<string> = await this.organizeLessonId(planList);
    const lessonList: any = await this.findLessonByInstructor(lessonIdList, query.studiosId);
    if (query.lessonId === undefined || query.lessonId === '') {
      await this.findPlanByStudiosAndDay(query, lessonList, userInfo);
    } else if (lessonList.find((item: any) => item.id === query.lessonId)) {
      const lesson = lessonList.find((item: any) => item.id === query.lessonId);
      await this.findPlanByLessonAndDay(query, lesson, userInfo);
      return [lesson];
    } else {
      throw new Error('클래스가 해당 공간에 속해있지 않습니다.');
    }
    return lessonList;
  }

  private async findPlanByStudiosAndDay(query: GetCalendarList, lessonList: any, userInfo: any) {
    const planList = (await this.planRepositoryDdb.findPlanByStudiosAndDay(query, lessonList, userInfo)).val;
    planList.map((plan: any) => {
      const lesson = lessonList.find((lesson: any) => lesson.id === plan.lessonId);
      if (!lesson.planList) {
        lesson.planList = [];
      }
      lesson.planList.push(plan);
    });
  }

  private async findPlanByLessonAndDay(query: GetCalendarList, lesson: any, userInfo: any) {
    const planList = (await this.planRepositoryDdb.findPlanByStudiosAndDay(query, undefined, userInfo)).val;
    lesson.planList = [];
    planList.map((plan: any) => lesson.planList.push(plan));
  }

  private async findPlanByStudios(query: GetCalendarList, lessonList: any, userInfo: any) {
    const planList = (await this.planRepositoryDdb.findPlanByStudios(query, lessonList, userInfo)).val;
    return await this.sortDate(planList);
  }

  private async findPlanByLesson(query: GetCalendarList, userInfo: any) {
    const planList = (await this.planRepositoryDdb.findPlanByStudios(query, undefined, userInfo)).val;
    return await this.sortDate(planList);
  }

  private async sortDate(planList: any) {
    const groupByDate: any = {};
    for (const plan of planList) {
      const date = plan.startDate.slice(0, 10);
      if (!groupByDate[date]) {
        groupByDate[date] = { max: 0, current: 0, spare: 0 };
      }
      groupByDate[date].max += plan.maxMember;
      groupByDate[date].current += plan.currentMember;
      groupByDate[date].spare = groupByDate[date].max - groupByDate[date].current;
    }
    return groupByDate;
  }

  private async organizeLessonId(planList: any) {
    const lessonIdList: Set<string> = new Set<string>();
    planList.map((plan: any) => {
      lessonIdList.add(plan.lessonId);
    });
    return Array.from(lessonIdList);
  }

  private async findLessonByInstructor(lessonIdList: Array<string>, studiosId: string) {
    const lessonList: any = [];
    for await (const lessonId of lessonIdList) {
      try {
        const lesson = await this.lessonRepository.findByIdInfo(lessonId);
        if (lesson.studiosId === studiosId) {
          lessonList.push(lesson);
        }
      } catch (e: any) {
        console.log(e.message);
      }
    }
    return lessonList;
  }

  async multi(multi: MultiDTO, footPrint: FootPrint) {
    const lesson = await this.lessonRepository.findById(multi.lessonId);
    if (lesson?.val === undefined) {
      throw new Error('해당 레슨이 존재하지 않습니다.');
    }

    if (!multi?.payOption?.price) {
      delete multi.payOption;
    }

    const schedules = await this.scheduleSort(multi);
    await this.createMultiPlan(multi, schedules, footPrint);
    return {
      message: 'success',
      schedules,
    };
  }

  private async createMultiPlan(multi: MultiDTO, schedules: any, footPrint: FootPrint) {
    await Promise.all(
      schedules.map(async (schedule: any) => {
        const id: string = randomUUID();
        const dto = {
          lessonId: multi.lessonId,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          fakePrice: multi.fakePrice,
          price: multi.price,
          currentMember: 0,
          maxMember: multi.maxMember,
          instructor: schedule.instructor,
          isShow: true,
          reservationStatus: ReservationStatus.RESERVATION_POSSIBLE,
          payOption: multi?.payOption || {},
        };
        const plan: Plan = new Plan(dto, id, footPrint);
        await this.planRepositoryDdb.create(plan);
      }),
    );
  }

  private async scheduleSort(multi: MultiDTO) {
    type Day = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

    const daysOfWeek: Record<Day, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
    const now: Date = new Date();
    const start: Date = parse(multi.startDate, 'yyyy-MM-dd', now);
    const end: Date = parse(multi.endDate, 'yyyy-MM-dd', now);

    if (isBefore(start, now)) {
      throw new Error('시작날짜가 현재시간보다 전 일수 없습니다.');
    }

    if (differenceInMonths(end, start) > 2) {
      throw new Error('지정 가능한 최대기간이 3개월이 넘습니다.');
    }

    const dateRange = eachDayOfInterval({ start, end });

    const selectedDays = multi.days.map(day => daysOfWeek[day as Day]);

    const schedules = dateRange
      .filter(date => selectedDays.includes(getDay(date)))
      .map(date => {
        return multi.timeRanges.map(timeRange => ({
          startDate: format(date, 'yyyy-MM-dd') + 'T' + timeRange.startTime,
          endDate: format(date, 'yyyy-MM-dd') + 'T' + timeRange.endTime,
          instructor: timeRange?.instructor && timeRange?.instructor !== '' ? timeRange.instructor : 'x',
        }));
      })
      .flat();

    return schedules;
  }
}
