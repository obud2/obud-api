import { Router, Request } from 'express';
import EmailService from './email.service';
import { CheckDTO, EmailDTO, SetPwDTO } from './email.model';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', false);

export class EmailRouter {
  router: Router;
  emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /email/checkVerify:
     *   get:
     *     summary: 이메일 인증번호 확인
     *     tags: [Email]
     *     parameters:
     *      - in: query
     *        name: toEmail
     *        required: true
     *      - in: query
     *        name: code
     *        required: true
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Email'
     */
    this.router.get('/checkVerify', async (req, res) => {
      const dto = new CheckDTO(req.query);
      const result = await this.emailService.CheckVerify(dto);
      if (result) jthor.resp.success(res, result);
      else jthor.resp.fail(res, 500, '유효하지 않은 인증입니다.');
    });

    /**
     * @swagger
     * /email/verify:
     *   post:
     *     summary: 이메일 인증코드 발송
     *     tags: [Email]
     *     parameters:
     *      - in: formData
     *        name: toEmail
     *        required: true
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Email'
     */
    this.router.post('/verify', async (req, res) => {
      const dto = new EmailDTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      const result = this.emailService.SendVerify(dto, footprint);
      jthor.resp.success(res, result);
    });

    /**
     * @swagger
     * /email/findPassword:
     *   post:
     *     summary: 비밀번호 찾기 인증코드 발송
     *     tags: [Email]
     *     parameters:
     *      - in: formData
     *        name: toEmail
     *        required: true
     *      - in: formData
     *        name: name
     *        required: true
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Email'
     */
    this.router.post('/findPassword', async (req, res) => {
      const dto = new EmailDTO(req.body);
      const footprint = jthor.authUtil.makeFootprint(req);

      const result = await this.emailService.FindPassword(dto, footprint);
      if (!result) jthor.resp.fail(res, 500, '존재하지 않는 사용자입니다.');
      else jthor.resp.success(res, result);
    });

    /**
     * @swagger
     * /email/changePassword:
     *   post:
     *     summary: 이메일, 인증번호가 일치하면 새로운 비밀번호로 변경
     *     tags: [Email]
     *     parameters:
     *      - in: formData
     *        name: email
     *        required: true
     *      - in: formData
     *        name: code
     *        required: true
     *      - in: formData
     *        name: newPassword
     *        required: true
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/Email'
     */
    this.router.post('/changePassword', async (req: Request, res) => {
      try {
        const pwInfo: SetPwDTO = new SetPwDTO(req.body);
        const result = await this.emailService.changePassword(pwInfo);
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, e, e.message, e);
      }
    });

    return this.router;
  }
}
