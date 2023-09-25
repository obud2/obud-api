import ICodeRepository from './code.repository';
import CodeRepositoryDdb from './code.repository.ddb';
import CodeRepositoryMongo from './code.repository.mongo';
import { CodeInfoDTO, CodeListDTO, OrderStatus } from './code.model';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);
export default class CodeService {
  codeRepository: ICodeRepository;

  database: string = 'DDB';

  constructor(
    private cognitoClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  ) {
    if (this.database === 'MONGO') {
      this.codeRepository = new CodeRepositoryMongo();
    } else {
      this.codeRepository = new CodeRepositoryDdb();
    }
  }

  async GetList(cursor: string, limit: number, keyword: string) {
    const list = await this.codeRepository.list(cursor, limit, keyword);
    const final: Array<CodeListDTO> = [];
    list.val?.map(item => final.push(new CodeListDTO(item)));
    return { ...list, val: final };
  }

  async GetListByGroup(group: string, cursor: string, limit: number, keyword: string) {
    const list = await this.codeRepository.listByGroup(group, cursor, limit, keyword);
    const final: Array<CodeListDTO> = [];
    list.val?.map(item => final.push(new CodeListDTO(item)));
    return { ...list, val: final };
  }

  async GetInfo(id: string) {
    return await this.codeRepository.findById(id);
  }

  async create(code: CodeInfoDTO) {
    return this.codeRepository.create(code);
  }

  async Update(obj: CodeInfoDTO, id: string) {
    obj.id = id;
    return this.codeRepository.update(obj);
  }

  async Delete(id: string, bucket: any) {
    return this.codeRepository.delete(id, bucket);
  }

  async getDashBoard() {
    const existOrderItemList = await this.codeRepository.getOrderItemList(OrderStatus.COMPLETE);
    const existOrderItemListCanceling = await this.codeRepository.getOrderItemList(OrderStatus.CANCELING);
    const completeSales: number = await this.itemSum(existOrderItemList.val);
    const canceling: number = await this.itemSum(existOrderItemListCanceling.val);
    const totalSales: number = completeSales + canceling;

    const totalVisit = (await this.codeRepository.getUserList()).val.visitCount;
    return {
      totalSales,
      totalVisit,
    };
  }

  private async itemSum(orderItemList: any) {
    let total: number = 0;
    orderItemList.map((orderItem: any) => {
      total += orderItem.amount;
    });
    return total;
  }
}
