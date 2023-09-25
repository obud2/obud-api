import { GetWishList, Wish } from './wish.model';
import { UserInfo } from '../user/user.model';

export default interface IWishRepository {
  create(wish: Wish): Promise<any>;
  getList(query: GetWishList, userInfo: UserInfo): Promise<any>;
  findStudiosById(studiosId: string): Promise<any>;
  delete(wishId: string): Promise<any>;
  findById(wishId: string): Promise<any>;
  updateStudiosWishCount(studiosId: string, symbol: string): Promise<void>;
}
