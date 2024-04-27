import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserReciept } from 'src/reciept/dto/reciept.dto';
import { uuidv7 } from 'uuidv7';
import { Ticket } from './entity/ticket.entity';
import { RecieptCheckerService } from 'src/reciept-checker/reciept-checker.service';
import { RecieptService } from 'src/reciept/reciept.service';

@Injectable()
export class TicketService {
  private readonly logger = new Logger('TicketService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly recieptChecker: RecieptCheckerService,
    private readonly recieptService: RecieptService,
  ) {}

  async findAll(filter?: Prisma.TicketWhereInput) {
    const tickets = await this.prisma.ticket.findMany({
      where: filter,
      include: { user: true, report: { include: { addedBy: true } } },
    });

    const domainTickets: Ticket[] = tickets.map((ticket) => ({
      id: ticket.id,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      endDate: ticket.endDate,
      startDate: ticket.startDate,
      status: ticket.status,
      userId: ticket.userId,
      user: { ...ticket.user, password: undefined },
      report: ticket.report
        ? {
            ...ticket.report,
          }
        : undefined,
    }));

    return domainTickets;
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
            user: true,
            report: {
              include: {
                addedBy: true,
              },
            },
          },
        });

        const t: Ticket = {
          id: ticket.id,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          endDate: ticket.endDate,
          startDate: ticket.startDate,
          status: ticket.status,
          userId: ticket.userId,
          user: { ...ticket.user },
          report: ticket.report
            ? {
                ...{
                  ...ticket.report,
                  addedBy: { ...ticket.report.addedBy, password: undefined },
                },
              }
            : undefined,
        };

        this.logger.verbose('find ticket by id', t);

        return t;
      } catch (e) {
        this.logger.error('find ticket by id', e);
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
      const rr = (
        await Promise.all(
          reciepts.map(async (r) => {
            const imageUrl = await this.minio.getFileUrl(r.fileName);

            const { info, ok } = await this.recieptChecker.check(imageUrl);

            if (!ok) {
              this.logger.warn('reciept checker error', { imageUrl, info });
              this.minio.deleteFile(r.fileName);
              return null;
            }

            return {
              id: r.id,
              fn: BigInt(info.data.json.fiscalDriveNumber),
              fp: info.data.json.fiscalSign,
              amount: info.data.json.totalSum,
              userId: userId,
              paidAt: new Date(info.data.json.dateTime),
              purpose: info.data.json.user ?? 'Неизвестно',
              imageName: r.fileName,
              items: info.data.json.items.map((i) => i.name).join('\n'),
              // purpose: info.data.json.items.map(i => i.name).join(', '),
            };
          }),
        )
      ).filter((r) => r !== null);

      await tx.reciept.createMany({
        data: await Promise.all(
          rr.map(async (r) => ({
            ...r,
            items: r.items,
            categoryId: await this.recieptService.getCategory(r.items),
          })),
        ),
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
        data: rr.map((r) => {
          return {
            ticketId: t.id,
            recieptId: r.id,
          };
        }),
      });
    });

    return { id };
  }
}
