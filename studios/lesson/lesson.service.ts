import { randomUUID } from 'crypto';
import { FootPrint, ResponseSingleDTO } from '../dto/request/RequestDTO';
import ILessonRepository from './lesson.repository';
import LessonRepositoryDdb from './lesson.repository.ddb';
import { GetLessonList, Lesson, LessonDataType, LessonDTO, LessonSortData, LessonSpecialSortData } from './lesson.model';
import StudiosRepositoryDdb from '../studios/studios.repository.ddb';
import IStudiosRepository from '../studios/studios.repository';
import { Studios, StudiosForLesson } from '../studios/studios.model';
import { UserInfo } from '../order/order.model';
import IPlanRepository from '../plan/plan.repository';
import PlanRepositoryDdb from '../plan/plan.repository.ddb';

export default class LessonService {
  constructor(
    private lessonRepository: ILessonRepository = new LessonRepositoryDdb(),
    private studiosRepository: IStudiosRepository = new StudiosRepositoryDdb(),
    private planRepository: IPlanRepository = new PlanRepositoryDdb(),
  ) {}

  async create(dto: LessonDTO, footPrint: FootPrint): Promise<any> {
    const existStudios: ResponseSingleDTO<Studios> = await this.studiosRepository.findById(dto.studiosId);
    if (existStudios.val === undefined) {
      throw new Error('해당 스튜디오의 아이디가 존재하지 않습니다.');
    }
    const id: string = randomUUID();
    await this.specialSortCheck(dto);
    const sortOrder: number | undefined = await this.lessonRepository.getLastSortOrder(dto.studiosId);
    const lesson: Lesson = new Lesson(dto, id, footPrint);
    if (sortOrder !== undefined) {
      lesson.sortOrder = sortOrder + 1;
    }
    return await this.lessonRepository.create(lesson);
  }

  async clone(id: string, footPrint: FootPrint) {
    const existLesson: ResponseSingleDTO<Lesson> = await this.findById(id);
    if (existLesson.val === undefined) {
      throw new Error('해당 Lesson 이 존재하지 않습니다.');
    }
    const newId: string = randomUUID();
    await this.specialSortCheck(existLesson.val);
    const lesson: Lesson = new Lesson(existLesson?.val, newId, footPrint);
    const sortOrder: number | undefined = await this.lessonRepository.getLastSortOrder(lesson.studiosId);
    if (sortOrder !== undefined) {
      lesson.sortOrder = sortOrder + 1;
    }
    lesson.isShow = false;
    lesson.title += ' (복제됨)';
    lesson.images = await lesson.images.reduce(async (prev: Promise<any[]>, image: any) => {
      const uuid: string = randomUUID();
      const params = await this.lessonRepository.copyS3File(image, uuid);
      const updatedImage: any = {
        key: params.Key,
        name: uuid,
        size: image.size,
        type: image.type,
        upload: true,
        url: `https://s3.ap-northeast-2.amazonaws.com/file.obud.site/lesson/lesson_${uuid}`,
      };
      const prevImages: any[] = await prev;
      prevImages.push(updatedImage);
      return prevImages;
    }, Promise.resolve([]));

    return await this.lessonRepository.create(lesson);
  }

  async getListByStudios(query: GetLessonList) {
    const result = await this.lessonRepository.getListByStudios(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    await this.addLessonInfo(result.val);

    return result;
  }

  async getListAllByStudios(query: GetLessonList) {
    const result = await this.lessonRepository.getListAllByStudios(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getListSpecialByStudios(query: GetLessonList) {
    const result = await this.lessonRepository.getListSpecialByStudios(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    await this.addStudiosAddrInfo(result.val);
    return result;
  }

  async getListAllSpecialByStudios(query: GetLessonList) {
    const result = await this.lessonRepository.getListAllSpecialByStudios(query);
    if (result.result === 'FAIL') {
      throw new Error(result.message);
    }
    await this.addStudiosAddrInfo(result.val);
    return result;
  }

  async getListAllSpecialByStudiosAdmin(query: GetLessonList, userInfo: UserInfo) {
    const existStudiosList = await this.studiosRepository.getStudiosListByUserId(userInfo);
    const studiosList: string[] = existStudiosList.val.map((item: any) => item.id);
    const result = await this.lessonRepository.getSpecialListByStudiosId(query, studiosList);
    if (result.result.toUpperCase() === 'FAIL') {
      throw new Error(result.message);
    }
    await this.addStudiosAddrInfo(result.val);
    return result;
  }

  async findById(id: string) {
    const result = await this.lessonRepository.findById(id);
    result.val.studios = await this.studiosRepository.findByIdResTitle(result.val.studiosId);
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    return result;
  }

  async update(dto: LessonDTO, footPrint: FootPrint) {
    const existLesson: Lesson = (await this.findById(dto.id)).val;
    const existStudios: ResponseSingleDTO<Studios> = await this.studiosRepository.findById(dto.studiosId);
    if (existStudios.val === undefined) {
      throw new Error('해당 스튜디오의 아이디가 존재하지 않습니다.');
    }
    const lesson: Lesson = new Lesson(dto, dto.id, footPrint);
    if (existLesson.lessonType === 'Regular' && lesson.lessonType === 'Special') {
      await this.specialSortCheck(lesson);
    }
    lesson.setCreated(existLesson);
    await this.validateLesson(lesson, existLesson);
    if (existLesson.title !== lesson.title || existLesson.images[0].name !== lesson.images[0].name) {
      this.updateCartAndOrderItem(lesson);
    }
    return await this.lessonRepository.update(lesson);
  }

  async sorting(data: LessonDataType) {
    let max: number, min: number, plusOrMinus: number;
    if (data.before > data.after) {
      max = data.before;
      min = data.after;
      plusOrMinus = 1;
    } else {
      max = data.after;
      min = data.before;
      plusOrMinus = -1;
    }
    let returnValue: LessonSortData | undefined = undefined;
    const dataList: LessonSortData[] = await this.lessonRepository.findSortList(data.id, max, min, data.studiosId);
    for await (const item of dataList) {
      if (item.id === data.id) {
        item.sortOrder = data.after;
        returnValue = item;
      } else {
        item.sortOrder = item.sortOrder + plusOrMinus;
      }
      await this.lessonRepository.sorting(item);
    }

    return returnValue;
  }

  async specialSorting(data: LessonDataType) {
    let max: number, min: number, plusOrMinus: number;
    if (data.before > data.after) {
      max = data.before;
      min = data.after;
      plusOrMinus = 1;
    } else {
      max = data.after;
      min = data.before;
      plusOrMinus = -1;
    }
    let returnValue: LessonSpecialSortData | undefined = undefined;
    const dataList: LessonSpecialSortData[] = await this.lessonRepository.findSpecialSortList(data.id, max, min);
    await dataList.reduce(async (prevPromise: Promise<void>, item: LessonSpecialSortData): Promise<void> => {
      await prevPromise;
      if (item.id === data.id) {
        item.specialSort = data.after;
        returnValue = item;
      } else {
        item.specialSort = item.specialSort + plusOrMinus;
      }
      await this.lessonRepository.specialSorting(item);
    }, Promise.resolve());

    return returnValue;
  }

  async delete(id: string, bucket: string | string[] | undefined) {
    const existLesson: Lesson = (await this.findById(id)).val;
    if (existLesson === undefined) {
      throw new Error('해당 클래스가 존재하지 않습니다.');
    }
    return await this.lessonRepository.delete(id, bucket);
  }

  async validateLesson(dto: Lesson, existLesson: Lesson) {
    if (existLesson === undefined) {
      throw new Error('해당 Lesson 의 ID 값이 존재하지 않습니다.');
    }
    if (dto.studiosId !== existLesson.studiosId) {
      throw new Error('Studios 의 ID 값을 변경할수 없습니다.');
    }
  }

  private async specialSortCheck(lesson: LessonDTO | Lesson) {
    let specialSort: number | undefined = 0;
    if (lesson.lessonType === 'Special') {
      specialSort = await this.lessonRepository.getLastSpecialSort();
      if (specialSort === undefined) {
        lesson.specialSort = 1;
      } else {
        lesson.specialSort = specialSort + 1;
      }
    }
  }

  private async updateCartAndOrderItem(lesson: Lesson) {
    const cartIdList: any = (await this.lessonRepository.findCartByLessonId(lesson.id)).val;
    const orderItemIdList: any = (await this.lessonRepository.findOrderItemByLessonId(lesson.id)).val;
    for (const cart of cartIdList) {
      this.lessonRepository.updateCartByLessonId(cart.id, lesson);
    }
    for (const orderItem of orderItemIdList) {
      this.lessonRepository.updateOrderItemByLessonId(orderItem.id, lesson);
    }
  }

  private async addStudiosAddrInfo(lessonList: any) {
    await Promise.all(
      lessonList.map(async (lesson: any) => {
        const studiosInfo = await this.studiosRepository.findByIdGetAddr(lesson.studiosId);
        if (studiosInfo!.val) {
          lesson.addr = studiosInfo.val.addr;
          lesson.addrDetail = studiosInfo.val.addrDetail;
        } else {
          lesson.addr = '';
          lesson.addrDetail = '';
        }
      }),
    );
  }

  private async addLessonInfo(lessonList: any) {
    const date: string = await this.getNow();
    await Promise.all(
      lessonList.map(async (lesson: any) => {
        const planList: any = await this.planRepository.getListByLessonAndDate(lesson.id, date);
        await this.getPlansInfo(lesson, planList.val);
      }),
    );
  }

  private async getPlansInfo(lesson: any, planList: any) {
    let maxMemberCount: number = 0;
    let currentMemberCount: number = 0;
    let price: number[] = [];
    await Promise.all(
      planList.map(async (plan: any) => {
        maxMemberCount += plan.maxMember;
        currentMemberCount += plan.currentMember;
        price.push(plan.price);
      }),
    );
    lesson.isSoldOut = currentMemberCount >= maxMemberCount;
    lesson.minPrice = Math.min(...price);
  }

  private async getNow(): Promise<string> {
    const dateForm: Date = new Date();
    dateForm.setHours(dateForm.getHours() + 9);
    return dateForm.toISOString().substring(0, 19);
  }
}
