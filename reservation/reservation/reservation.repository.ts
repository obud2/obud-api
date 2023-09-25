import { GetReservationList, Order, OrderItem, OrderStatus, StudiosShort, UserInfo } from './reservation.model';

export default interface IReservationRepository {
  findOrderById(orderId: string): Promise<Order>;
  findOrderItemById(orderItemId: string): Promise<OrderItem>;
  getCancelList(query: GetReservationList): Promise<any>;
  getReservationList(query: GetReservationList): Promise<any>;
  updateOrderItemStatus(orderItemId: string, date: string, status: OrderStatus, cancelAmount: number): Promise<any>;
  getRefundListByStudiosId(studiosId: string): Promise<any>;
  findStudiosByIdInfo(studiosId: string): Promise<StudiosShort>;
  getOldReservationList(query: GetReservationList): Promise<any>;
  getStudiosListByUserId(userInfo: UserInfo): Promise<any>;
  getReservationListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any>;
  getOldReservationListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any>;
  getCancelListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any>;
  getCancelingList(query: GetReservationList): Promise<any>;
  getCancelingListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any>;
  getRefusalList(query: GetReservationList): Promise<any>;
  getRefusalListByStudiosAdmin(query: GetReservationList, studiosList: string[]): Promise<any>;
  findPlanById(planId: string): Promise<any>;
  findLessonById(lessonId: string): Promise<any>;
  findStudiosById(studiosId: string): Promise<any>;
  findUser(createdID: string): Promise<any>;
}
