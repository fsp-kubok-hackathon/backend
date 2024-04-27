import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserReciept } from './dto/reciept.dto';
import { Prisma } from '@prisma/client';
import { GigaService } from 'src/giga/giga/giga.service';

@Injectable()
export class RecieptService {
  private readonly logger = new Logger('recieptService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly giga: GigaService,
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
          totalAmount: r.totalAmount.toNumber(),
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
          totalAmount: t.totalAmount.toNumber(),
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

  async getCategory(query: string): Promise<number> {
    return await this.prisma.$transaction(async (tx) => {
      const categories = await tx.recieptCategory.findMany();
      const category = await this.giga.getCategory(
        query,
        categories.map((c) => c.name),
      );

      const foundCategory = categories.find(
        (c) => c.name.trim() === category[0].trim(),
      );

      return foundCategory ? foundCategory.id : null;
    });
  }
}
