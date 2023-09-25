import { CheckDTO, EmailDTO, SetPwDTO, Verify } from './email.model';

export default interface IEmailRepository {
  getTemplate(): Promise<any>;
  getUser(emailDto: EmailDTO): Promise<any>;
  sendVerify(emailDto: EmailDTO): Promise<any>;
  findPassword(emailDto: EmailDTO): Promise<any>;
  checkVerify(checkDto: CheckDTO): Promise<boolean>;
  createVerify(verify: Verify): Promise<Verify>;
  checkVerifyAndDel(pwInfo: SetPwDTO): Promise<boolean>;
}
