import { Router, Request } from 'express';
import SearchService from './search.service';
import { SearchDTO } from './search.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
export class SearchRouter {
  constructor(
    private readonly router: Router = Router(),
    private readonly searchService: SearchService = new SearchService(),
    private readonly jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }
  private setRouter() {
    /**
     * @swagger
     * /search:
     *   get:
     *     summary: 공간, 스페셜 클래스 검색
     *     tags: [Search]
     *     parameters:
     *       - in: query
     *         name: cursor
     *         schema:
     *           type: string
     *       - in: query
     *         name: limit
     *         schema:
     *           type: number
     *       - in: query
     *         name: keyword
     *         schema:
     *           type: string
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     */
    this.router.get('/', async (req: Request, res) => {
      try {
        const dto: SearchDTO = new SearchDTO(req.query);
        const result = await this.searchService.findStudiosAndLessonByKeyword(dto);
        this.jthor.resp.success(res, result?.val, result?.cursor, result?.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /search/keyword:
     *   get:
     *     summary: 인기 검색어
     *     tags: [Search]
     */
    this.router.get('/keyword', async (req: Request, res) => {
      try {
        const result = await this.searchService.getKeywordList();
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });
  }
  public getRouter() {
    return this.router;
  }
}
