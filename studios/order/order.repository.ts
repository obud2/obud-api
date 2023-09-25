import { CompleteDTO, InstructorSet, Order, OrderItem } from './order.model';

export default interface IOrderRepository {
  findInstructor(instructor: string): Promise<InstructorSet>;
  idGenForOrderItem(): Promise<string>;
  idGenFotOrder(): Promise<string>;
  createOrder(order: Order): Promise<any>;
  createOrderItem(item: OrderItem): Promise<any>;
  getAccessToken(): Promise<string>;
  getPaymentData(keys: CompleteDTO, accessToken: string): Promise<any>;
  findOrderById(merchant_uid: string): Promise<any>;
  findOrderItemByOrderId(id: string): Promise<any>;
  findOrderItemByPlanId(id: string): Promise<any>;
  updateAttendance(orderItemId: string, isAttendance: boolean): Promise<any>;
  updateComment(orderItemId: string, comment: string): Promise<any>;
}
