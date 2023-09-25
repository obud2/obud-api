import { Router, Request } from 'express';
import InfoService from './info.service';
import { InfoDTO, InfoReqDTO, InfoReqBody } from './info.model';
import { validate } from 'class-validator';

// @ts-ignore
import Jthor from 'atoz-jthor';
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class InfoRouter {
  router: Router;
  infoService: InfoService;

  constructor() {
    this.infoService = new InfoService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /bbs/info/:
     *   get:
     *     summary: Info List
     *     tags: [Info]
     *     responses:
     *       200:
     *         description: The list of info.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Info'
     */
    this.router.get('/', async (req: any, res, next) => {
      const list = await this.infoService.GetList(req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message);
      }
    });

    /**
     * @swagger
     * /bbs/info/all:
     *   get:
     *     summary: Info list all for Admin
     *     tags: [Info]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of info.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Info'
     */
    this.router.get('/all', async (req: any, res) => {
      const result = await this.infoService.GetListAll(req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/info/{id}:
     *   get:
     *     summary: Info Info
     *     tags: [Info]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: path
     *        name: id
     *        required: true
     *     responses:
     *       200:
     *         description: Detail info.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Info'
     */
    this.router.get('/:id', async (req, res) => {
      const result = await this.infoService.GetInfo(req.params.id);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/info:
     *   post:
     *     summary: Create Info
     *     description: Create a new Info entry
     *     tags:
     *       - Info
     *     parameters:
     *       - in: body
     *         name: Info
     *         description: Info object to be created
     *         required: true
     *         schema:
     *           $ref: '#/components/InfoReqBody'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/definitions/SuccessResponse'
     */
    this.router.post('/', jthor.authUtil.verifyToken, async (req: InfoReqDTO, res, next) => {
      const footprint = jthor.authUtil.makeFootprint(req);
      const dto = new InfoReqBody(req, footprint);

      // verify input parameters
      const errors = await validate(req);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.infoService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    /**
     * @swagger
     * /bbs/info:
     *   put:
     *     summary: Update Info
     *     description: Update a new Info entry
     *     tags:
     *       - Info
     *     parameters:
     *       - in: body
     *         name: Info
     *         description: Info object to be updated
     *         required: true
     *         schema:
     *           $ref: '#/components/InfoDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', jthor.authUtil.verifyToken, async (req: InfoReqDTO, res, next) => {
      let params = await this.infoService.GetInfo(req.body.id);
      console.log(params);
      if (params.val === undefined)
        jthor.resp.fail(
          res,
          jthor.resp.ErrorCode.ERR_100.code,
          jthor.resp.ErrorCode.ERR_100.message,
          '해당 ID 값의 데이터가 존재하지 않습니다.',
        );

      const footprint = jthor.authUtil.updateFootprint(req);
      const dto = new InfoReqBody(req, footprint);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.infoService.Update(req, footprint);
        jthor.resp.success(res, result);
      }
    });

    /**
     * @swagger
     * /bbs/info:
     *   delete:
     *     summary: delete Info
     *     description: delete info data
     *     tags:
     *       - Info
     *     parameters:
     *       - in: body
     *         name: Info
     *         description: Info object to be updated
     *         required: true
     *         schema:
     *           $ref: '#/components/InfoDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.delete('/:id', jthor.authUtil.verifyToken, async (req, res) => {
      const result = await this.infoService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
