import WishService from './wish.service';
import { Router, Request } from 'express';
import { UserInfo } from '../user/user.model';
import { FootPrint } from '../dto/request/RequestBodyDTO';
import { GetWishList, Wish } from './wish.model';
import { randomUUID } from 'crypto';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class WishRouter {
  constructor(
    private readonly router: Router = Router(),
    private readonly wishService: WishService = new WishService(),
    private jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /user/wish:
     *   get:
     *     summary: Get WishList
     *     tags: [Wish]
     *     parameters:
     *       - in: query
     *         name: limit
     *         required: false
     *       - in: query
     *         name: cursor
     *         required: false
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.get('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const query: GetWishList = new GetWishList(req.query);
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.wishService.getList(query, userInfo);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    /**
     * @swagger
     * /user/wish/{studios}:
     *   post:
     *     summary: Create WishList
     *     tags: [Wish]
     *     parameters:
     *       - in: path
     *         name: studios
     *         required: true
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/:studios', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const studiosId: string = req.params.studios;
        const userInfo: UserInfo = new UserInfo(req.headers);
        const footPrint: FootPrint = new FootPrint(await this.jthor.authUtil.makeFootprint(req));
        const result = await this.wishService.create(userInfo, studiosId, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    /**
     * @swagger
     * /user/wish:
     *   delete:
     *     summary: Delete WishList
     *     tags: [Wish]
     *     requestBody:
     *       name: wish
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             properties:
     *               wishId:
     *                 type: string
     *             example:
     *               wishId:
     *                 - "wishId1"
     *                 - "wishId2"
     *
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.delete('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const idList: string[] = req.body.wishId;
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.wishService.deleteList(idList, userInfo);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    /**
     * @swagger
     * /user/wish/{wishId}:
     *   delete:
     *     summary: Delete WishList
     *     tags: [Wish]
     *     parameters:
     *       - in: path
     *         name: wishId
     *         required: true
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.delete('/:wishId', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const wishId: string = req.params.wishId;
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.wishService.delete(wishId, userInfo);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });
  }

  public getRouter() {
    return this.router;
  }
}
