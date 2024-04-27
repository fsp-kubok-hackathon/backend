import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserReciept } from 'src/reciept/dto/reciept.dto';
import { uuidv7 } from 'uuidv7';
import { Ticket } from './entity/ticket.entity';
import { RecieptCheckerService } from 'src/reciept-checker/reciept-checker.service';
import { RecieptService } from 'src/reciept/reciept.service';
import { ReportService } from 'src/report/report.service';

@Injectable()
export class TicketService {
  private readonly logger = new Logger('TicketService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly recieptChecker: RecieptCheckerService,
    private readonly recieptService: RecieptService,
    private readonly reportService: ReportService,
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

  async upload(data: {
    userId: string;
    files: Express.Multer.File[];
    startDate?: Date;
    endDate?: Date;
    ticketId?: string;
  }) {
    const id = uuidv7();

    const { endDate, files, startDate, userId, ticketId } = data;
    const errors = [];
    const reciepts = await Promise.all(
      files.map(async (f) => {
        const { fileName } = await this.minio.upload(f);
        const id = uuidv7();
        return { fileName, id };
      }),
    );

    await this.prisma.$transaction(async (tx) => {
      const rr = (
        await Promise.all(
          reciepts.map(async (r) => {
            const imageUrl = await this.minio.getFileUrl(r.fileName);

            const { info, ok } = await this.recieptChecker.check(imageUrl);

            if (!ok) {
              this.logger.warn('reciept checker error', { imageUrl, info });
              errors.push({ imageUrl });
              return null;
            }

            return {
              id: r.id,
              fn: BigInt(info.data.json.fiscalDriveNumber),
              fp: info.data.json.fiscalSign,
              totalAmount: info.data.json.totalSum,
              userId: userId,
              paidAt: new Date(info.data.json.dateTime),
              purpose: info.data.json.user ?? 'Неизвестно',
              imageName: r.fileName,
              items: await Promise.all(
                info.data.json.items.map(async (i) => ({
                  recieptId: r.id,
                  name: i.name,
                  amount: i.price,
                  quantity: i.quantity,
                  categoryId: await this.recieptService.getCategory(i.name),
                })),
              ),
            };
          }),
        )
      ).filter((r) => r !== null);

      await tx.reciept.createMany({
        data: rr.map((r) => ({ ...r, items: undefined })),
      });
      rr.forEach(async (r) => {
        if (r.items) await tx.recieptItem.createMany({ data: r.items });
      });

      if (!ticketId) {
        await tx.ticket.create({
          data: {
            id,
            startDate,
            endDate,
            userId,
          },
        });
      }

      await tx.ticketReciept.createMany({
        data: rr.map((r) => {
          return {
            ticketId: ticketId ?? id,
            recieptId: r.id,
          };
        }),
      });
    });

    this.reportService
      .validate(ticketId ?? id)
      .then(() => this.logger.verbose('validate report'));

    this.logger.verbose('errors', errors);
    return { id, errors };
  }
}
