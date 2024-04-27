import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
import Pagination from 'src/shared/pagination';
import { ReportFilters } from './entities/report.entity';
import { readToExcel, streamFromUrl } from 'src/utils/excel';
import { MinioService } from 'src/minio/minio.service';
import { ReportItem, TicketStatus } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async upload(ticketId: string, file: Express.Multer.File, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      try {
        const ticket = await tx.ticket.findFirstOrThrow({
          where: { id: ticketId },
          include: { report: true },
        });
        if (ticket.report) throw new Error('Тикет уже содержит выписку');
      } catch (e) {
        throw new NotFoundException(`Тикет не найден ${e}`);
      }

      const { fileName } = await this.minio.upload(file);

      // Создаем выписку
      const report = await tx.report.create({
        data: {
          id: uuidv7(),
          fileName,
          addedBy: { connect: { id: userId } },
        },
      });

      // Парсим выписку
      const stream = await streamFromUrl(
        await this.minio.getFileUrl(report.fileName),
      );
      const reportItems = (await readToExcel(stream)).map((item) => {
        item.reportId = report.id;
        return item;
      });

      // Сохраняем данные из выписки
      await tx.reportItem.createMany({ data: reportItems });

      // Привязываем выписку к тикету
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          report: { connect: { id: report.id } },
        },
      });
    });

    return this.validate(ticketId);
  }

  async getReportItems(
    ticketId: string,
    approved: boolean,
  ): Promise<ReportItem[]> {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirstOrThrow({
        where: { id: ticketId },
        include: { report: true },
      });

      if (!ticket || !ticket.report)
        throw new NotFoundException('Тикет не найден');

      const items = await tx.reportItem.findMany({
        where: { AND: [{ reportId: ticket.report.id }, { approved }] },
      });

      return items;
    });
  }

  async validate(ticketId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirstOrThrow({
        where: { id: ticketId },
        include: { report: true, TicketReciept: true },
      });

      if (!ticket.report) return;

      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.PENDING },
      });

      const reportItems = await tx.reportItem.findMany({
        where: { reportId: ticket.report.id },
      });

      const reciepts = await Promise.all(
        ticket.TicketReciept.map(
          async (ticket) =>
            await tx.reciept.findFirst({ where: { id: ticket.recieptId } }),
        ),
      );
      let allIsOk = true;
      for (const item of reportItems) {
        const receipt = reciepts.find((receipt) => {
          return (
            receipt.paidAt.setMilliseconds(0) ===
              item.authDate.setMilliseconds(0) &&
            item.sum.equals(receipt.totalAmount)
          );
        });
        if (receipt)
          await tx.reportItem.update({
            where: { id: item.id },
            data: { approved: true },
          });
        else allIsOk = false;
      }

      const status: TicketStatus = allIsOk
        ? TicketStatus.OK
        : TicketStatus.FAILED;

      await tx.ticket.update({
        where: { id: ticketId },
        data: { status },
      });
    });
  }

  async findAll(filters: ReportFilters, opts: Pagination) {
    return this.prisma.report.findMany({
      where: filters,
      take: opts.limit,
      skip: opts.offset,
    });
  }

  async findOne(reportId: string) {
    return this.prisma.report.findFirstOrThrow({ where: { id: reportId } });
  }

  async remove(reportId: string) {
    return this.prisma.report.delete({ where: { id: reportId } });
  }
}
