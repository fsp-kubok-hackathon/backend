import { Injectable } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportService } from 'src/report/report.service';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) { }

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
  }
}
