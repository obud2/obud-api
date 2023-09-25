import { SearchDTO } from './search.model';

export default interface ISearchRepository {
  findStudiosByKeyword(query: SearchDTO): Promise<any>;
  // findLessonByKeyword(query: SearchDTO): Promise<any>;
  findPlanByStartDate(query: SearchDTO): Promise<any>;
  findLessonById(lessonId: string): Promise<any>;
  findStudiosById(studiosId: string): Promise<any>;
  pushKeyword(keyword: string): Promise<void>;
  getKeywordList(): Promise<any>;
}
