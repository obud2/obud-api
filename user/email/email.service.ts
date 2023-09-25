import IEmailRepository from './email.repository';
import EmailRepositoryDdb from './email.repository.ddb';
import { CheckDTO, EmailDTO, SetPwDTO, Verify } from './email.model';
import nodemailer from 'nodemailer';
import { AdminSetUserPasswordCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
const FROM_EMAIL = 'obud <obud.co@gmail.com>';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'obud.co@gmail.com', pass: 'vnkmqgckyksmdqso' },
});

const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
export default class EmailService {
  database: string = 'DDB';
  constructor(
    private readonly emailRepository: IEmailRepository = new EmailRepositoryDdb(),
    private cognitoClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) {}

  async CheckVerify(obj: CheckDTO) {
    return this.emailRepository.checkVerify(obj);
  }
  async CreateVerify(obj: CheckDTO, footprint: any) {
    const verify = new Verify(obj, footprint);
    return this.emailRepository.createVerify(verify);
  }

  async SendVerify(obj: EmailDTO, footprint: any) {
    const randomCode = Math.floor(Math.random() * (1000000 - 100000) + 100000);
    const finalData = {
      CODE: randomCode,
    };
    obj.code = String(randomCode);
    await this.CreateVerify(obj, footprint);
    const template = await this.emailRepository.getTemplate();
    obj.message = template?.val?.contents;
    obj.subject = template?.val?.subject;
    return this.sendEmail(obj, finalData);
  }
  async FindPassword(obj: EmailDTO, footprint: any) {
    const exist = await this.emailRepository.getUser(obj);
    if (exist.val && exist.val.length === 0) {
      return false;
    }
    const randomCode = Math.floor(Math.random() * (1000000 - 100000) + 100000);
    const finalData = {
      CODE: randomCode,
    };
    obj.code = String(randomCode);
    await this.CreateVerify(obj, footprint);
    const template = await this.emailRepository.getTemplate();
    obj.message = template?.val?.contents;
    obj.subject = template?.val?.subject;
    return this.sendEmail(obj, finalData);
  }

  sendEmail = (emailDto: EmailDTO, finalData: object) => {
    return new Promise<any>(async (resolve, reject) => {
      console.log('SEND EMAIL >>>');
      console.log('toEmail : ' + emailDto.toEmail);
      console.log('subject : ' + emailDto.subject);
      let newHTML = emailDto.message.toString();
      for (const [key, value] of Object.entries(finalData)) {
        const re = new RegExp(`{{${key}}}`, 'g');
        const val = value ? value : '';
        newHTML = newHTML.replace(re, val);
      }
      const mailOption = {
        from: `${FROM_EMAIL}`,
        to: emailDto.toEmail,
        subject: emailDto.subject,
        html: newHTML,
      };
      transporter
        .sendMail(mailOption)
        .then((data: any) => {
          resolve(data);
        })
        .catch((err: any) => {
          reject();
        });
    });
  };

  async changePassword(pwInfo: SetPwDTO) {
    const checkInfo: boolean = await this.emailRepository.checkVerifyAndDel(pwInfo);
    if (!checkInfo) {
      throw new Error('정보가 올바르지 않습니다.');
    }
    const cogparam = {
      UserPoolId: config.poolId /* required */,
      Username: pwInfo.id /* required */,
      Password: pwInfo.newPassword,
      Permanent: true,
    };
    try {
      const command: AdminSetUserPasswordCommand = new AdminSetUserPasswordCommand(cogparam);
      return await this.cognitoClient.send(command);
    } catch (e: any) {
      return e;
    }
  }
}
