import { Router, Request } from 'express';
import LessonService from './lesson.service';
import { FootPrint } from '../dto/request/RequestDTO';
import { LessonDataType, GetLessonList, Lesson, LessonDTO } from './lesson.model';
import { UserInfo } from '../order/order.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class LessonRouter {
  constructor(
    private readonly router: Router = Router(),
    private lessonService: LessonService = new LessonService(),
    private jthor = new Jthor(config, '', false),
  ) {
    this.setRouter();
  }

  private setRouter() {
    /**
     * @swagger
     * /studios/lesson:
     *   get:
     *     summary: Get Lesson List
     *     tags: [Lesson]
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
     *         name: studiosId
     *         schema:
     *           type: string
     */
    this.router.get('/', async (req: Request, res) => {
      const query: GetLessonList = new GetLessonList(req.query);
      try {
        const result = await this.lessonService.getListByStudios(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/all:
     *   get:
     *     summary: Get All Lesson List
     *     tags: [Lesson]
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
     *         name: studiosId
     *         schema:
     *           type: string
     */
    this.router.get('/all', async (req: Request, res) => {
      const query: GetLessonList = new GetLessonList(req.query);
      try {
        const result = await this.lessonService.getListAllByStudios(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/special:
     *   get:
     *     summary: Get Special Lesson List
     *     tags: [Lesson]
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
    this.router.get('/special', async (req: Request, res) => {
      const query: GetLessonList = new GetLessonList(req.query);
      try {
        const result = await this.lessonService.getListSpecialByStudios(query);
        this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/special/all:
     *   get:
     *     summary: Get Special Lesson List
     *     tags: [Lesson]
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
    this.router.get('/special/all', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const query: GetLessonList = new GetLessonList(req.query);
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const result = await this.lessonService.getListAllSpecialByStudios(query);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const result = await this.lessonService.getListAllSpecialByStudiosAdmin(query, userInfo);
          this.jthor.resp.success(res, result.val, result.cursor, result.backCursor);
        } else {
          this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, '권한이 업습니다.');
        }
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/{id}:
     *   get:
     *     summary: Get Lesson Info
     *     tags: [Lesson]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     */
    this.router.get('/:id', async (req: Request, res) => {
      const id: string = req.params.id;
      try {
        const result = await this.lessonService.findById(id);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson:
     *   post:
     *     summary: Create Lesson
     *     tags: [Lesson]
     *     requestBody:
     *       name: Lesson
     *       description: Lesson object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LessonDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: LessonDTO = await new LessonDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(await this.jthor.authUtil.makeFootprint(req));
        const result = await this.lessonService.create(dto, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/sort:
     *   post:
     *     summary: Sorting Lesson
     *     tags: [Lesson]
     *     requestBody:
     *       name: Lesson
     *       description: Lesson object to be Sorting
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LessonDataType'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/sort', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const data: LessonDataType = req.body;
      try {
        const result = await this.lessonService.sorting(data);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/sort/special:
     *   post:
     *     summary: Sorting Lesson
     *     tags: [Lesson]
     *     requestBody:
     *       name: Lesson
     *       description: Lesson object to be Sorting
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LessonDataType'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/sort/special', async (req: Request, res) => {
      const data: LessonDataType = req.body;
      try {
        const result = await this.lessonService.specialSorting(data);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/clone/{id}:
     *   post:
     *     summary: Clone lesson
     *     tags: [Lesson]
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
        const result = await this.lessonService.clone(id, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson:
     *   put:
     *     summary: Update Lesson
     *     tags: [Lesson]
     *     requestBody:
     *       name: Lesson
     *       description: Lesson object to be update
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LessonDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: LessonDTO = await new LessonDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.lessonService.update(dto, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /studios/lesson/{id}:
     *   delete:
     *     summary: Delete Lesson
     *     tags: [Lesson]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     */
    this.router.delete('/:id', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      const id: string = req.params.id;
      const bucket: string | string[] | undefined = req.headers.bucket;
      try {
        const result = await this.lessonService.delete(id, bucket);
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
