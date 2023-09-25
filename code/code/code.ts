import { Router, Request } from 'express';
import CodeService from './code.service';
import { CodeDTO, CodeInfoDTO } from './code.model';
import { validate } from 'class-validator';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class CodeRouter {
  router: Router;
  codeService: CodeService;

  constructor() {
    this.codeService = new CodeService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /code/:
     *   get:
     *     summary: Code List
     *     tags: [Code]
     *     responses:
     *       200:
     *         description: The list of code.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Code'
     */
    this.router.get('/', async (req: any, res, next) => {
      const list = await this.codeService.GetList(req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message);
      }
    });

    /**
     * @swagger
     * /code/dash:
     *   get:
     *     summary: 대시보드
     *     tags: [Code]
     */
    this.router.get('/dash', async (req: Request, res) => {
      try {
        const result = await this.codeService.getDashBoard();
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, '???');
      }
    });

    this.router.get('/group/:group', async (req: any, res) => {
      const result = await this.codeService.GetListByGroup(req.params.group, req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result);
    });

    /**
     * @swagger
     * /code/{id}:
     *   get:
     *     summary: Code Info
     *     tags: [Code]
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
     *               $ref: '#/components/schemas/Code'
     */
    this.router.get('/:id', async (req, res) => {
      const result = await this.codeService.GetInfo(req.params.id);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /code:
     *   post:
     *     summary: Create Code
     *     tags:
     *       - Code
     *     requestBody:
     *       name: Code
     *       description: Code object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CodeInfoDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/', jthor.authUtil.verifyToken, async (req: Request, res, next) => {
      const footPrint = jthor.authUtil.makeFootprint(req);
      const dto = new CodeInfoDTO(req, footPrint);

      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.codeService.create(dto);
        jthor.resp.success(res, result);
      }
    });

    /**
     * @swagger
     * /code:
     *   put:
     *     summary: Update Code
     *     tags:
     *       - Code
     *     requestBody:
     *       name: Code
     *       description: Code object to be update
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CodeInfoDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      let params = await this.codeService.GetInfo(req.body.id);
      const footprint = jthor.authUtil.updateFootprint(req);
      const dto = new CodeInfoDTO(req, footprint);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.codeService.Update(dto, req.body.id);
        jthor.resp.success(res, result);
      }
    });

    /**
     * @swagger
     * /code/{id}:
     *   delete:
     *     summary: Delete Code
     *     tags:
     *       - Code
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     */
    this.router.delete('/:id', jthor.authUtil.verifyToken, async (req, res) => {
      const result = await this.codeService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
