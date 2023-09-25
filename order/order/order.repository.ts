import { Order, OrderItem } from './order.model';

export default interface IOrderRepository {
  idGenForOrderItem(): Promise<string>;
  idGenFotOrder(): Promise<string>;
  createOrder(order: Order): Promise<any>;
  createOrderItem(item: OrderItem): Promise<any>;
  findOrderById(merchant_uid: string): Promise<any>;
  findOrderItemByOrderId(id: string): Promise<any>;
  updateOrderItem(orderItem: OrderItem): Promise<any>;
  updateOrder(order: Order): Promise<any>;
  findOrderItemById(orderItemId: string): Promise<OrderItem>;
  findUser(createdID: string): Promise<any>;
}
