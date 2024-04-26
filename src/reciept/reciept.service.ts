import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserReciept } from './dto/reciept.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecieptService {
  private readonly logger = new Logger('recieptService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async findAllByTicketId(ticketId: string): Promise<UserReciept[]> {
    const reciepts = await this.prisma.ticketReciept.findMany({
      where: { ticketId: ticketId },
      include: { reciept: true },
    });

    const items: UserReciept[] = await Promise.all(
      reciepts.map(async (t) => {
        const r = t.reciept;
        const imageLink = await this.minio.getFileUrl(r.imageName);
        const item: UserReciept = {
          amount: String(r.amount),
          fn: String(r.fn),
          fp: String(r.fp),
          paidAt: r.paidAt,
          purpose: r.purpose,
          imageLink,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
        return item;
      }),
    );

    return items;
  }

  async findAll(filters?: Prisma.RecieptWhereInput): Promise<UserReciept[]> {
    const reciepts = await this.prisma.reciept.findMany({
      where: filters,
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
}
