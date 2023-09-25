import { Response } from 'express';
import { ResponseDTO } from './auth.model';

export default interface IAuthRepository {
  insertUser(res: Response, provider: string, user: { image: any; name: string; id: any; email: any }, config: any): Promise<ResponseDTO>;
}
