import { Refund, Studios, StudiosDataType, StudiosDTO, StudiosList, StudiosSortData } from './studios.model';
import { randomUUID } from 'crypto';
import IStudiosRepository from './studios.repository';
import StudiosRepositoryDdb from './studios.repository.ddb';
import { FootPrint, GetListRequestDTO, ResponseDTO } from '../dto/request/RequestDTO';
import ILessonRepository from '../lesson/lesson.repository';
import LessonRepositoryDdb from '../lesson/lesson.repository.ddb';
import { GetLessonList } from '../lesson/lesson.model';
import { UserInfo } from '../order/order.model';
import IPlanRepository from '../plan/plan.repository';
import PlanRepositoryDdb from '../plan/plan.repository.ddb';

export default class StudiosService {
  constructor(
    private studiosRepository: IStudiosRepository = new StudiosRepositoryDdb(),
    private lessonRepository: ILessonRepository = new LessonRepositoryDdb(),
    private planRepository: IPlanRepository = new PlanRepositoryDdb(),
  ) {}

  async create(dto: StudiosDTO, footPrint: FootPrint): Promise<any> {
    const id: string = randomUUID();
    const sortOrder: number | undefined = await this.studiosRepository.getLastSortOrder();
    const studios: Studios = new Studios(dto, id, footPrint);
    if (sortOrder !== undefined) {
      studios.sortOrder = sortOrder + 1;
    }
    const result = await this.studiosRepository.create(studios);
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    return result;
  }

  async createRefund(reqRefundList: any, studiosId: string) {
    try {
      const refundList: Refund[] = [];
      for await (const item of reqRefundList) {
        const refund: Refund = new Refund(randomUUID(), studiosId, item.day, item.percent);
        const createResult = await this.studiosRepository.createRefund(refund);
        refundList.push(refund);
      }
      return refundList;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  async getList(query: GetListRequestDTO): Promise<ResponseDTO<StudiosList>> {
    return await this.studiosRepository.list(query);
  }

  async getListAll(query: GetListRequestDTO) {
    const result = await this.studiosRepository.listAll(query);
    if (result.result.toUpperCase() === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async getListByUserId(query: GetListRequestDTO, userInfo: UserInfo) {
    const result = await this.studiosRepository.getListByUserId(query, userInfo);
    if (result.result.toUpperCase() === 'FAIL') {
      throw new Error(result.message);
    }
    return result;
  }

  async findById(id: string, userId: string | undefined = undefined): Promise<any> {
    const result = await this.studiosRepository.findById(id);
    if (userId !== undefined) {
      const existWish = await this.studiosRepository.findWishById(id, userId);
      result.val.wishInfo = existWish;
    }
    if (result.result === 'fail') {
      throw new Error(result.message);
    }
    const refundResult = await this.studiosRepository.findRefundByStudiosId(id);
    result.val.refund = refundResult.val;
    return result;
  }

  async update(dto: StudiosDTO, footPrint: FootPrint): Promise<any> {
    const existStudios: Studios = (await this.findById(dto.id)).val;
    if (existStudios === undefined) {
      throw new Error('해당 스튜디오가 존재하지 않습니다.');
    }
    const updateStudios = {
      ...existStudios,
      ...dto,
    };
    const studios: Studios = new Studios(updateStudios, dto.id, existStudios);
    studios.setUpdated(footPrint);
    if (existStudios.title !== studios.title) {
      this.updateCartAndOrderItem(studios);
    }
    return await this.studiosRepository.update(studios);
  }

  async updateRefund(reqRefundList: any, studiosId: string) {
    const existRefundList = (await this.studiosRepository.findRefundByStudiosId(studiosId)).val;
    for await (const item of existRefundList) {
      await this.studiosRepository.deleteRefund(item.id);
    }
    return await this.createRefund(reqRefundList, studiosId);
  }

  async delete(id: string, bucket: string | string[] | undefined) {
    const query = {
      studiosId: id,
      limit: 10,
    };
    const getLessonList: GetLessonList = new GetLessonList(query);
    const lessonList = await this.lessonRepository.getListAllByStudios(getLessonList);
    if (lessonList?.val.length > 0) {
      const message: string = lessonList.val.reduce((prev: string, item: any) => {
        prev += `ID : ${item.id} , TITLE : ${item.title} ::}`;
        return prev;
      }, '');
      throw new Error('하위 Class 가 존재해여 삭제할수 없습니다 :: ' + message);
    }

    return await this.studiosRepository.delete(id, bucket);
  }

  async sorting(data: StudiosDataType): Promise<StudiosSortData | undefined> {
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
    return await this.doSorting(data, max, min, plusOrMinus);
  }

  private async doSorting(data: StudiosDataType, max: number, min: number, plusOrMinus: number) {
    let returnValue: StudiosSortData | undefined = undefined;
    const dataList: StudiosSortData[] = await this.studiosRepository.findSortList(data.id, max, min);
    await dataList.reduce(async (previousPromise, item) => {
      await previousPromise;
      if (item.id === data.id) {
        item.sortOrder = data.after;
        returnValue = item;
      } else {
        item.sortOrder = item.sortOrder + plusOrMinus;
      }
      await this.studiosRepository.sorting(item);
    }, Promise.resolve());
    return returnValue;
  }

  async clone(id: string, footPrint: FootPrint): Promise<StudiosDTO> {
    const studios: ResponseDTO<StudiosDTO> = await this.findById(id);
    if (studios.val === undefined) {
      throw new Error('해당 Studios 가 존재하지 않습니다.');
    }
    const newId: string = randomUUID();
    const cloneStudios: Studios = new Studios(studios.val, newId, footPrint);
    cloneStudios.wishCount = 0;
    const sortOrder: number | undefined = await this.studiosRepository.getLastSortOrder();
    if (sortOrder !== undefined) {
      cloneStudios.sortOrder = sortOrder + 1;
    }
    await cloneStudios.changeCloneInfo();
    cloneStudios.images = await cloneStudios.images.reduce(async (prev: Promise<any[]>, image: any) => {
      const uuid: string = randomUUID();
      const params = await this.studiosRepository.copyS3File(image, uuid);

      const updatedImage: any = {
        key: params.Key,
        name: uuid,
        size: image.size,
        type: image.type,
        upload: true,
        url: `https://s3.ap-northeast-2.amazonaws.com/file.obud.site/studio/studio_${uuid}`,
      };
      const prevImages = await prev;
      prevImages.push(updatedImage);
      return prevImages;
    }, Promise.resolve([]));
    return await this.studiosRepository.create(cloneStudios);
  }

  private async updateCartAndOrderItem(studios: Studios) {
    const cartIdList: any = (await this.studiosRepository.findCartByStudiosId(studios.id)).val;
    for (const cart of cartIdList) {
      this.studiosRepository.updateCartByStudiosId(cart.id, studios.title);
    }
    const orderItemIdList: any = (await this.studiosRepository.findOrderItemByStudiosId(studios.id)).val;
    for (const orderItem of orderItemIdList) {
      this.studiosRepository.updateOrderItemByStudiosId(orderItem.id, studios.title);
    }
  }

  async getListByInstructorUserId(query: GetListRequestDTO, userInfo: UserInfo) {
    const planList = (await this.planRepository.getListByInstructorAll(userInfo)).val;
    const lessonIdList: Array<string> = await this.organizeLessonId(planList);
    const studiosIdList: Array<string> = await this.organizeStudiosId(lessonIdList);
    return await this.getStudiosList(studiosIdList);
  }

  private async organizeLessonId(planList: any) {
    const lessonIdList: Set<string> = new Set<string>();
    planList.map((plan: any) => {
      lessonIdList.add(plan.lessonId);
    });
    return Array.from(lessonIdList);
  }

  private async organizeStudiosId(lessonIdList: Array<string>) {
    const studiosIdList: Set<string> = new Set<string>();
    await Promise.all(
      lessonIdList.map(async (lessonId: string) => {
        const studios: any = await this.lessonRepository.findByIdStudiosId(lessonId);
        if (studios?.val) {
          studiosIdList.add(studios.val.studiosId);
        }
      }),
    );
    return Array.from(studiosIdList);
  }

  private async getStudiosList(studiosIdList: Array<string>) {
    const result: any = {
      val: [],
    };
    await Promise.all(
      studiosIdList.map(async (studiosId: string) => {
        const studios: any = await this.studiosRepository.findByIdForStudiosList(studiosId);
        if (studios?.val) {
          result.val.push(studios.val);
        }
      }),
    );
    return result;
  }
}
