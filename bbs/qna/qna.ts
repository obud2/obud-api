import { Router } from 'express';
import QnAService from './qna.service';
import { QnADTO } from './qna.model';
import { validate } from 'class-validator';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class QnARouter {
  router: Router;
  qnaService: QnAService;

  constructor() {
    this.qnaService = new QnAService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /bbs/qna/:
     *   get:
     *     summary: QnA List
     *     tags: [QnA]
     *     responses:
     *       200:
     *         description: The list of qna.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/QnA'
     */
    this.router.get('/', async (req: any, res, next) => {
      if (!req.query.evt) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
        return;
      }
      const list = await this.qnaService.GetList(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
      }
    });

    /**
     * @swagger
     * /bbs/qna/all:
     *   get:
     *     summary: QnA list all for Admin
     *     tags: [QnA]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of qna.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/QnA'
     */
    this.router.get('/all', async (req: any, res) => {
      const result = await this.qnaService.GetListAll(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/qna/{id}:
     *   get:
     *     summary: QnA Info
     *     tags: [QnA]
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
     *               $ref: '#/components/schemas/QnA'
     */
    this.router.get('/:evt/:id', async (req, res) => {
      const result = await this.qnaService.GetInfo(req.params.evt, req.params.id);
      jthor.resp.success(res, result?.val);
    });

    this.router.post('/', async (req, res, next) => {
      const dto = new QnADTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.qnaService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.put('/', async (req, res, next) => {
      let params = await this.qnaService.GetInfo(req.body.evt, req.body.id);
      params = {
        ...params.val,
        ...req.body,
      };
      const dto = new QnADTO(params);
      const footprint = jthor.authUtil.updateFootprint(req);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.qnaService.Update(dto, req.body.id, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.delete('/:id', async (req, res) => {
      const result = await this.qnaService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
