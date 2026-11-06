import { Controller, Get, Query, UseGuards, StreamableFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('funnel')
  async getFunnel(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.adminService.getFunnelMetrics(startDate, endDate);
  }

  @Get('accuracy')
  async getAccuracy(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.adminService.getAccuracyMetrics(startDate, endDate);
  }

  @Get('cost')
  async getCost(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.adminService.getCostMetrics(startDate, endDate);
  }

  @Get('cost/export')
  async exportCost(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<StreamableFile> {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const csv = await this.adminService.exportCostCSV(startDate, endDate);
    return new StreamableFile(Buffer.from(csv));
  }
}
