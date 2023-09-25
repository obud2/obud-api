import { UserInfo } from '../user/user.model';
import { GetWishList, Wish } from './wish.model';
import IWishRepository from './wish.repository';
import WishRepositoryDdb from './wish.repository.ddb';
import { FootPrint } from '../dto/request/RequestBodyDTO';
import { randomUUID } from 'crypto';

export default class WishService {
  constructor(private readonly wishRepository: IWishRepository = new WishRepositoryDdb()) {}
  async create(userInfo: UserInfo, studiosId: string, footPrint: FootPrint) {
    const wish: Wish = new Wish(randomUUID(), userInfo.id, studiosId, footPrint);
    const createResult = await this.wishRepository.create(wish);
    const symbol: string = '1';
    await this.wishRepository.updateStudiosWishCount(studiosId, symbol);
    return createResult;
  }

  async getList(query: GetWishList, userInfo: UserInfo) {
    const result: any = await this.wishRepository.getList(query, userInfo);

    for await (const item of result.val) {
      item.studioInfo = await this.wishRepository.findStudiosById(item.studiosId);
    }
    return result;
  }

  async delete(wishId: string, userInfo: UserInfo) {
    const existWish: Wish = (await this.findById(wishId)).val;
    if (existWish === undefined) {
      throw new Error('위시리스트에 추가되어있지 않습니다.');
    }
    if (existWish.userId !== userInfo.id) {
      throw new Error('나의 위시리스트가 아닙니다.');
    }
    const symbol: string = '-1';
    await this.wishRepository.updateStudiosWishCount(existWish.studiosId, symbol);
    return await this.wishRepository.delete(wishId);
  }

  async deleteList(idList: string[], userInfo: UserInfo) {
    const result: any = {
      message: 'success',
      data: [],
    };
    for await (const id of idList) {
      const deleteResult = await this.delete(id, userInfo);
      result.data.push(deleteResult.val.$metadata);
    }
    return result;
    // const resultList = await idList.reduce(async (prev: Promise<any[]>, id: string) => {
    //   const resultList2: any[] = await prev;
    //   const deleteResult = await this.delete(id, userInfo);
    //   resultList2.push(deleteResult.val.$metadata);
    //   return resultList2;
    // }, Promise.resolve([]));
    // return {
    //   message: 'success',
    //   data: resultList,
    // };
  }

  private async findById(wishId: string) {
    return await this.wishRepository.findById(wishId);
  }
}
