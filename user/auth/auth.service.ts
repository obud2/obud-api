import IAuthRepository from './auth.repository';
import AuthRepositoryDdb from './auth.repository.ddb';
import AuthRepositoryMongo from './auth.repository.mongo';
import { ResponseFail } from './auth.model';
import { Request, Response } from 'express';
import path from 'path';
import AWS from 'aws-sdk';
import axios from 'axios';
import qs from 'qs';
import { Strategy as NaverStrategy } from 'passport-naver';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import jwt from 'jsonwebtoken';

const Jthor = require('atoz-jthor');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, '', false);
AWS.config.loadFromPath(dirPath);

const API_URL: string = 'https://api.obud.site';

const KAKAO_KEYS = {
  clientID: '021ecf6d629b3928e2f40bf2da76832a',
  clientSecret: 'Wl2ynpQbjzpoUfxzTvYYSb9mHoP6yZ3C',
  redirectUri: API_URL + '/user/auth/kakao/callback',
};

const NAVER_KEYS: any = {
  clientID: 'QhvBgHS4KqIs80JM2_0Z',
  clientSecret: '4ooofULz3j',
  callbackURL: API_URL + '/user/auth/naver/callback',
};

const GOOGLE_KEYS = {
  clientID: '322811502091-4j58g6r45go03r27d2s85mgsbi8tcj9m.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: API_URL + '/user/auth/google/callback',
};

const APPLE_KEYS: any = {
  clientID: 'co.obud.signin',
  teamID: '86KRCR3CMG',
  keyID: '4VXHLT5327',
  privateKeyLocation: path.join(__dirname, '..', '/AuthKey_4VXHLT5327.p8'),
  callbackURL: API_URL + '/user/auth/apple/callback',
  passReqToCallback: true,
};

export default class AuthService {
  private authRepository: IAuthRepository;

  constructor(private readonly database: string = 'DDB') {
    if (this.database === 'DDB') {
      this.authRepository = new AuthRepositoryDdb();
    } else {
      this.authRepository = new AuthRepositoryMongo();
    }
  }

  getGooglePassport() {
    return new GoogleStrategy(GOOGLE_KEYS, (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    });
  }

  public getNaverPassport(): NaverStrategy {
    return new NaverStrategy(NAVER_KEYS, function (accessToken, refreshToken, profile, done) {
      const user = {
        id: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName ? profile.displayName : profile.emails?.[0].value,
        image: profile._json.profile_image,
      };
      return done(null, user);
    });
  }

  public getKakaoPassport(): string {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_KEYS.clientID}&redirect_uri=${KAKAO_KEYS.redirectUri}&response_type=code&scope=profile_nickname,account_email`;
  }

  public getApplePassport(): AppleStrategy {
    return new AppleStrategy(
      APPLE_KEYS,
      (req: any, accessToken: string, refreshToken: string, decodedIdToken: any, profile: any, done: any) => {
        console.log('============decodedIdToken');
        console.log(decodedIdToken);
        console.log('============decodedIdToken');

        console.log('============profile');
        console.log(profile);
        console.log('============profile');

        return done(null, decodedIdToken);
      },
    );
  }

  public async naverCallback(req: Request, res: any) {
    return await this.authRepository.insertUser(
      res,
      'naver',
      {
        id: req.body.id,
        email: req.body.email,
        name: req.body.name,
        image: req.body.image,
      },
      config,
    );
  }

  public async kakaoCallback(req: Request, res: Response) {
    let token: any;
    try {
      token = await axios({
        method: 'POST',
        url: 'https://kauth.kakao.com/oauth/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
          grant_type: 'authorization_code',
          client_id: KAKAO_KEYS.clientID,
          client_secret: KAKAO_KEYS.clientSecret,
          redirectUri: KAKAO_KEYS.redirectUri,
          code: req.query.code,
        }),
      });
    } catch (err: any) {
      const responseFail: ResponseFail = new ResponseFail();
      responseFail.url = req.originalUrl;
      responseFail.message = err.message;
      console.log('[kakao-1]', err.message);
      res.status(500).json(responseFail);
      return;
    }
    let user;
    try {
      user = await axios({
        method: 'get',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
        },
      });
    } catch (e: any) {
      const responseFail: ResponseFail = new ResponseFail();
      responseFail.url = req.originalUrl;
      responseFail.message = e.message;
      console.log('[kakao-2]', e.message);
      res.status(500).json(responseFail);
      return;
    }
    console.log(user.data);

    return await this.authRepository.insertUser(
      res,
      'kakao',
      {
        id: user.data.id,
        email: user.data.kakao_account.email,
        name: user.data.properties.nickname,
        image: user.data.properties.thumbnail_image,
      },
      config,
    );
  }

  async googleCallback(req: any, res: any) {
    return await this.authRepository.insertUser(
      res,
      'google',
      {
        id: req.user._json.sub,
        email: req.user._json.email,
        name: req.user._json.name,
        image: req.user._json.picture,
      },
      config,
    );
  }
  async appleCallback(profile: any, res: Response) {
    const user: any = jwt.decode(profile);
    return await this.authRepository.insertUser(
      res,
      'apple',
      {
        id: user.sub,
        email: user.email,
        name: user.email.split('@')[0],
        image: undefined,
      },
      config,
    );
  }
}
