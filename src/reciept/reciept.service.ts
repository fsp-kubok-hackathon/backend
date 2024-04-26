import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserReciept } from './dto/reciept.dto';

@Injectable()
export class RecieptService {
  private readonly logger = new Logger('recieptService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async getByUser(userId: string): Promise<UserReciept[]> {
    const reciepts = await this.prisma.reciept.findMany({
      where: {
        userId: userId,
      },
    });

    const items: UserReciept[] = await Promise.all(
      reciepts.map(async (t) => {
        const imageLink = await this.minio.getFileUrl(t.imageName);
        const item: UserReciept = {
          amount: String(t.amount),
          fn: String(t.fn),
          fp: String(t.fp),
          paidAt: t.paidAt,
          purpose: t.purpose,
          imageLink: imageLink,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        };
        return item;
      }),
    );

    return items;
  }
  async upload(
    userId: string,
    files: Array<Express.Multer.File>,
  ): Promise<number> {
    const fileNames = await Promise.all(
      files.map(async (f) => {
        const { fileName } = await this.minio.upload(f);
        return fileName;
      }),
    );

    let created = 0;

    try {
      const reciepts = await this.prisma.reciept.createMany({
        skipDuplicates: true,
        data: fileNames.map((f) => ({
          userId: userId,
          fn: 1242142154219742,
          fp: 4194194721741294,
          amount: 1337,
          imageName: f,
          paidAt: new Date(),
          purpose: 'Покупка в MOLOKO',
        })),
      });
      this.logger.verbose('reciepts created', reciepts);
      created = reciepts.count;
    } catch (e) {
      this.logger.error('reciept craete error', e);
    }

    return created;
  }
}
