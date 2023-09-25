import { Router, Request } from 'express';
import BannerService from './banner.service';
import { BannerDTO } from './banner.model';
import { FootPrint } from '../dto/request/RequestDTO';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');

export class BannerRouter {
  constructor(
    private readonly router: Router = Router(),
    private bannerService: BannerService = new BannerService(),
    private jthor = new Jthor(config, '', true),
  ) {}

  handle() {
    /**
     * @swagger
     * /banner/{id}:
     *   get:
     *     summary: Get banner Info
     *     tags: [Banner]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     */
    this.router.get('/:id', async (req: Request, res) => {
      const id: string = req.params.id;
      try {
        const result = await this.bannerService.findById(id);
        this.jthor.resp.success(res, result.val);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });
    /**
     * @swagger
     * /banner:
     *   post:
     *     summary: Create banner
     *     tags: [Banner]
     *     requestBody:
     *       name: Banner
     *       description: Banner object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BannerDTO'
     */
    this.router.post('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: BannerDTO = await new BannerDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(await this.jthor.authUtil.makeFootprint(req));
        const result = await this.bannerService.create(dto, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /banner:
     *   put:
     *     summary: Update banner
     *     tags: [Banner]
     *     requestBody:
     *       name: Banner
     *       description: Banner object to be update
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BannerDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', this.jthor.authUtil.verifyToken, async (req: Request, res) => {
      try {
        const dto: BannerDTO = await new BannerDTO(req.body).valid();
        const footPrint: FootPrint = new FootPrint(this.jthor.authUtil.updateFootprint(req));
        const result = await this.bannerService.update(dto, footPrint);
        this.jthor.resp.success(res, result);
      } catch (e: any) {
        this.jthor.resp.fail(res, this.jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    return this.router;
  }
}
