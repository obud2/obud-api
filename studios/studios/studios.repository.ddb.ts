import { StudiosSortData, Studios, StudiosDTO, StudiosForLesson, StudiosShort, Refund } from './studios.model';
import IStudiosRepository from './studios.repository';
import { GetListRequestDTO, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { UserInfo } from '../order/order.model';

const Jthor = require('atoz-jthor');
const path = require('path');
const dirPath = path.join(__dirname, '..', '/aws-config.json');
const config = require(dirPath);

const TABLE_NAME = 'studios';
export default class StudiosRepositoryDdb implements IStudiosRepository {
  private readonly WISH_TABLE: string = 'wish';
  private readonly REFUND_TABLE: string = 'refund';
  private readonly CART_TABLE: string = 'cart';
  private readonly ORDER_ITEM_TABLE: string = 'order_item';
  constructor(
    private s3Client: S3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
    private jthor = new Jthor(config, 'DDB', true),
  ) {}
  async create(dto: Studios): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      Item: dto,
    };
    return await this.jthor.ddbUtil.create(params);
  }
  async createRefund(refund: Refund): Promise<any> {
    const params: any = {
      TableName: this.REFUND_TABLE,
      Item: refund,
    };
    return await this.jthor.ddbUtil.create(params);
  }
  async update(dto: Studios): Promise<any> {
    const updateParams = {
      TableName: TABLE_NAME,
      Key: { id: dto.id },
      SetData: dto,
    };
    return await this.jthor.ddbUtil.update(updateParams);
  }
  async delete(id: string, bucket: string | string[] | undefined): Promise<any> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return await this.jthor.ddbUtil.removeItem(params, bucket);
  }
  async deleteRefund(id: string): Promise<any> {
    const params: any = {
      TableName: this.REFUND_TABLE,
      Key: { id: id },
    };
    return await this.jthor.ddbUtil.removeItem(params, undefined);
  }
  async list(query: GetListRequestDTO): Promise<ResponseDTO<any>> {
    return await this.getList(query, true);
  }
  async listAll(query: GetListRequestDTO): Promise<Promise<any>> {
    return await this.getList(query, false);
  }
  private async getList(query: GetListRequestDTO, isShow: boolean) {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'status-sortOrder-index',
      ProjectionExpression: 'id, category, title, sortOrder, images, isShow, createdAt, updatedAt, createdBy, addr, addrDetail',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeValues: { ':value': 'ENABLE' },
      ExpressionAttributeNames: { '#key': 'status' },
    };
    if (query?.sort === 'created') {
      params.IndexName = 'status-createdAt-index';
    }
    if (query?.sort === 'wish') {
      params.IndexName = 'status-wishCount-index';
    }
    if (query.keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' ( contains(#title, :keyword) or contains(#content, :keyword) ) ';
      params.ExpressionAttributeNames['#title'] = 'title';
      params.ExpressionAttributeNames['#content'] = 'content';
      params.ExpressionAttributeValues[':keyword'] = query.keyword;
    }
    if (isShow) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' #isShow = :isShow ';
      params.ExpressionAttributeNames['#isShow'] = 'isShow';
      params.ExpressionAttributeValues[':isShow'] = true;
    }

    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }
  async getStudiosListByUserId(userInfo: UserInfo): Promise<any> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'createdID-createdAt-index',
      ProjectionExpression: 'id',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'createdID' },
      ExpressionAttributeValues: { ':value': userInfo.id },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }
  async getListByUserId(query: GetListRequestDTO, userInfo: UserInfo): Promise<any> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'createdID-createdAt-index',
      ProjectionExpression: 'id, category, title, sortOrder, images, isShow, createdAt, updatedAt, createdBy, addr, addrDetail',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'createdID' },
      ExpressionAttributeValues: { ':value': userInfo.id },
    };
    if (query.keyword) {
      let prefix = '';
      if (params.FilterExpression) {
        prefix = params.FilterExpression + ' and ';
      }
      params.FilterExpression = prefix + ' ( contains(#title, :keyword) or contains(#content, :keyword) ) ';
      params.ExpressionAttributeNames['#title'] = 'title';
      params.ExpressionAttributeNames['#content'] = 'content';
      params.ExpressionAttributeValues[':keyword'] = query.keyword;
    }
    return await this.jthor.ddbUtil.scanPagination(params, 'query', query.cursor, query.limit);
  }
  async findRefundByStudiosId(studiosId: string): Promise<any> {
    const params: any = {
      TableName: this.REFUND_TABLE,
      IndexName: 'studiosId-day-index',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'studiosId' },
      ExpressionAttributeValues: { ':value': studiosId },
    };
    const existRefundList = await this.jthor.ddbUtil.scanPagination(params, 'query');
    return existRefundList;
  }

  async findById(id: string): Promise<ResponseSingleDTO<any>> {
    const params = { TableName: TABLE_NAME, Key: { id: id } };
    return await this.jthor.ddbUtil.getInfo(params);
  }
  async findByIdInfo(studiosId: string): Promise<StudiosShort> {
    let params: any = {
      TableName: TABLE_NAME,
      ProjectionExpression: 'id, title',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':value': { S: studiosId } },
    };
    try {
      const command: QueryCommand = new QueryCommand(params);
      const item = await this.jthor.docClient.send(command);
      if (item.Items.length === 0) {
        throw new Error(`Studios ID :: ${studiosId} 해당 Studios 가 존재하지 않습니다.`);
      }
      return new StudiosShort(item.Items[0]);
    } catch (e: any) {
      throw e;
    }
  }

  async getLastSortOrder(): Promise<number | undefined> {
    let params: any = {
      TableName: TABLE_NAME,
      IndexName: 'status-sortOrder-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id, sortOrder',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'status' },
      ExpressionAttributeValues: { ':value': { S: 'ENABLE' } },
      Limit: 1,
    };
    const command: QueryCommand = new QueryCommand(params);
    const item = await this.jthor.docClient.send(command);
    if (item.Items[0]) {
      return parseInt(item.Items[0].sortOrder.N);
    } else {
      return undefined;
    }
  }
  async findSortList(id: string, max: number, min: number): Promise<Array<StudiosSortData>> {
    const params: any = {
      TableName: TABLE_NAME,
      IndexName: 'status-sortOrder-index',
      ProjectionExpression: 'id,  sortOrder',
      KeyConditionExpression: '#status = :statusValue and sortOrder BETWEEN :start and :end',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':statusValue': { S: 'ENABLE' },
        ':start': { N: min.toString() },
        ':end': { N: max.toString() },
      },
    };
    let items: any,
      scanResults: StudiosSortData[] = [];
    do {
      const command: QueryCommand = new QueryCommand(params);
      items = await this.jthor.ddb.send(command);
      items?.Items?.forEach((item: StudiosSortData) => {
        const items: StudiosSortData = new StudiosSortData(item);
        scanResults.push(items);
      });
      params.ExclusiveStartKey = items?.LastEvaluatedKey;
    } while (typeof items?.LastEvaluatedKey !== 'undefined');
    return scanResults;
  }

  async sorting(data: StudiosSortData): Promise<any> {
    const params: any = {
      TableName: TABLE_NAME,
      Key: {
        id: {
          S: data.id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'sortOrder', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          N: data.sortOrder.toString(),
        }, // 수정할 컬럼값 설정
      },
      ReturnValues: 'NONE',
    };
    const command: UpdateItemCommand = new UpdateItemCommand(params);
    return await this.jthor.ddb.send(command);
  }

  async copyS3File(image: any, uuid: string): Promise<any> {
    const params: any = {
      Bucket: config.bucket,
      ACL: 'public-read',
      CopySource: `/${config.bucket}/${image.key}`,
      Key: `studio/studio_${uuid}`,
    };
    const command: CopyObjectCommand = new CopyObjectCommand(params);
    try {
      await this.s3Client.send(command);
      console.log('File copied successfully.');
    } catch (error) {
      console.log('Error copying file:', error);
      throw error;
    }
    return params;
  }

  async findByIdResTitle(studiosId: string): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': { S: studiosId },
      },
      ProjectionExpression: 'id, title, information, refundPolicy, addr, addrDetail',
    };
    const command: QueryCommand = new QueryCommand(params);

    try {
      const data = await this.jthor.docClient.send(command);
      return new StudiosForLesson(data.Items[0]);
    } catch (error) {
      console.error('Error querying DynamoDB:', error);
    }
  }

  async findWishById(id: string, userId: string): Promise<any> {
    const params: any = {
      TableName: this.WISH_TABLE,
      IndexName: 'userId-createdAt-index',
      FilterExpression: '#studiosId = :studiosId',
      ScanIndexForward: false,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'userId', '#studiosId': 'studiosId' },
      ExpressionAttributeValues: {
        ':value': userId,
        ':studiosId': id,
      },
    };
    const result = await this.jthor.ddbUtil.scanPagination(params, 'query');
    if (result.val.length === 0) {
      return {
        isWish: false,
      };
    } else {
      return {
        isWish: true,
        wishId: result.val[0].id,
      };
    }
  }

  async findCartByStudiosId(id: string): Promise<any> {
    const params: any = {
      TableName: this.CART_TABLE,
      IndexName: 'studiosId-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'studiosId' },
      ExpressionAttributeValues: {
        ':value': id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async updateCartByStudiosId(id: string, title: string): Promise<any> {
    const params: any = {
      TableName: this.CART_TABLE,
      Key: {
        id: {
          S: id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'studiosTitle', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          S: title,
        }, // 수정할 컬럼값 설정
      },
    };
    const command: UpdateItemCommand = new UpdateItemCommand(params);
    return await this.jthor.ddb.send(command);
  }

  async findOrderItemByStudiosId(id: string): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      IndexName: 'studiosId-index',
      ScanIndexForward: false,
      ProjectionExpression: 'id',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'studiosId' },
      ExpressionAttributeValues: {
        ':value': id,
      },
    };
    return await this.jthor.ddbUtil.scanPagination(params, 'query');
  }

  async updateOrderItemByStudiosId(id: string, title: string): Promise<any> {
    const params: any = {
      TableName: this.ORDER_ITEM_TABLE,
      Key: {
        id: {
          S: id,
        }, // 파티션 키인 id 값을 설정
      },
      UpdateExpression: `SET #columnName = :columnValue`, // 수정할 컬럼명과 값 설정
      ExpressionAttributeNames: {
        '#columnName': 'studiosTitle', // 수정할 컬럼명 설정
      },
      ExpressionAttributeValues: {
        ':columnValue': {
          S: title,
        }, // 수정할 컬럼값 설정
      },
    };
    const command: UpdateItemCommand = new UpdateItemCommand(params);
    return await this.jthor.ddb.send(command);
  }

  async findByIdGetAddr(studiosId: string): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id: studiosId },
      ProjectionExpression: 'id, addr, addrDetail',
    };
    return await this.jthor.ddbUtil.getInfo(params);
  }

  async findByIdForStudiosList(studiosId: string): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id: studiosId },
      ProjectionExpression: 'id, category, title, sortOrder, images, isShow, createdAt, updatedAt, createdBy, addr, addrDetail',
    };
    return await this.jthor.ddbUtil.getInfo(params);
  }
}
