import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
import Pagination from 'src/shared/pagination';
import { ReportFilters } from './entities/report.entity';
import { readToExcel, streamFromUrl } from 'src/utils/excel';


@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) { }

  async upload(createReportDto: CreateReportDto) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          id: uuidv7(),
          url: createReportDto.url,
        }
      })

      const stream = await streamFromUrl(report.url)
      const reportItems = (await readToExcel(stream)).map(item => {
        item.reportId = report.id;
        return item;
      })

      const _ = await tx.reportItem.createMany({ data: reportItems })
    })
  }

  async findAll(filters: ReportFilters, opts: Pagination) {
    return this.prisma.report.findMany({ where: filters, take: opts.limit, skip: opts.offset })
  }

  async findOne(reportId: string) {
    return this.prisma.report.findFirstOrThrow({ where: { id: reportId } })
  }

  async remove(reportId: string) {
    return this.prisma.report.delete({ where: { id: reportId } })
  }
}
