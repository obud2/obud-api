import IUserRepository from './user.repository';
import UserRepositoryDdb from './user.repository.ddb';
import {
  DeleteInstructorDTO,
  FindIdRequest,
  FindUserDTO,
  GetUserInfoReq,
  TempUser,
  User,
  UserDTO,
  UserInfo,
  UserListDTO,
} from './user.model';
import {
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { randomUUID } from 'crypto';
import { FootPrint } from '../dto/request/RequestBodyDTO';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
const jthor = new Jthor(config, '', false);

const USER_POOL_ID = config.poolId;

const customKey = ['role', 'group', 'hp'];
const exceptKey = ['id', 'createdAt', 'password', 'studiosAdminList'];

export default class UserService {
  database: string = 'DDB';

  constructor(
    private readonly userRepository: IUserRepository = new UserRepositoryDdb(),
    private cognitoClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) {}

  async create(req: UserDTO, footPrint: FootPrint) {
    const existEmail = await this.Find('email', req.email);
    if (existEmail !== null) {
      throw new Error('같은 계정이 이미 존재합니다.');
    }
    const existHp = await this.Find('hp', req.hp);
    if (existHp !== null) {
      throw new Error('같은 휴대폰번호가 이미 존재합니다.');
    }
    const user: User = new User(req, randomUUID(), footPrint);
    user.group = 'GR0200';
    const cogParam: any = {
      ClientId: config.clientId,
      Password: req.password,
      Username: user.id /* required */,
      UserAttributes: user.getCogParams(),
    };

    try {
      const command: SignUpCommand = new SignUpCommand(cogParam);
      await this.cognitoClient.send(command);
      return await this.userRepository.create(user);
    } catch (e: any) {
      throw e;
    }
  }
  async GetList(cursor: string, limit: number, keyword: string, evt?: string) {
    const list = await this.userRepository.list(cursor, limit, keyword, evt);
    const final: Array<UserListDTO> = [];
    list.val?.map(item => final.push(new UserListDTO(item)));
    return { ...list, val: final };
  }

  async GetListByRole(query: GetUserInfoReq) {
    const response = await this.userRepository.listByRole(query);
    if (response.result.toUpperCase() !== 'SUCCESS') {
      throw new Error('데이터를 정상적으로 불러오지 못했습니다.');
    }
    return response;
  }

  async getListByRoleUseStudios(query: GetUserInfoReq, userInfo: UserInfo) {
    const response = await this.userRepository.getListByRoleUseStudios(userInfo.id, query.keyword, query.cursor, query.limit);
    if (response.result.toUpperCase() !== 'SUCCESS') {
      throw new Error('데이터를 정상적으로 불러오지 못했습니다.');
    }
    return response;
  }

  async GetListAll(cursor: string, limit: number, keyword: string) {
    const list = await this.userRepository.listAll('', limit, keyword);
    // const final: Array<UserListDTO> = [];
    // list.val?.map(item => final.push(new UserListDTO(item)));
    // return { ...list, val: final };
    return { ...list };
  }

  async GetInfo(id: string) {
    return await this.userRepository.findById(id);
  }

  async findUserAfterInstructor(dto: FindUserDTO, footPrint: any, userInfo: UserInfo) {
    if (userInfo.group === 'GR0100') {
    } else if (userInfo.group === 'GR0110' && userInfo.id !== dto.studiosAdminId) {
      throw new Error('다른 스튜디오 관리자의 강사를 추가할수 없습니다.');
    } else if (userInfo.group === 'GR0110' && userInfo.id === dto.studiosAdminId) {
    } else {
      throw new Error('권한이 부족합니다.');
    }
    const existUser = await this.userRepository.findByEmail(dto.email);
    if (existUser === undefined) {
      throw new Error('해당 계정을 찾을수 없습니다.');
    }
    const user = (await this.userRepository.findById(existUser.id)).val;
    if (user.name !== dto.name) {
      throw new Error('이름이 정확하지 않습니다.');
    }
    if (user.group !== 'GR0120' && user.group !== 'GR0200') {
      throw new Error('강사, 유저 권한만 등록 가능합니다.');
    }

    user.group = 'GR0120';
    if (!user.studiosAdminList) {
      user.studiosAdminList = [];
    }
    if (user.studiosAdminList.find((id: string) => id === dto.studiosAdminId)) {
      throw new Error('이미 추가되어있는 강사입니다.');
    }

    user.studiosAdminList.push(dto.studiosAdminId);
    const userDto: UserDTO = new UserDTO(user);
    return await this.Update(userDto, userDto.id, footPrint);
  }

  async Update(obj: UserDTO, id: string, footprint: any) {
    const user = new User(obj, id, footprint);
    let arrCognito = [];
    for (const [key, value] of Object.entries(user)) {
      if (!exceptKey.includes(key) && key !== user.uploadKey && key !== 'uploadKey') {
        if (customKey.includes(key)) {
          arrCognito.push({ Name: `custom:${key}`, Value: `${value}` });
        } else {
          if (key === 'name') {
            arrCognito.push({ Name: `${key}`, Value: `${value}` });
          }
          if (key === 'birthdate') {
            arrCognito.push({ Name: `${key}`, Value: `${value}` });
          }
          if (key === 'gender') {
            arrCognito.push({ Name: `${key}`, Value: `${value}` });
          }
        }
      }
    }
    const cogParam: any = {
      UserPoolId: USER_POOL_ID /* required */,
      Username: user.id /* required */,
      UserAttributes: arrCognito,
    };
    try {
      const command: AdminUpdateUserAttributesCommand = new AdminUpdateUserAttributesCommand(cogParam);
      await this.cognitoClient.send(command);
      return await this.userRepository.update(user);
    } catch (e: any) {
      console.log(e);
      return e;
    }
  }

  async Delete(id: string, bucket: any) {
    const cogparam = { UserPoolId: USER_POOL_ID, Username: id };
    const _this = this;
    try {
      const command: AdminDeleteUserCommand = new AdminDeleteUserCommand(cogparam);
      await this.cognitoClient.send(command);
      return await this.userRepository.delete(id, bucket);
    } catch (e: any) {
      return e;
    }
  }

  Find(type: string, target: string) {
    switch (type) {
      case 'email':
        return this.userRepository.findByEmail(target);
      case 'hp':
        return this.userRepository.findByHp(target);
      default:
        return this.userRepository.findById(target);
    }
  }

  async Disable(id: string) {
    const foundUser = await this.userRepository.findById(id);
    if (foundUser) {
      const cogparam = {
        UserPoolId: USER_POOL_ID,
        Username: id,
      };
      try {
        const command: AdminDisableUserCommand = new AdminDisableUserCommand(cogparam);
        await this.cognitoClient.send(command);
        foundUser.isDel = 'Y';
        return await this.userRepository.update(foundUser);
      } catch (e: any) {
        return e;
      }
    } else {
      return jthor.resp.ErrorCode.ERR_110;
    }
  }

  async Enable(id: string) {
    const foundUser = await this.userRepository.findById(id);
    if (foundUser) {
      const cogparam = {
        UserPoolId: USER_POOL_ID,
        Username: id,
      };
      try {
        const command: AdminEnableUserCommand = new AdminEnableUserCommand(cogparam);
        await this.cognitoClient.send(command);
        foundUser.isDel = 'N';
        return await this.userRepository.update(foundUser);
      } catch (e: any) {
        return e;
      }
    } else {
      return jthor.resp.ErrorCode.ERR_110;
    }
  }

  async ChangePassword(id: string, change: string) {
    const foundUser = await this.userRepository.findById(id);
    if (foundUser) {
      //TODO. 기존 비밀번호 확인
      const cogparam = {
        UserPoolId: USER_POOL_ID /* required */,
        Username: id /* required */,
        Password: change,
        Permanent: true,
      };
      try {
        const command: AdminSetUserPasswordCommand = new AdminSetUserPasswordCommand(cogparam);
        return await this.cognitoClient.send(command);
      } catch (e: any) {
        return e;
      }
    } else {
      return jthor.resp.ErrorCode.ERR_110;
    }
  }

  async findId(obj: FindIdRequest) {
    const dbResult = await this.userRepository.findIdByHpAndName(obj);
    if (dbResult === null) {
      return {
        email: null,
        message: '아이디가 존재하지 않습니다.',
      };
    }
    return dbResult;
  }

  async getCertificate(email: string) {
    try {
      const existUser = await this.Find('email', email);
      const command = new ForgotPasswordCommand({
        ClientId: config.clientId,
        Username: existUser.id,
      });
      const forgotPasswordCommandOutput = await this.cognitoClient.send(command);
    } catch (e: any) {
      throw e;
    }
  }

  async temporaryLogin(tempUser: TempUser) {
    try {
      const existUser = await this.Find('email', tempUser.email);
      const params: any = {
        ClientId: config.clientId,
        ConfirmationCode: tempUser.code,
        Username: existUser.id,
        Password: tempUser.newPassword,
      };
      const command: ConfirmForgotPasswordCommand = new ConfirmForgotPasswordCommand(params);
      return await this.cognitoClient.send(command);
    } catch (e: any) {
      if (e.code === 'CodeMismatchException') {
        console.log('인증번호가 잘못되었습니다.');
      }
      console.log(e);
      throw e;
    }
  }

  async putVisitCount() {
    return await this.userRepository.putVisitCount();
  }

  async deleteInstructorFromAdmin(dto: DeleteInstructorDTO, footprint: any, userInfo: UserInfo) {
    const user = (await this.userRepository.findById(dto.instructorId)).val;
    if (user.group !== 'GR0120') {
      throw new Error('해당 계정은 강사권한이 아닙니다.');
    }
    if (!user.studiosAdminList.find((item: string) => item === dto.studiosAdminId)) {
      throw new Error('해당 강사는 해당 스튜디오 관리자 하위에 존재하지 않습니다.');
    }
    if (userInfo.group === 'GR0110' && dto.studiosAdminId !== userInfo.id) {
      throw new Error('스튜디오 관리자는 다른 스튜디오 관리자의 강사를 삭제 할 수 없습니다.');
    }
    user.studiosAdminList = user.studiosAdminList.filter((item: string) => item !== dto.studiosAdminId);
    user.updatedAt = footprint.updatedAt;
    user.updatedID = footprint.updatedID;
    user.updatedIP = footprint.updatedIP;
    user.updatedBy = footprint.updatedBy;

    return await this.userRepository.update(user);
  }

  async findByInstructorInStudios(studiosAdminId: any, keyword: any, userInfo: UserInfo) {
    if (userInfo.group !== 'GR0100') {
      throw new Error('권한이 부족합니다.');
    }
    if (keyword === '') {
      keyword = undefined;
    }
    const response = await this.userRepository.getListByRoleUseStudios(studiosAdminId, keyword, undefined, undefined);
    if (response.result.toUpperCase() !== 'SUCCESS') {
      throw new Error('데이터를 정상적으로 불러오지 못했습니다.');
    }
    return response;
  }
}
