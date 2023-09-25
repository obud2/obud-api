import { Router } from 'express';
import FaqService from './faq.service';
import { FaqDTO } from './faq.model';
import { validate } from 'class-validator';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class FaqRouter {
  router: Router;
  faqService: FaqService;

  constructor() {
    this.faqService = new FaqService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /bbs/faq/:
     *   get:
     *     summary: Faq List
     *     tags: [Faq]
     *     responses:
     *       200:
     *         description: The list of faq.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Faq'
     */
    this.router.get('/', async (req: any, res, next) => {
      if (!req.query.evt) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
        return;
      }
      const list = await this.faqService.GetList(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
      }
    });

    /**
     * @swagger
     * /bbs/faq/all:
     *   get:
     *     summary: Faq list all for Admin
     *     tags: [Faq]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of faq.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Faq'
     */
    this.router.get('/all', async (req: any, res) => {
      const result = await this.faqService.GetListAll(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/faq/{id}:
     *   get:
     *     summary: Faq Info
     *     tags: [Faq]
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
     *               $ref: '#/components/schemas/Faq'
     */
    this.router.get('/:evt/:id', async (req, res) => {
      const result = await this.faqService.GetInfo(req.params.evt, req.params.id);
      jthor.resp.success(res, result?.val);
    });

    this.router.post('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      const dto = new FaqDTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.faqService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.put('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      let params = await this.faqService.GetInfo(req.body.evt, req.body.id);
      params = {
        ...params.val,
        ...req.body,
      };
      const dto = new FaqDTO(params);
      const footprint = jthor.authUtil.updateFootprint(req);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.faqService.Update(dto, req.body.id, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.delete('/:id', jthor.authUtil.verifyToken, async (req, res) => {
      const result = await this.faqService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
