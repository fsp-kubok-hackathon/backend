import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserReciept } from 'src/reciept/dto/reciept.dto';
import { uuidv7 } from 'uuidv7';
import { Ticket } from './entity/ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async findAll(filter?: Prisma.TicketWhereInput) {
    return this.prisma.ticket.findMany({ where: filter });
  }

  async findAllRecieptsById(ticketId: string) {
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

  async findById(ticketId: string): Promise<Ticket> {
    return this.prisma.$transaction(async (tx) => {
      try {
        const ticket = await tx.ticket.findFirstOrThrow({
          where: { id: ticketId },
          include: {
            report: {
              include: {
                addedBy: true,
              },
            },
          },
        });

        return {
          id: ticket.id,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          endDate: ticket.endDate,
          startDate: ticket.startDate,
          status: ticket.status,
          userId: ticket.userId,
          report: ticket.report
            ? {
                ...ticket.report,
              }
            : undefined,
        };
      } catch (e) {
        throw new NotFoundException('Тикет не найден' + e);
      }
    });
  }

  async upload(
    userId: string,
    files: Express.Multer.File[],
    startDate: Date,
    endDate: Date,
  ) {
    const id = uuidv7();

    const reciepts = await Promise.all(
      files.map(async (f) => {
        const { fileName } = await this.minio.upload(f);
        const id = uuidv7();
        return { fileName, id };
      }),
    );

    this.prisma.$transaction(async (tx) => {
      await tx.reciept.createMany({
        data: reciepts.map((r) => {
          return {
            id: r.id,
            fn: 123456789,
            fp: 123456789,
            amount: 1337,
            userId: userId,
            paidAt: new Date(),
            purpose: 'Покупка в MOLOKO',
            imageName: r.fileName,
          };
        }),
      });

      const t = await tx.ticket.create({
        data: {
          id,
          startDate,
          endDate,
          userId,
        },
      });

      await tx.ticketReciept.createMany({
        data: reciepts.map((f) => {
          return {
            ticketId: t.id,
            recieptId: f.id,
          };
        }),
      });
    });

    return { id };
  }
}
