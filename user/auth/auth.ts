import express, { Request, Response } from 'express';
import AuthService from './auth.service';
import { ResponseDTO } from './auth.model';
import session from 'express-session';

import passport from 'passport';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', false);

export class AuthRouter {
  constructor(private router: express.Router = express.Router(), private authService: AuthService = new AuthService()) {
    this.setRouter();
    this.setPassport();
  }

  private setRouter() {
    /**
     * @swagger
     * /user/auth/google:
     *   get:
     *     summary: Redirect Google login
     *     tags: [Auth]
     */
    this.router.get(
      '/google',
      passport.authenticate('google', { scope: ['profile', 'email'] }, res => {}),
    );

    /**
     * @swagger
     * /user/auth/google/callback:
     *   get:
     *     summary: Google Callback
     *     tags: [Auth]
     */
    this.router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/test' }), async (req, res) => {
      const result = await this.authService.googleCallback(req, res);
      res.redirect(result.val);
    });

    /**
     * @swagger
     * /user/auth/naver:
     *   get:
     *     summary: Redirect Naver login
     *     tags: [Auth]
     */
    this.router.get(
      '/naver',
      passport.authenticate(
        'naver',
        {
          scope: ['name', 'email'],
        },
        () => {},
      ),
    );

    /**
     * @swagger
     * /user/auth/naver/callback:
     *   get:
     *     summary: Naver Callback
     *     tags: [Auth]
     */
    this.router.get('/naver/callback', passport.authenticate('naver', { failureRedirect: '/test' }), async (req: Request, res, next) => {
      const result = await this.authService.naverCallback(req, res);
      res.redirect(result.val);
    });

    /**
     * @swagger
     * /user/auth/kakao:
     *   get:
     *     summary: Redirect Kakao login
     *     tags: [Auth]
     */
    this.router.get('/kakao', async (req: Request, res: Response) => {
      console.log('Login Kakao');
      const kakaoAuthURL = this.authService.getKakaoPassport();
      console.log(kakaoAuthURL);
      res.redirect(kakaoAuthURL);
    });

    /**
     * @swagger
     * /user/auth/kakao/callback:
     *   get:
     *     summary: Kakao Callback
     *     tags: [Auth]
     */
    this.router.get('/kakao/callback', async (req: Request, res: Response) => {
      const result: ResponseDTO | undefined = await this.authService.kakaoCallback(req, res);
      if (result instanceof ResponseDTO) {
        res.redirect(result.val);
      }
    });

    this.router.get(
      '/apple',
      passport.authenticate('apple', {
        scope: ['name', 'email'],
      }),
    );

    this.router.post('/apple/callback', (req: Request, res: Response, next: express.NextFunction) => {
      passport.authenticate('apple', async (err: any, profile: any) => {
        if (err) {
          // 오류 처리 로직
          return next(err);
        }

        const result = await this.authService.appleCallback(profile, res);
        return res.redirect(result.val);
      })(req, res, next);
    });
  }

  private setPassport() {
    this.router.use(passport.initialize());
    this.router.use(passport.session());
    // login이 최초로 성공했을 때만 호출되는 함수
    passport.serializeUser(function (user: any, done) {
      console.log('====== This is serializeUser methid =========');
      done(null, user.id);
    });

    // 사용자가 페이지를 방문할 때마다 호출되는 함수
    passport.deserializeUser(function (id: any, done: any) {
      done(null, id);
    });

    passport.use(this.authService.getNaverPassport());
    passport.use(this.authService.getGooglePassport());
    passport.use(this.authService.getApplePassport());
  }

  public getRouter() {
    return this.router;
  }
}
