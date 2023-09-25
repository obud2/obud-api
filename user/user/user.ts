import { Router, Request, Response } from 'express';
import UserService from './user.service';
import { DeleteInstructorDTO, FindIdRequest, FindUserDTO, GetUserInfoReq, TempUser, UserDTO, UserInfo } from './user.model';
import { validate } from 'class-validator';
import axios from 'axios';
import { THIS_IS_ME } from '../constant';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', false);
const API_URL = 'https://api.obud.site';
export class UserRouter {
  router: Router;
  userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
  }

  handle() {
    /**
     * @swagger
     * /user/:
     *   get:
     *     summary: User List - ROLE이 USR
     *     tags: [User]
     *     responses:
     *       200:
     *         description: The list of user.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/User'
     */
    this.router.get('/', jthor.authUtil.verifyToken, async (req, res) => {
      try {
        const query = new GetUserInfoReq(req.query, 'USR');
        const userInfo: UserInfo = new UserInfo(req.headers);
        if (userInfo.group === 'GR0100') {
          const list = await this.userService.GetListByRole(query);
          jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
        } else if (userInfo.group === 'GR0110') {
          const list = await this.userService.getListByRoleUseStudios(query, userInfo);
          jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
        } else {
          jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, '권한이 부족합니다.');
        }
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message);
      }
    });

    /**
     * @swagger
     * /user/admin:
     *   get:
     *     summary: Admin List - ROLE이 ADMIN
     *     tags: [User]
     *     parameters:
     *       - in: query
     *         name: cursor
     *         schema:
     *           type: string
     *       - in: query
     *         name: limit
     *         schema:
     *           type: number
     *       - in: query
     *         name: keyword
     *         schema:
     *           type: string
     *       - in: query
     *         name: group
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The list of user.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/User'
     */
    this.router.get('/admin', jthor.authUtil.verifyToken, async (req, res, next) => {
      const query: GetUserInfoReq = new GetUserInfoReq(req.query, 'ADMIN');
      const list = await this.userService.GetListByRole(query);
      if (list.result === jthor.resp.SUCCESS) {
        jthor.resp.success(res, list?.val, list?.cursor, list?.backCursor);
      } else {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message);
      }
    });

    /**
     * @swagger
     * /user/all:
     *   get:
     *     summary: User list all for Admin
     *     tags: [User]
     *     consumes:
     *      - application/json
     *     responses:
     *       200:
     *         description: The list of user.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                $ref: '#/components/schemas/User'
     */
    this.router.get('/all', jthor.authUtil.verifyToken, async (req: any, res) => {
      const result = await this.userService.GetListAll(req.query?.cursor, req.query?.limit, req.query?.keyword);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /user/check:
     *   get:
     *     summary: Check User (check already exist)
     *     tags: [User]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: query
     *        name: type
     *        required: true
     *      - in: query
     *        name: value
     *        required: true
     *     responses:
     *       200:
     *         description: Check User (check already exist)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    this.router.get('/check', async (req, res) => {
      const type = req.query.type ? req.query.type : 'id';
      const value = req.query.value ? req.query.value : 'none';
      this.userService
        .Find(String(type), String(value))
        .then(result => {
          jthor.resp.success(res, result);
        })
        .catch(err => {
          jthor.resp.fail(res, err);
        });
    });

    /**
     * @swagger
     * /user/findId:
     *   get:
     *     summary: 아이디 찾기
     *     tags: [User]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: query
     *        name: name
     *        required: true
     *      - in: query
     *        name: hp
     *        required: true
     *     responses:
     *       200:
     *         description: Check User (check already exist)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    this.router.get('/findId', async (req: Request, res) => {
      try {
        const obj: FindIdRequest = await new FindIdRequest(req.query).valid();
        const result = await this.userService.findId(obj);
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    this.router.get('/instructor', jthor.authUtil.verifyToken, async (req, res, next) => {
      try {
        const { studiosAdminId, keyword } = req.query;
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.userService.findByInstructorInStudios(studiosAdminId, keyword, userInfo);
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /user/{id}:
     *   get:
     *     summary: User Detail Info.
     *     tags: [User]
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
     *               $ref: '#/components/schemas/User'
     */
    this.router.get('/:id', async (req, res) => {
      const result = await this.userService.GetInfo(req.params.id);
      jthor.resp.success(res, result?.val);
    });

    /**
     * @swagger
     * /user:
     *   post:
     *     summary: Create User role USR
     *     tags: [User]
     *     requestBody:
     *       name: User
     *       description: User object to be created
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserDTO'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.post('/', async (req: Request, res, next) => {
      const footPrint = jthor.authUtil.makeFootprint(req);
      const user: UserDTO = new UserDTO(req.body);
      await this.valid(user, res);
      this.userService
        .create(user, footPrint)
        .then(result => {
          jthor.resp.success(res, result);
        })
        .catch(err => {
          jthor.resp.fail(res, err, err.message, err);
        });
    });

    /**
     * @swagger
     * /user/getCertificate:
     *   post:
     *     summary: 인증번호 이메일로 발송
     *     tags: [User]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *             required:
     *               - email
     */
    this.router.post('/getCertificate', async (req: Request, res) => {
      try {
        const email: string = req.body.email;
        const result = await this.userService.getCertificate(email);
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    this.router.post('/temporaryLogin', async (req: Request, res) => {
      try {
        const tempUser: TempUser = new TempUser(req.body);
        const result = await this.userService.temporaryLogin(tempUser);
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, e.message, e);
      }
    });

    /**
     * @swagger
     * /user:
     *   put:
     *     summary: Update User
     *     tags: [User]
     *     requestBody:
     *       name: User
     *       description: User object to be Update
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/', jthor.authUtil.verifyToken, async (req, res, next) => {
      const existUser = await this.userService.GetInfo(req.body.id);
      const params: any = {
        ...existUser.val,
        ...req.body,
      };

      const dto = new UserDTO(params);
      const footprint = jthor.authUtil.updateFootprint(req);

      const errors = await validate(dto);
      if (errors.length) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
      } else {
        this.userService
          .Update(dto, req.body.id, footprint)
          .then(result => {
            jthor.resp.success(res, result);
          })
          .catch(err => {
            jthor.resp.fail(res, err);
          });
      }
    });

    this.router.put('/instructor', jthor.authUtil.verifyToken, async (req, res, next) => {
      try {
        const dto: FindUserDTO = new FindUserDTO(req.body);
        const footprint = jthor.authUtil.updateFootprint(req);
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.userService.findUserAfterInstructor(dto, footprint, userInfo);
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    this.router.delete('/instructor', jthor.authUtil.verifyToken, async (req, res, next) => {
      try {
        console.log(req);
        const dto: DeleteInstructorDTO = new DeleteInstructorDTO(req.query);
        const footprint = jthor.authUtil.updateFootprint(req);
        const userInfo: UserInfo = new UserInfo(req.headers);
        const result = await this.userService.deleteInstructorFromAdmin(dto, footprint, userInfo);
        jthor.resp.success(res, result.val);
      } catch (e: any) {
        jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, e.message);
      }
    });

    /**
     * @swagger
     * /user/visit:
     *   put:
     *     summary: 계정 일별로 로그인하면 visitCount 1 증가
     *     tags: [User]
     *     requestBody:
     *       name: User
     *       description: User object to be Update
     *     responses:
     *       200:
     *         description: Successful operation
     *         schema:
     *           $ref: '#/components/SuccessResponse'
     */
    this.router.put('/visit', async (req: Request, res) => {
      try {
        const result = await this.userService.putVisitCount();
        jthor.resp.success(res, result);
      } catch (e: any) {
        jthor.resp.fail(res, e, e.message);
      }
    });

    this.router.delete('/', jthor.authUtil.verifyToken, async (req, res) => {
      const userInfo: UserInfo = new UserInfo(req.headers);
      this.userService
        .Delete(userInfo.id, req.headers.bucket)
        .then(result => {
          jthor.resp.success(res, result);
        })
        .catch(err => {
          jthor.resp.fail(res, err);
        });
    });

    /**
     * @swagger
     * /user/leave:
     *   put:
     *     summary: Leave the site.
     *     tags: [User]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: body
     *        name: id
     *        required: true
     *     responses:
     *       200:
     *         description: Leave the site.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    this.router.put('/leave', jthor.authUtil.verifyToken, async (req, res) => {
      this.userService
        .Disable(req.body.id)
        .then(result => {
          jthor.resp.success(res, result);
        })
        .catch(err => {
          jthor.resp.fail(res, err);
        });
    });

    /**
     * @swagger
     * /user/restore:
     *   put:
     *     summary: Restore membership the site.
     *     tags: [User]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: body
     *        name: id
     *        required: true
     *     responses:
     *       200:
     *         description: Restore membership the site.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    this.router.put('/restore', jthor.authUtil.verifyToken, async (req, res) => {
      this.userService
        .Enable(req.body.id)
        .then(result => {
          jthor.resp.success(res, result);
        })
        .catch(err => {
          jthor.resp.fail(res, err);
        });
    });

    /**
     * @swagger
     * /user/changePassword:
     *   put:
     *     summary: Change Password.
     *     tags: [User]
     *     consumes:
     *      - application/json
     *     parameters:
     *      - in: query
     *        name: id
     *        required: true
     *      - in: query
     *        name: change
     *        required: new password
     *     responses:
     *       200:
     *         description: Change password.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    this.router.put('/changePassword', jthor.authUtil.verifyToken, async (req, res) => {
      this.userService
        .ChangePassword(req.body.id, req.body.change)
        .then(result => {
          jthor.resp.success(res, result);
        })
        .catch(err => {
          jthor.resp.fail(res, err);
        });
    });

    return this.router;
  }

  private async valid(data: any, res: any) {
    const errors = await validate(data);
    if (errors.length) {
      jthor.resp.fail(res, jthor.resp.ErrorCode.ERR_100.code, jthor.resp.ErrorCode.ERR_100.message, errors);
    }
  }
}
