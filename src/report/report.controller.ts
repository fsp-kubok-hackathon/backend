import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { ReportFilters } from './entities/report.entity';

@ApiTags("Выписки")
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Get()
  @ApiOperation({})
  @RequiredAuth('ACCOUNTANT')
  findAll(@Query() filters: ReportFilters, @Query('offset') offset?: number, @Query('limit') limit?: number,) {
    return this.reportService.findAll(filters, { offset, limit });
  }

  @Get("/test")
  @ApiOperation({})
  async test(@Query("url") url: string) {
    await this.reportService.upload({ url })
    return {}
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
