import { Request, Router } from 'express';
import StudiosService from './studios.service';
import { StudiosDataType, StudiosDTO, StudiosList } from './studios.model';
import { FootPrint, GetListRequestDTO, ResponseDTO } from '../dto/request/RequestDTO';
import { UserInfo } from '../order/order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class StudiosRouter {
  constructor(
    private readonly router: Router = Router(),
    private studiosService: StudiosService = new StudiosService(),
    private jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /studios:
     *   get:
     *     summary: Get Studios List
     *     tags: [Studios]
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
     *       - in: sort
     *         name: sort
     *         schema:
     *           type: string
     */
    this.router.get('/', async (req: Request, res) => {
      const query: GetListRequestDTO = new GetListRequestDTO(req.query);
      const result: ResponseDTO<StudiosList> = await this.studiosService.getList(query);
      if (result.result === this.jthor.resp.SUCCESS) {
        // @ts-ignore
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } else {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, this.jthor.resp.ErrorCode.ERR_100.message);
      }
    });

    /**
     * @swagger
     * /studios/all:
     *   get:
     *     summary: Get Studios All List
     *     tags: [Studios]
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
    this.router.get('/all', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetListRequestDTO = new GetListRequestDTO(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result: ResponseDTO<StudiosList> = await this.studiosService.getListAll(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.studiosService.getListByUserId(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0120') {
          const result = await this.studiosService.getListByInstructorUserId(query, userInfo);
          this.jthor.resp.success(res, result.val, result?.cursor, result?.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 없습니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/{id}:
     *   get:
     *     summary: Get Studios
     *     tags: [Studios]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: userId
     *         required: false
     */
    this.router.get('/:id', async (req: Request, res) => {
      const id: string = req.params.id;
      const userId: any = req.query?.userId;
      const result: ResponseDTO<StudiosDTO> = await this.studiosService.findById(id, userId);
      // @ts-ignore
      this.jthor.resp.success(res, result.val);
    });

    /**
     * @swagger
     * /studios:
     *   post:
     *     summary: Create Studios
     *     tags:
     *       - Studios
     *     requestBody:
     *       name: Studios
     *       description: Studios object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StudiosInfoDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto = await new StudiosDTO(req.body).valid();
        const footPrint: FootPrint = this.jthor.authUtil.makeFootprint(req);
        const result = await this.studiosService.create(dto, footPrint);
        result.val.refund = await this.studiosService.createRefund(req.body.refund, result.val.id);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, this.jthor.resp.ErrorCode.ERR_100.message, e.message);
      }
    });

    /**
     * @swagger
     * /studios/clone/{id}:
     *   post:
     *     summary: Clone Studios
     *     tags: [Studios]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    this.router.post('/clone/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const id: string = req.params.id;
      const footPrint = this.jthor.authUtil.makeFootprint(req);
      try {
        const result: StudiosDTO = await this.studiosService.clone(id, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, this.jthor.resp.ErrorCode.ERR_100.message, e.message);
      }
    });

    /**
     * @swagger
     * /studios/sort:
     *   post:
     *     summary: Sorting Studios
     *     tags:
     *       - Studios
     *     requestBody:
     *       name: Studios
     *       description: Studios object to be Sorting
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/DataType'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */

    this.router.post('/sort', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const data: StudiosDataType = req.body;
      const result = await this.studiosService.sorting(data);
      this.jthor.resp.success(res, result);
    });

    /**
     * @swagger
     * /studios:
     *   put:
     *     summary: Update Studios
     *     tags:
     *       - Studios
     *     requestBody:
     *       name: Studios
     *       description: Studios object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StudiosInfoDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto = (await new StudiosDTO(req.body).valid()).removeUndefinedProperties();
        const footPrint: FootPrint = this.jthor.authUtil.updateFootprint(req);
        const result = await this.studiosService.update(dto, footPrint);
        result.val.refund = await this.studiosService.updateRefund(req.body.refund, dto.id);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, this.jthor.resp.ErrorCode.ERR_100.message, e.message);
      }
    });

    /**
     * @swagger
     * /studios/{id}:
     *   delete:
     *     summary: Delete Studios
     *     tags:
     *       - Studios
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     */
    this.router.delete('/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const id: string = req.params.id;
      const bucket: string | string[] | undefined = req.headers.bucket;
      try {
        const result = await this.studiosService.delete(id, bucket);
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
