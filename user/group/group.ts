import { Router } from 'express';
import GroupService from './group.service';
import { GroupDTO } from './group.model';
import { validate } from 'class-validator';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class GroupRouter {
  router: Router;
  groupService: GroupService;

  constructor() {
    this.groupService = new GroupService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /group/:
     *   get:
     *     summary: Group List
     *     tags: [Group]
     *     responses:
     *       200:
     *         description: The list of group.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Group'
     */
    this.router.get('/', async (req: any, res, next) => {
      const list = await this.groupService.GetList(req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message);
      }
    });

    /**
     * @swagger
     * /user/group/all:
     *   get:
     *     summary: Group list all for Admin
     *     tags: [Group]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of group.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Group'
     */
    this.router.get('/all', async (req: any, res) => {
      const result = await this.groupService.GetListAll(req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /user/group/{id}:
     *   get:
     *     summary: Group Info
     *     tags: [Group]
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
     *               $ref: '#/components/schemas/Group'
     */
    this.router.get('/:id', async (req, res) => {
      const result = await this.groupService.GetInfo(req.params.id);
      jthor.resp.success(res, result?.val);
    });

    this.router.post('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      const dto = new GroupDTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.groupService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.put('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      let params = await this.groupService.GetInfo(req.body.id);
      params = {
        ...params.val,
        ...req.body,
      };
      const dto = new GroupDTO(params);
      const footprint = jthor.authUtil.updateFootprint(req);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.groupService.Update(dto, req.body.id, footprint);
        jthor.resp.success(res, result);
      }
    });

    this.router.delete('/:id', jthor.authUtil.verifyToken, async (req, res) => {
      const result = await this.groupService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
