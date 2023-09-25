import IAuthRepository from './auth.repository';
import { ResponseDTO } from './auth.model';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import AWS from 'aws-sdk';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, 'DDB', true);
// AWS.config.loadFromPath(dirPath);

const FRONT_URL = 'https://www.obud.site';
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
  region: 'ap-northeast-2',
});

export default class AuthRepositoryDdb implements IAuthRepository {
  public async insertUser(
    res: Response,
    provider: string,
    user: {
      image: any;
      name: string;
      id: any;
      email: any;
    },
    config: any,
  ): Promise<ResponseDTO> {
    const { id, email, name, image } = user;
    const UserPoolId = `${config.poolId}`;
    const GroupName = `${config.poolId}_${provider}`;
    const ClientId = `${config.clientId}`;
    const Username = randomUUID();

    return new Promise<ResponseDTO>(async (resolve, reject) => {
      const existParam = {
        TableName: 'user',
        IndexName: 'email-index',
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: {
          '#email': 'email',
        },
        ExpressionAttributeValues: {
          ':email': email,
        },
      };

      console.log(existParam);
      const exist = await jthor.ddbUtil.scanTable(existParam, 'query');
      console.log(exist);

      if (exist.val && exist.val.length > 0) {
        let existType = '';
        if (exist.val[0].kakao) existType = 'kakao';
        else if (exist.val[0].naver) existType = 'naver';
        else if (exist.val[0].google) existType = 'google';
        else if (exist.val[0].apple) existType = 'apple';
        else existType = 'email';

        resolve(new ResponseDTO(`${FRONT_URL}?type=exist&sns=${provider}&existType=${existType}&id=${exist.val[0].id}&code=${'' + id}`));
        return;
      }
      console.log('id : ', id);
      const newUserParam = {
        ClientId,
        Username,
        Password: '' + id,
        ClientMetadata: {
          UserPoolId,
          Username,
          GroupName,
        },
        UserAttributes: [
          {
            Name: 'email' /* required */,
            Value: email,
          },
          {
            Name: 'name' /* required */,
            Value: name,
          },
          {
            Name: 'picture',
            Value: image || 'https://via.placeholder.com/60.png?text=noimage',
          },
          {
            Name: 'custom:' + provider,
            Value: '' + id,
          },
          {
            Name: 'custom:group',
            Value: 'GR0200',
          },
          {
            Name: 'custom:role',
            Value: 'USR',
          },
        ],
      };
      await cognitoIdentityServiceProvider.signUp(newUserParam, error => {
        if (error) {
          console.log(error.message);
          if (error.message === 'User already exists') {
            resolve(new ResponseDTO(`${FRONT_URL}?type=login&sns=${provider}&id=${Username}&code=${'' + id}`));
          } else {
            resolve(new ResponseDTO(`${FRONT_URL}?sns=${provider}&err=${error.message}`));
          }
        }
        resolve(new ResponseDTO(`${FRONT_URL}?type=login&sns=${provider}&id=${Username}&code=${'' + id}`));
      });
    });
  }
}
