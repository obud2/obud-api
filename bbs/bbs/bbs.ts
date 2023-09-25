import { Router } from 'express';
import BbsService from './bbs.service';
import { BbsDTO } from './bbs.model';
import { validate } from 'class-validator';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class BbsRouter {
  router: Router;
  bbsService: BbsService;

  constructor() {
    this.bbsService = new BbsService();
    this.router = Router();
  }

  handle() {

    // this.router.get('/createTable', (req, res) => {
    //   const index = ['status-createdAt-index'];
    //   this.bbsService.createTable()
    // });
    /**
     * @swagger
     * /bbs:
     *   get:
     *     summary: Bbs List
     *     tags: [Bbs]
     *     responses:
     *       200:
     *         description: The list of bbs.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Bbs'
     */
    this.router.get('/', async (req: any, res, next) => {
      if (!req.query.evt) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
        return;
      }
      const list = await this.bbsService.GetList(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
      }
    });

    /**
     * @swagger
     * /bbs/all:
     *   get:
     *     summary: Bbs list all for Admin
     *     tags: [Bbs]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of bbs.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Bbs'
     */
    this.router.get('/all', async (req: any, res) => {
      const result = await this.bbsService.GetListAll(req.query?.evt, req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/{id}:
     *   get:
     *     summary: Bbs Info
     *     tags: [Bbs]
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
     *               $ref: '#/components/schemas/Bbs'
     */
    this.router.get('/:evt/:id', async (req, res) => {
      const result = await this.bbsService.GetInfo(req.params.evt, req.params.id);
      jthor.resp.success(res, result?.val);
    });

    this.router.post('/', async (req, res, next) => {
      const dto = new BbsDTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.bbsService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.put('/', async (req, res, next) => {
      let params = await this.bbsService.GetInfo(req.body.evt, req.body.id);
      params = {
        ...params.val,
        ...req.body,
      };
      const dto = new BbsDTO(params);
      const footprint = jthor.authUtil.updateFootprint(req);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.bbsService.Update(dto, req.body.id, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.delete('/:id', async (req, res) => {
      const result = await this.bbsService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
