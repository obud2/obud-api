import { randomUUID } from 'crypto';
import { FootPrint } from '../dto/request/RequestDTO';
import ICartRepository from './cart.repository';
import CartRepositoryDdb from './cart.repository.ddb';
import { Cart, CartDTO, GetCartList, InstructorSet, UserInfo } from './cart.model';
import IPlanRepository from '../plan/plan.repository';
import PlanRepositoryDdb from '../plan/plan.repository.ddb';
import ILessonRepository from '../lesson/lesson.repository';
import LessonRepositoryDdb from '../lesson/lesson.repository.ddb';
import IStudiosRepository from '../studios/studios.repository';
import StudiosRepositoryDdb from '../studios/studios.repository.ddb';
import { Plan, PlanCheck, ReservationStatus } from '../plan/plan.model';
import { LessonShort } from '../lesson/lesson.model';
import { StudiosShort } from '../studios/studios.model';

export default class CartService {
  constructor(
    private readonly cartRepository: ICartRepository = new CartRepositoryDdb(),
    private readonly planRepository: IPlanRepository = new PlanRepositoryDdb(),
    private readonly lessonRepository: ILessonRepository = new LessonRepositoryDdb(),
    private readonly studiosRepository: IStudiosRepository = new StudiosRepositoryDdb(),
  ) {}

  async create(dto: CartDTO, footPrint: FootPrint, updatePrint: FootPrint, userInfo: UserInfo): Promise<any> {
    let cart: Cart;
    const existCart: Cart = await this.cartRepository.findByUserAndPlan(dto, userInfo);
    if (existCart === undefined) {
      const id: string = randomUUID();
      cart = new Cart(dto, id, footPrint);
      const existPlan: Plan = (await this.planRepository.findById(cart.planId)).val;
      await this.createValid(cart, existPlan);
      cart.setPlanInfo(existPlan);
      const existLesson: LessonShort = await this.lessonRepository.findByIdInfo(existPlan.lessonId);
      cart.studiosId = existLesson.studiosId;
      cart.lessonTitle = existLesson.title;
      cart.lessonImages.push(existLesson.images);
      const existStudios: StudiosShort = await this.studiosRepository.findByIdInfo(existLesson.studiosId);
      cart.studiosTitle = existStudios.title;
      return await this.cartRepository.create(cart);
    } else {
      existCart.payOptionCount += dto.payOptionCount;
      existCart.reservationCount += dto.reservationCount;
      cart = new Cart(existCart, existCart.id, existCart);
      cart.setUpdated(updatePrint);
      const existPlan: Plan = (await this.planRepository.findById(cart.planId)).val;
      await this.updatedValid(cart, existPlan);
      return await this.cartRepository.update(cart);
    }
  }

  async findById(id: string): Promise<any> {
    const result = await this.cartRepository.findById(id);
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    return result;
  }

  async getListByUserInfo(query: GetCartList, userInfo: UserInfo) {
    const resultList = await this.cartRepository.list(query, userInfo);
    for await (const item of resultList.val) {
      const plan: PlanCheck = await this.planRepository.findByIdShort(item.planId);
      item.reservationStatus = plan.reservationStatus;
    }
    return resultList;
  }

  async delete(id: string, bucket: any) {
    return this.cartRepository.delete(id, bucket);
  }

  async deleteList(idList: string[]) {
    const result: any = {
      message: 'success',
      data: [],
    };
    for await (const id of idList) {
      const deleteResult = await this.delete(id, undefined);
      result.data.push(deleteResult.val.$metadata);
    }
    return result;
  }

  private async createValid(cart: Cart, plan: Plan) {
    if (plan === undefined) {
      throw new Error('해당 플랜이 존재하지 않습니다.');
    }
    if (plan.reservationStatus === ReservationStatus.RESERVATION_IMPOSSIBLE) {
      throw new Error('예약이 마감된 상품입니다.');
    }
    if (cart.price !== plan.price) {
      throw new Error('상품의 가격정보가 일치하지 않습니다.');
    }
    if (cart.startDate !== plan.startDate) {
      throw new Error('상품의 시작시간이 일치하지 않습니다.');
    }
    if (cart.endDate !== plan.endDate) {
      throw new Error('상품의 종료시간이 일치하지 않습니다');
    }
    const remaining: number = plan.maxMember - plan.currentMember;
    if (remaining < 1) {
      throw new Error(`Plan ID :: ${plan.id} 의 수강원이 가득 찼습니다.`);
    }
    if (remaining < cart.reservationCount) {
      throw new Error(`Plan ID :: ${plan.id} 자리가 모자랍니다.`);
    }

    if (cart.payOptionCount > 0 && plan?.payOption?.price) {
      if (cart.payOptionCount > cart.reservationCount) {
        throw new Error('옵션의 인원이 예약인원을 초과할수 없습니다.');
      }
      if (Object.keys(cart.payOption).length === 0) {
        cart.payOption = plan.payOption;
      }
      if (plan.payOption?.price !== cart?.payOption?.price) {
        throw new Error(`Plan ID :: ${plan.id} 의 옵션가격이 다릅니다.`);
      }
      const optionRemaining: number = plan?.payOption?.maxMember - plan?.payOption?.currentMember;
      if (optionRemaining < 1) {
        throw new Error(`Plan ID :: ${plan.id} 의 옵션인원이 가득찼습니다.`);
      }
      if (optionRemaining < cart.payOptionCount) {
        throw new Error(`Plan ID :: ${plan.id} 의 옵션자리가 모자랍니다.`);
      }
    }
  }

  private async updatedValid(cart: Cart, plan: Plan) {
    await this.createValid(cart, plan);
  }
}
