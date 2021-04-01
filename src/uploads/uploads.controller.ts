import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

@Controller('uploads')
export default class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_ID,
        secretAccessKey: process.env.AWS_S3_ACCESS_SECRET,
      },
    });

    try {
      const objectName = `${Date.now()}${file.originalname}`;
      await new AWS.S3()
        .putObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Body: file.buffer,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();

      const url = `https://maxnubereats-uploads.s3.ap-northeast-2.amazonaws.com/${objectName}`;
      return { url };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
