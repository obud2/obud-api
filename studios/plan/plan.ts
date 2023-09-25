import { Router, Request } from 'express';
import PlanService from './plan.service';
import { GetCalendarList, GetPlanList, MultiDTO, Plan, PlanDTO, UpdatePlanDTO } from './plan.model';
import { FootPrint, ResponseDTO } from '../dto/request/RequestDTO';
import { THIS_IS_ME } from '../constant';
import { UserInfo } from '../order/order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class PlanRouter {
  constructor(
    private readonly router: Router = Router(),
    private planService: PlanService = new PlanService(),
    private jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /studios/plan:
     *   get:
     *     summary: Get Plan List
     *     tags: [Plan]
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
     *         name: lessonId
     *         schema:
     *           type: string
     */
    this.router.get('/', async (req: Request, res) => {
      const query: GetPlanList = new GetPlanList(req.query);
      try {
        const result = await this.planService.getListByLesson(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/month:
     *   get:
     *     summary: Get Plan List
     *     tags: [Plan]
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
     *         name: lessonId
     *         schema:
     *           type: string
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     */
    this.router.get('/month', async (req: Request, res) => {
      const query: GetPlanList = new GetPlanList(req.query);
      try {
        const result = await this.planService.getListByMonth(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/month/all:
     *   get:
     *     summary: Get Plan List Admin
     *     tags: [Plan]
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
     *         name: lessonId
     *         schema:
     *           type: string
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     */
    this.router.get('/month/all', async (req: Request, res) => {
      const query: GetPlanList = new GetPlanList(req.query);
      try {
        const result = await this.planService.getListByMonthAll(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/all:
     *   get:
     *     summary: Get Plan List
     *     tags: [Plan]
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
     *         name: lessonId
     *         schema:
     *           type: string
     */
    this.router.get('/all', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const query: GetPlanList = new GetPlanList(req.query);
      try {
        const result = await this.planService.getListAllByLesson(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/instructor:
     *   get:
     *     summary: Get Plan List
     *     tags: [Plan]
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
     *         name: date
     *         schema:
     *           type: string
     */
    this.router.get('/instructor', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group !== 'GR0120') {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '강사 권한의 계정이 아닙니다.');
        }
        const query: GetPlanList = new GetPlanList(req.query);
        const result = await this.planService.getListByInstructor(query, userInfo);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/calendar:
     *   get:
     *     summary: Get Plan List
     *     tags: [Plan]
     *     parameters:
     *       - in: query
     *         name: studiosId
     *         schema:
     *           type: string
     *       - in: query
     *         name: lessonId
     *         schema:
     *           type: string
     *       - in: query
     *         name: cursor
     *         schema:
     *           type: string
     *       - in: query
     *         name: limit
     *         schema:
     *           type: number
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     */
    this.router.get('/calendar', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const query: GetCalendarList = new GetCalendarList(req.query).valid();
        if (userInfo.group === 'GR0100' || userInfo.group === 'GR0110') {
          const result = await this.planService.getListByInStudios(query, userInfo);
          this.jthor.resp.success(res, result);
        } else if (userInfo.group === 'GR0120') {
          const result = await this.planService.getListByInStudiosAndInstructor(query, userInfo);
          this.jthor.resp.success(res, result);
        } else {
          throw new Error('권한이 없습니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/calendar/dayInfo:
     *   get:
     *     summary: Get Plan List
     *     tags: [Plan]
     *     parameters:
     *       - in: query
     *         name: studiosId
     *         schema:
     *           type: string
     *       - in: query
     *         name: lessonId
     *         schema:
     *           type: string
     *       - in: query
     *         name: cursor
     *         schema:
     *           type: string
     *       - in: query
     *         name: limit
     *         schema:
     *           type: number
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     */
    this.router.get('/calendar/dayInfo', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const userInfo: UserInfo = new UserInfo(req.headers);
        const query: GetCalendarList = new GetCalendarList(req.query).validDay();
        if (userInfo.group === 'GR0100' || userInfo.group === 'GR0110') {
          const result = await this.planService.getListByInStudiosAndDay(query, userInfo);
          this.jthor.resp.success(res, result);
        } else if (userInfo.group === 'GR0120') {
          const result = await this.planService.getListByInStudiosAndInstructorAndDay(query, userInfo);
          this.jthor.resp.success(res, result);
        } else {
          throw new Error('권한이 없습니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/{id}:
     *   get:
     *     summary: Get plan Info
     *     tags: [Plan]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     */
    this.router.get('/:id', async (req: Request, res) => {
      const id: string = req.params.id;
      try {
        const result = await this.planService.findById(id);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan:
     *   post:
     *     summary: Create plan
     *     tags: [Plan]
     *     requestBody:
     *       name: Plan
     *       description: Plan object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PlanDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: PlanDTO = await new PlanDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(await this.jthor.authUtil.makeFootprint(req));
        const result: ResponseDTO<Plan> = await this.planService.create(dto, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/clone/{id}:
     *   post:
     *     summary: Clone plan
     *     tags: [Plan]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    this.router.post('/clone/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const id: string = req.params.id;
      const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.makeFootprint(req));
      try {
        const result = await this.planService.clone(id, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    // this.router.post('/multi', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
    this.router.post('/multi', async (req: Request, res) => {
      const multi: MultiDTO = await new MultiDTO(req.body).valid();
      const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.makeFootprint(req));
      try {
        const result = await this.planService.multi(multi, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan:
     *   put:
     *     summary: Update plan
     *     tags: [Plan]
     *     requestBody:
     *       name: Plan
     *       description: Plan object to be update
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PlanDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: UpdatePlanDTO = new UpdatePlanDTO(req.body).removeUndefinedProperties();
        const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.planService.update(dto, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/attendance:
     *   put:
     *     summary: 출석체크
     *     tags: [Plan]
     *     requestBody:
     *       name: Plan
     *       description: Plan object to be update
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               orderItemId:
     *                 type: string
     *                 require: true
     *                 example: "ODI202306290005"
     *               isAttendance:
     *                 type: boolean
     *                 require: true
     *                 example: true
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/attendance', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const orderItemId: string = req.body.orderItemId;
        const isAttendance: boolean = req.body.isAttendance;
        const result = await this.planService.updateAttendance(orderItemId, isAttendance);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/comment:
     *   put:
     *     summary: 플랜상세에 예약자들 리스트 에 코멘트 작성.
     *     tags: [Plan]
     *     requestBody:
     *       name: Plan
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               orderItemId:
     *                 type: string
     *                 require: true
     *                 example: "ODI202306290005"
     *               comment:
     *                 type: string
     *                 require: true
     *                 example: "2명만 출석"
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/comment', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const orderItemId: string = req.body.orderItemId;
        const comment: string = req.body.comment;
        const result = await this.planService.updateComment(orderItemId, comment);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/plan/{id}:
     *   delete:
     *     summary: Delete Plan
     *     tags: [Plan]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     */
    this.router.delete('/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const id: string = req.params.id;
      const bucket: string | string[] | undefined = req.headers.bucket;
      try {
        const result = await this.planService.delete(id, bucket);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    this.router.delete('/deleteCartByPlanId/:planId', async (req: Request, res) => {
      if (req.header('X-Internal-Request') !== THIS_IS_ME) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, 'The request is not from the API');
      }
      const result = await this.planService.deleteCartByPlanId(req.params.planId);
      this.jthor.resp.success(res, result);
    });
  }

  public getRouter() {
    return this.router;
  }
}
