import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserTicket } from './dto/ticket.dto';

@Injectable()
export class TicketService {
  private readonly logger = new Logger('TicketService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async getByUser(userId: string): Promise<UserTicket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        userId: userId,
      },
    });

    const items: UserTicket[] = await Promise.all(
      tickets.map(async (t) => {
        const imageLink = await this.minio.getFileUrl(t.imageName);
        const item: UserTicket = {
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
      const tickets = await this.prisma.ticket.createMany({
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
      this.logger.verbose('tickets created', tickets);
      created = tickets.count;
    } catch (e) {
      this.logger.error('ticket craete error', e);
    }

    return created;
  }
}
