import { Router, Request } from 'express';
import CartService from './cart.service';
import { FootPrint, GetListRequestDTO, ResponseDTO } from '../dto/request/RequestDTO';
import { CartDTO, GetCartList, UserInfo } from './cart.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class CartRouter {
  constructor(
    private readonly router: Router = Router(),
    private cartService: CartService = new CartService(),
    private jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /cart:
     *   get:
     *     summary: Get Cart List
     *     tags: [Cart]
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
      const query: GetCartList = new GetCartList(req.query);
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.cartService.getListByUserInfo(query, userInfo);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /cart/{id}:
     *   get:
     *     summary: Get Cart
     *     tags: [Cart]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    this.router.get('/:id', async (req: Request, res) => {
      const id: string = req.params.id;
      const userId: string = <string>req?.query?.userId;
      const result: ResponseDTO<CartDTO> = await this.cartService.findById(id);
      // @ts-ignore
      this.jthor.resp.success(res, result.val);
    });

    /**
     * @swagger
     * /cart:
     *   post:
     *     summary: Create Cart
     *     tags:
     *       - Cart
     *     requestBody:
     *       name: Cart
     *       description: Cart object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CartDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     */
    this.router.post('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: CartDTO = await new CartDTO(req.body).valid();
        const userInfo: UserInfo = new UserInfo(req.headers);
        const footPrint: FootPrint = this.jthor.authUtil.makeFootprint(req);
        const updatePrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.cartService.create(dto, footPrint, updatePrint, userInfo);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /cart:
     *   delete:
     *     summary: Delete Cart List
     *     tags: [Cart]
     *     requestBody:
     *       name: cart
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             properties:
     *               cartId:
     *                 type: string
     *             example:
     *               cartId:
     *                 - "cartId1"
     *                 - "cartId2"
     *
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.delete('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const idList: string[] = req.body.cartId;
        const result = await this.cartService.deleteList(idList);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    /**
     * @swagger
     * /cart/{id}:
     *   delete:
     *     summary: Delete Cart
     *     tags:
     *       - Cart
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     */
    this.router.delete('/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const id: string = req.params.id;
      const bucket: string | string[] | undefined = req.headers.bucket;
      try {
        const result = await this.cartService.delete(id, bucket);
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
