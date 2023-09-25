import { Router } from 'express';
import NoticeService from './notice.service';
import { NoticeDTO } from './notice.model';
import { validate } from 'class-validator';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class NoticeRouter {
  router: Router;
  noticeService: NoticeService;

  constructor() {
    this.noticeService = new NoticeService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /bbs/notice/:
     *   get:
     *     summary: Notice List
     *     tags: [Notice]
     *     responses:
     *       200:
     *         description: The list of notice.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Notice'
     */
    this.router.get('/', async (req: any, res, next) => {
      if (!req.query.evt) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
        return;
      }
      const list = await this.noticeService.GetList(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
      }
    });

    /**
     * @swagger
     * /bbs/notice/all:
     *   get:
     *     summary: Notice list all for Admin
     *     tags: [Notice]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of notice.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Notice'
     */
    this.router.get('/all', async (req: any, res) => {
      const result = await this.noticeService.GetListAll(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/notice/{id}:
     *   get:
     *     summary: Notice Info
     *     tags: [Notice]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: path
     *        name: evt
     *        required: true
     *      - in: path
     *        name: id
     *        required: true
     *     responses:
     *       200:
     *         description: Detail info.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Notice'
     */
    this.router.get('/:evt/:id', async (req, res) => {
      const result = await this.noticeService.GetInfo(req.params.evt, req.params.id);
      jthor.resp.success(res, result?.val);
    });

    this.router.post('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      const dto = new NoticeDTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.noticeService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.put('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      let params = await this.noticeService.GetInfo(req.body.evt, req.body.id);
      params = {
        ...params.val,
        ...req.body,
      };
      const dto = new NoticeDTO(params);
      const footprint = jthor.authUtil.updateFootprint(req);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.noticeService.Update(dto, req.body.id, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.delete('/:id', jthor.authUtil.verifyToken, async (req, res) => {
      const result = await this.noticeService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
