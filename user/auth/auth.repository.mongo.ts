import IAuthRepository from './auth.repository';
import { ResponseDTO } from './auth.model';
import { Response } from 'express';

export default class AuthRepositoryMongo implements IAuthRepository {
  insertUser(
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
    return Promise.resolve(new ResponseDTO(''));
  }
}
