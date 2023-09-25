import { GetListRequestDTO, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { Cart, CartDTO, GetCartList, InstructorSet, UserInfo } from './cart.model';

export default interface ICartRepository {
  create(dto: Cart): Promise<any>;
  list(query: GetCartList, userInfo: UserInfo): Promise<any>;
  findById(id: string): Promise<ResponseSingleDTO<any>>;
  update(dto: Cart): Promise<any>;
  delete(id: string, bucket: string | string[] | undefined): Promise<any>;
  findByUserAndPlan(cart: CartDTO, userInfo: UserInfo): Promise<any>;
  findInstructor(instructor: string): Promise<InstructorSet>;
}
