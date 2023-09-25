import ISearchRepository from './search.repository';
import { SearchDTO } from './search.model';
import SearchRepositoryDdb from './search.repository.ddb';

export default class SearchService {
  constructor(private readonly searchRepository: ISearchRepository = new SearchRepositoryDdb()) {}

  async findStudiosAndLessonByKeyword(query: SearchDTO) {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (query?.keyword !== undefined && query?.keyword !== '' && query?.keyword !== 'undefined' && query?.keyword !== '[object Object]') {
      await this.searchRepository.pushKeyword(query.keyword);
      return await this.searchRepository.findStudiosByKeyword(query);
    } else if (query?.date !== undefined && query?.date !== '' && pattern.test(query?.date)) {
      query?.date?.trim();
      const planList = (await this.searchRepository.findPlanByStartDate(query)).val;
      const lessonIdList: Array<string> = await this.organizeLessonId(planList);
      const studiosIdList: Array<string> = await this.organizeStudiosId(lessonIdList);
      return await this.getStudiosList(studiosIdList);
    } else {
      throw new Error('검색어를 입력해주세요.');
    }
  }

  private async organizeLessonId(planList: any): Promise<Array<string>> {
    const lessonIdList: Set<string> = new Set<string>();
    planList.map((plan: any) => {
      lessonIdList.add(plan.lessonId);
    });
    return Array.from(lessonIdList);
  }

  private async organizeStudiosId(lessonIdList: Array<string>): Promise<Array<string>> {
    const studiosIdList: Set<string> = new Set<string>();
    await Promise.all(
      lessonIdList.map(async (lesson: string) => {
        const studios: any = await this.searchRepository.findLessonById(lesson);
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
        const studios: any = await this.searchRepository.findStudiosById(studiosId);
        if (studios?.val) {
          result.val.push(studios.val);
        }
      }),
    );
    return result;
  }

  async getKeywordList() {
    return await this.searchRepository.getKeywordList();
  }
}
