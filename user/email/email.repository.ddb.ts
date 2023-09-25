import IEmailRepository from './email.repository';
import { CheckDTO, EmailDTO, SetPwDTO, Verify } from './email.model';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, 'DDB', false);
const _ = require('lodash');

const TABLE_NAME = 'verify';

export default class EmailRepositoryDdb implements IEmailRepository {
  getTemplate(): Promise<any> {
    const id = '78b6a599-0921-491b-a965-8efc817fb740';
    const params = { TableName: 'template', Key: { id: id } };
    return jthor.ddbUtil.getInfo(params);
  }

  getUser(emailDto: EmailDTO): Promise<any> {
    const params = {
      TableName: 'user',
      IndexName: 'status-createdAt-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#status = :status',
      FilterExpression: '#name = :name and #email = :email',
      ExpressionAttributeNames: { '#id': 'id', '#name': 'name', '#email': 'email', '#hp': 'hp', '#status': 'status' },
      ExpressionAttributeValues: { ':name': emailDto.name, ':email': emailDto.toEmail, ':status': 'ENABLE' },
      ProjectionExpression: '#id, #name, #email, #hp',
    };
    return jthor.ddbUtil.scanTable(params, 'query');
  }

  async checkVerify(checkDto: CheckDTO): Promise<boolean> {
    const params = { TableName: TABLE_NAME, Key: { id: checkDto.toEmail } };
    const info = await jthor.ddbUtil.getInfo(params);
    const result = !(!info.val || !info.val?.code || checkDto.code !== info.val.code);
    return result;
  }

  async checkVerifyAndDel(pwInfo: SetPwDTO): Promise<boolean> {
    const params = { TableName: TABLE_NAME, Key: { id: pwInfo.id } };
    const info = await jthor.ddbUtil.getInfo(params);
    const result = !(!info.val || !info.val?.code || pwInfo.code !== info.val.code);
    if (result) {
      const removeParam = { TableName: TABLE_NAME, Key: { id: pwInfo.id } };
      await jthor.ddbUtil.removeItem(removeParam, null);
    }
    return result;
  }

  createVerify(verify: Verify): Promise<Verify> {
    return new Promise<Verify>(async resolve => {
      const params = {
        TableName: TABLE_NAME,
        Item: verify,
      };
      const createResult = await jthor.ddbUtil.create(params);
      resolve(createResult);
    });
  }

  findPassword(emailDto: EmailDTO): Promise<any> {
    return Promise.resolve(undefined);
  }

  sendVerify(emailDto: EmailDTO): Promise<any> {
    return Promise.resolve(undefined);
  }
}
