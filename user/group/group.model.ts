import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class GroupDTO implements Partial<Group> {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(5000)
  id: string = '';
  auth: Array<string> = [];

  constructor(group: any) {
    this.id = group?.id;
    this.auth = group.auth;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the object was added
 */
export class Group {
  id: string = '';
  auth: Array<string> = [];

  createdAt: number = 0;
  createdID: string = '';
  createdIP: string = '';
  createdBy: string = '';

  updatedAt: number = 0;
  updatedID: string = '';
  updatedIP: string = '';
  updatedBy: string = '';

  constructor(group: GroupDTO, id: string, footpint: any) {
    this.id = id;
    this.auth = group.auth;

    if (footpint.createdAt) this.createdAt = footpint.createdAt;
    if (footpint.createdID) this.createdID = footpint.createdID;
    if (footpint.createdIP) this.createdIP = footpint.createdIP;
    if (footpint.createdBy) this.createdBy = footpint.createdBy;

    if (footpint.updatedAt) this.updatedAt = footpint.updatedAt;
    if (footpint.updatedID) this.updatedID = footpint.updatedID;
    if (footpint.updatedIP) this.updatedIP = footpint.updatedIP;
    if (footpint.updatedBy) this.updatedBy = footpint.updatedBy;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupListItem:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The id of your object
 */
export class GroupListDTO {
  id: string = '';
  auth: Array<string> = [];
  createdAt: number = 0;

  constructor(group: any) {
    this.id = group.id;
    this.auth = group.auth;
    this.createdAt = group.createdAt;
  }
}

export class ResponseDTO {
  result: string = '';
  message: string = '';
  val: Array<GroupListDTO> = [];
  cursor: string = '';
  backCursor: string = '';
}
