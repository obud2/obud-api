import { Router } from 'express';

const Jthor = require('atoz-jthor');
const config = require('../aws-config.json');
const jthor = new Jthor(config, '', true);

const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

const uploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'file.obud.site',
    acl: 'public-read',
    key: function (req: any, file: any, cb: (arg0: any, arg1: any) => void) {
      cb(null, 'upload/' + Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
    },
  }),
});

export class UploadRouter {
  router: Router;

  constructor() {
    this.router = Router();
  }

  handle() {
    this.router.use(uploader.array('files')).post('/', async (req: any, res, next) => {
      jthor.resp.success(res, {
        files: req?.files || [],
        error: 0,
        msg: '',
        path: '',
      });
    });
    return this.router;
  }
}
