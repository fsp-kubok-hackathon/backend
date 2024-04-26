import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { Bucket } from './minio.consts';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class MinioService {
  private readonly client: Minio.Client;
  private readonly logger = new Logger('MinioService');

  constructor() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      useSSL: false,
    });
  }

  async createBucketIfNotExists(bucket: Bucket) {
    const bucketExists = await this.client.bucketExists(bucket);

    if (!bucketExists) {
      this.logger.verbose(`creating a '${bucket}' bucket`);
      await this.client.makeBucket(bucket);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: Bucket,
  ): Promise<{ id: string; ext: string; fileName: string }> {
    const id = uuidv7();
    const ext = file.mimetype.split('/')[1];

    const fileName = id + '.' + ext;

    this.logger.verbose('uploading a ', { fileName });
    try {
      await this.client.putObject(bucket, fileName, file.buffer, file.size);
    } catch (error) {
      if (error.code && error.code === 'NoSuchBucket') {
        this.logger.warn(`bucket ${bucket} doesnt exists`);
        await this.createBucketIfNotExists(bucket);
        return await this.uploadFile(file, bucket);
      }
      this.logger.error('error putting object', { error });
      throw new Error();
    }
    return { id, ext, fileName };
  }

  async getFileUrl(fileName: string, bucket: Bucket) {
    return await this.client.presignedUrl('GET', bucket, fileName);
  }

  async deleteFile(fileName: string, bucket: Bucket) {
    await this.client.removeObject(bucket, fileName);
  }
}
