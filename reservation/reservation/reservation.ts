import { Router, Request } from 'express';
import ReservationService from './reservation.service';
import { GetReservationList, UserInfo } from './reservation.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class ReservationRouter {
  constructor(
    private readonly router: Router = Router(),
    private readonly jthor = new Jthor(config, '', false),
    private readonly reservationService: ReservationService = new ReservationService(),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /reservation/complete:
     *   get:
     *     summary: 예약관리 리스트
     *     tags: [Reservation]
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
    this.router.get('/complete', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetReservationList = new GetReservationList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result = await this.reservationService.getReservationList(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.reservationService.getReservationListForStudios(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 없습니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /reservation/complete/old:
     *   get:
     *     summary: 지난예약 관리 리스트
     *     tags: [Reservation]
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
    this.router.get('/complete/old', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetReservationList = new GetReservationList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result = await this.reservationService.getOldReservationList(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.reservationService.getOldReservationListForStudios(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 없습니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /reservation/cancel:
     *   get:
     *     summary: 예약취소관리 리스트 리스트
     *     tags: [Reservation]
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
    this.router.get('/cancel', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetReservationList = new GetReservationList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result = await this.reservationService.getCancelList(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.reservationService.getCancelListForStudios(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 부족합니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /reservation/canceling:
     *   get:
     *     summary: 예약취소요청  리스트
     *     tags: [Reservation]
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
    this.router.get('/canceling', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetReservationList = new GetReservationList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result = await this.reservationService.getCancelingList(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.reservationService.getCancelingListForStudios(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 부족합니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /reservation/refusal:
     *   get:
     *     summary: 예약 거절 리스트
     *     tags: [Reservation]
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
    this.router.get('/refusal', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetReservationList = new GetReservationList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result = await this.reservationService.getRefusalList(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.reservationService.getRefusalListForStudios(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 부족합니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    this.router.get('/cancel/check/:orderItemId', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const orderItemId: string = req.params.orderItemId;
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.reservationService.OrderCancelCheck(orderItemId, userInfo);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /reservation/cancel/{orderItemId}:
     *   put:
     *     summary: 예약 취소 요청
     *     tags: [Reservation]
     *     parameters:
     *       - in: path
     *         name: orderItemId
     *         schema:
     *           type: string
     */
    this.router.put('/cancel/:orderItemId', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const orderItemId: string = req.params.orderItemId;
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.reservationService.updateOrderItemCancel(orderItemId, userInfo);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });
  }

  getRouter() {
    return this.router;
  }
}
