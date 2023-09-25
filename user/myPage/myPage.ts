import { Router, Request } from 'express';
import MyPageService from './maPage.service';
import { GetMyPageReservationList, UserInfo } from './maPage.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class MyPageRouter {
  constructor(
    private readonly router: Router = Router(),
    private readonly myPageService: MyPageService = new MyPageService(),
    private jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /user/myPage:
     *   get:
     *     summary: 로그인한 계정의 예약리스트
     *     tags: [MyPage]
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
     */
    this.router.get('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetMyPageReservationList = new GetMyPageReservationList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.myPageService.getReservationList(query, userInfo);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /user/myPage/{id}:
     *   get:
     *     summary: 마이페이지 예약내역 상세
     *     tags: [MyPage]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    this.router.get('/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const id: string = req.params.id;
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.myPageService.getReservationInfo(id, userInfo);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });
  }

  public getRouter() {
    return this.router;
  }
}
