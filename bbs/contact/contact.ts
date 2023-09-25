import { Request, Router } from 'express';
import { validate } from 'class-validator';
import ContactService from './contact.service';
import { ContactDTO, ContactReqBody, ContactReqDTO } from './contact.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

export class ContactRouter {
  router: Router;
  contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /bbs/contact/:
     *   get:
     *     summary: Contact List New...
     *     tags: [Contact]
     *     responses:
     *       200:
     *         description: The list of Contact.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Contact'
     */
    this.router.get('/', async (req: any, res) => {
      const list = await this.contactService.GetList(req.query?.cursor, req.query?.limit, req.query?.keyword);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_110.code, jthor.resp.ErrorCode.ERR_110.message);
      }
    });

    /**
     * @swagger
     * /bbs/contact/{id}:
     *   get:
     *     summary: get contact By {id}
     *     tags: [Contact]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: path
     *        name: contact
     *     responses:
     *       200:
     *         description: Detail contact.
     *         content:
     *           application/json:
     */
    this.router.get('/:id', async (req, res) => {
      const result = await this.contactService.GetInfo(req.params.id);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /bbs/contact:
     *   post:
     *     summary: Create contact
     *     description: Create a new contact entry
     *     tags:
     *       - Contact
     *     parameters:
     *       - in: body
     *         name: contact
     *         description: contact object to be created
     *         required: true
     *         schema:
     *           $ref: '#/components/ContactReqBody'
     *     responses:
     *       200:
     *         description: Successful operation
     */
    this.router.post('/', jthor.authUtil.verifyToken, async (req: Request, res) => {
      const footprint = jthor.authUtil.makeFootprint(req);
      const dto = new ContactReqBody(req, footprint);
      // verify input parameters
      const errors = await validate(req);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.contactService.Create(dto, footprint);
        jthor.resp.success(res, result);
      }
    });

    /**
     * @swagger
     * /bbs/contact:
     *   put:
     *     summary: Update contact
     *     description: Update a new contact entry
     *     tags:
     *       - Contact
     *     parameters:
     *       - in: body
     *         name: contact
     *         description: contact object to be updated
     *         required: true
     *         schema:
     *           $ref: '#/components/contactDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     */
    this.router.put('/', async (req: Request, res) => {
      let params = await this.contactService.GetInfo(req.body.id);
      // console.log(params);
      if (params.val === undefined)
        jthor.resp.fail(
          res,
          jthor.resp.ErrorCode.ERR_100.code,
          jthor.resp.ErrorCode.ERR_100.message,
          '해당 ID 값의 데이터가 존재하지 않습니다.',
        );

      const footprint = jthor.authUtil.updateFootprint(req);
      const dto = new ContactReqBody(req, footprint);
      // verify input parameters
      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        const result = await this.contactService.Update(req, footprint);
        jthor.resp.success(res, result);
      }
    });

    /**
     * @swagger
     * /bbs/contact:
     *   delete:
     *     summary: delete contact
     *     description: delete contact data
     *     tags:
     *       - Contact
     *     parameters:
     *       - in: body
     *         name: contact
     *         description: contact object to be updated
     *         required: true
     *     responses:
     *       200:
     *         description: Successful operation
     */
    this.router.delete('/:id', jthor.authUtil.verifyToken, async (req, res) => {
      const result = await this.contactService.Delete(req.params.id, req.headers.bucket);
      jthor.resp.success(res, result);
    });

    return this.router;
  }
}
