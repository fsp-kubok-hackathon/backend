import { Controller, Get, Param, Delete, Query, Post, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { ReportFilters } from './entities/report.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags("Выписки")
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post()
  @ApiOperation({ summary: "Загрузка выписки в тикет" })
  @UseInterceptors(FileInterceptor("file"))
  @RequiredAuth("ACCOUNTANT")
  upload(@Query("ticketId") ticketId: string, @UploadedFile(new ParseFilePipe({
    validators: [
      new FileTypeValidator({ fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    ],
  })) file: Express.Multer.File) {
    return this.reportService.upload(ticketId, file)
  }

  @Get()
  @ApiOperation({})
  @RequiredAuth('ACCOUNTANT')
  findAll(@Query() filters: ReportFilters, @Query('offset') offset?: number, @Query('limit') limit?: number,) {
    return this.reportService.findAll(filters, { offset, limit });
  }

  @Get(':id')
  @ApiOperation({})
  @RequiredAuth('ACCOUNTANT')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({})
  @RequiredAuth('ACCOUNTANT')
  remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}
