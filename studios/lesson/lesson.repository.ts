import { GetLessonList, Lesson, LessonShort, LessonSortData, LessonSpecialSortData } from './lesson.model';

export default interface ILessonRepository {
  create(lesson: Lesson): Promise<any>;
  getListByStudios(query: GetLessonList): Promise<any>;
  getListAllByStudios(query: GetLessonList): Promise<any>;
  getListSpecialByStudios(query: GetLessonList): Promise<any>;
  getListAllSpecialByStudios(query: GetLessonList): Promise<any>;
  findById(id: string): Promise<any>;
  update(lesson: Lesson): Promise<any>;
  delete(id: string, bucket: string | string[] | undefined): Promise<any>;
  copyS3File(image: any, uuid: string): Promise<any>;
  getListByHasSpecial(id: string): Promise<any>;
  getListByHasRegular(id: string): Promise<any>;
  getLastSortOrder(studiosId: string): Promise<number | undefined>;
  findSortList(id: string, max: number, min: number, studiosId: string): Promise<LessonSortData[]>;
  sorting(item: LessonSortData): Promise<void>;
  getLastSpecialSort(): Promise<number | undefined>;
  findSpecialSortList(id: string, max: number, min: number): Promise<LessonSpecialSortData[]>;
  specialSorting(item: LessonSpecialSortData): Promise<void>;
  findByIdInfo(lessonId: string): Promise<LessonShort>;
  getSpecialListByStudiosId(query: GetLessonList, studiosList: string[]): Promise<any>;
  findCartByLessonId(id: string): Promise<any>;
  findOrderItemByLessonId(id: string): Promise<any>;
  updateCartByLessonId(id: string, lesson: Lesson): Promise<void>;

  updateOrderItemByLessonId(id: string, lesson: Lesson): Promise<void>;
  findByIdStudiosId(lesson: string): Promise<any>;
}
