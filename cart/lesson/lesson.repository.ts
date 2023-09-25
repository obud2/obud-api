import { GetLessonList, Lesson, LessonShort, LessonSortData, LessonSpecialSortData } from './lesson.model';

export default interface ILessonRepository {
  findByIdInfo(lessonId: string): Promise<LessonShort>;
}
