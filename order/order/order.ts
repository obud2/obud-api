import { Router, Request } from 'express';
import { FootPrint } from '../dto/request/RequestDTO';
import OrderService from './order.service';
import { CancelDTO, CompleteDTO, OrderCancelDTO, UserInfo } from './order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class OrderRouter {
  constructor(
    private readonly router: Router = Router(),
    private jthor = new Jthor(config, '', false),
    private readonly orderService: OrderService = new OrderService(),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /order:
     *   post:
     *     summary: Create Order
     *     tags: [Order]
     *     requestBody:
     *       name: Order
     *       description: Order object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               orders:
     *                 type: array
     *                 description: List of orders
     *                 items:
     *                   type: object
     *                   properties:
     *                     planId:
     *                       type: string
     *                       description: ID of the plan
     *                     endDate:
     *                       type: string
     *                       format: date-time
     *                       description: End date of the order
     *                     instructor:
     *                       type: string
     *                       description: ID of the instructor
     *                     price:
     *                       type: number
     *                       description: Price of the order
     *                     reservationStatus:
     *                       type: string
     *                       description: Reservation status of the order
     *                     startDate:
     *                       type: string
     *                       format: date-time
     *                       description: Start date of the order
     *                     reservationer:
     *                       type: string
     *                       description: reservationer name
     *                     reservationCount:
     *                       type: number
     *                       description: 예약 인원
     *                     reservationerHp:
     *                       type: string
     *                       description: 예약자 휴대폰번호
     *                     payOptionCount:
     *                       type: number
     *                     payOption:
     *                       type: object
     *                       properties:
     *                         title:
     *                           type: string
     *                         price:
     *                           type: number
     *                         currentMember:
     *                           type: number
     *                         maxMember:
     *                           type: number
     *             example:
     *               orders:
     *                 - planId: "6aef4b81-e8e3-463b-aca7-5de4de70e274"
     *                   endDate: "2023-06-15T14:50:00"
     *                   instructor: "5b53e7aa-44b1-4b94-af8d-ef2416d14512"
     *                   price: 10000
     *                   reservationStatus: "possible"
     *                   startDate: "2023-06-15T13:50:00"
     *                   reservationer: "왕동근"
     *                   reservationCount: 1
     *                   reservationerHp: "010-1234-1234"
     *                   payOptionCount: 1
     *                   payOption:
     *                     title: "차한잔 더?"
     *                     price: 5000
     *                     currentMember: 0
     *                     maxMember: 10
     *                 - planId: "46e3d466-60d7-4f10-b5aa-8db70316e1b0"
     *                   endDate: "2023-06-15T14:50:00"
     *                   instructor: "5b53e7aa-44b1-4b94-af8d-ef2416d14512"
     *                   price: 10000
     *                   reservationStatus: "possible"
     *                   startDate: "2023-06-15T13:50:00"
     *                   reservationer: "왕현철"
     *                   reservationCount: 2
     *                   reservationerHp: "010-1234-1234"
     *                   payOptionCount: 2
     *                   payOption:
     *                     title: "차한잔 더?"
     *                     price: 5000
     *                     currentMember: 0
     *                     maxMember: 10
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const footPrint: FootPrint = new FootPrint(await this.jthor.authUtil.makeFootprint(req));
        const result = await this.orderService.create(req, userInfo, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /order/complete:
     *   post:
     *     summary: Order Final Check 한다음에 하는거
     *     tags: [Order]
     *     requestBody:
     *       name: Order
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               merchant_uid:
     *                 type: string
     *                 require: true
     *                 example: "merchant_uid"
     *               imp_uid:
     *                 type: string
     *                 require: true
     *                 example: "imp_uid"
     */
    this.router.post('/complete', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const keys: CompleteDTO = await new CompleteDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.orderService.complete(keys, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /order/payFail:
     *   post:
     *     summary: 결제 창 오픈된 상태에서 취소될 경우
     *     tags: [Order]
     *     requestBody:
     *       name: Order
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               merchant_uid:
     *                 type: string
     *                 require: true
     *                 example: "merchant_uid"
     *               imp_uid:
     *                 type: string
     *                 require: true
     *                 example: "imp_uid"
     */
    this.router.post('/payFail', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const keys: CompleteDTO = await new CompleteDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.orderService.payFail(keys, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /order/payCancel:
     *   post:
     *     summary: 결제 승인 이후 DB 업데이트 작업 중 에러나 정원초과된 경우 승인 금액 취소
     *     tags: [Order]
     *     requestBody:
     *       name: Order
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               merchant_uid:
     *                 type: string
     *                 require: true
     *                 example: "merchant_uid"
     *               imp_uid:
     *                 type: string
     *                 require: true
     *                 example: "imp_uid"
     *               cancelAmount:
     *                 type: number
     *                 require: true
     *                 description: 취소 요청 금액 (결제 진행 중에는 전액으로 요청)
     *               reason:
     *                 type: string
     *                 require: true
     *                 description: 취소 사유
     */
    this.router.post('/payCancel', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const keys: CancelDTO = await new CancelDTO(req.body);
        const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.orderService.payCancel(keys, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        console.log(e);
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /order/cancel:
     *   put:
     *     summary: 관리자페이지 예약내역의 결제완료된 상품들 관리자권한으로 예약 취소
     *     tags: [Order]
     *     requestBody:
     *       name: Order
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               orderItemId:
     *                 type: string
     *                 require: true
     *                 example: "ODI202306230021"
     *               cancelAmount:
     *                 type: number
     *                 require: true
     *                 description: 취소 요청 금액 (결제 진행 중에는 전액으로 요청)
     */
    this.router.put('/cancel', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: OrderCancelDTO = await new OrderCancelDTO(req.body).valid();
        // const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.orderService.orderCancel(query);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        console.error(e);
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    // /**
    //  * @swagger
    //  * /order/canceling:
    //  *   put:
    //  *     summary: 예약 취소내역의 예약취소요청들어온 예약 취소
    //  *     tags: [Order]
    //  *     requestBody:
    //  *       name: Order
    //  *       required: true
    //  *       content:
    //  *         application/json:
    //  *           schema:
    //  *             type: object
    //  *             properties:
    //  *               orderItemId:
    //  *                 type: string
    //  *                 require: true
    //  *                 example: "ODI202306230021"
    //  */
    // this.router.put('/canceling', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
    //   try {
    //     const id: string = req.body.id;
    //     const result = await this.orderService.orderCanceling(id);
    //     this.jthor.resp.success(res, result.val);
    //   } catch (e: any) {
    //     this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
    //   }
    // });

    /**
     * @swagger
     * /order/refusal:
     *   put:
     *     summary: 예약 취소 거절
     *     tags: [Order]
     *     requestBody:
     *       name: Order
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               orderItemId:
     *                 type: string
     *                 require: true
     *                 example: "ODI202306230021"
     */
    this.router.put('/refusal', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const id: string = req.body.id;
        const result = await this.orderService.orderRefusal(id);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });
  }
  public getRouter(): Router {
    return this.router;
  }
}
