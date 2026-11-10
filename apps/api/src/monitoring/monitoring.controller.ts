import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsageTrackerService, UsageSummary, DailyUsageRecord } from './usage-tracker.service';
import { UsageAlertService, AlertResult } from './usage-alert.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(
    private readonly usageTracker: UsageTrackerService,
    private readonly usageAlert: UsageAlertService,
  ) {}

  @Get('usage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current usage for all pipelines' })
  @ApiResponse({ status: 200, description: 'Usage summaries for all pipelines' })
  async getUsage(): Promise<UsageSummary[]> {
    return this.usageTracker.getAllUsageSummaries();
  }

  @Get('usage/:pipeline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current usage for a specific pipeline' })
  @ApiResponse({ status: 200, description: 'Usage summary for the pipeline' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async getPipelineUsage(
    @Query('pipeline') pipeline: string,
  ): Promise<UsageSummary | null> {
    const summaries = await this.usageTracker.getAllUsageSummaries();
    return summaries.find((s) => s.pipeline === pipeline) || null;
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get usage history for all pipelines' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of history (default 30)' })
  @ApiResponse({ status: 200, description: 'Usage history for all pipelines' })
  async getHistory(@Query('days') days?: number): Promise<Record<string, DailyUsageRecord[]>> {
    return this.usageTracker.getAllUsageHistory(days || 30);
  }

  @Get('history/:pipeline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get usage history for a specific pipeline' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of history (default 30)' })
  @ApiResponse({ status: 200, description: 'Usage history for the pipeline' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async getPipelineHistory(
    @Query('pipeline') pipeline: string,
    @Query('days') days?: number,
  ): Promise<DailyUsageRecord[]> {
    return this.usageTracker.getUsageHistory(pipeline, days || 30);
  }

  @Get('alerts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get alert status for all pipelines' })
  @ApiResponse({ status: 200, description: 'Alert status for all pipelines' })
  async getAlerts(): Promise<AlertResult[]> {
    return this.usageAlert.checkAllAlerts();
  }

  @Get('alerts/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get only alerting pipelines' })
  @ApiResponse({ status: 200, description: 'Pipelines currently at or above 85% threshold' })
  async getActiveAlerts(): Promise<AlertResult[]> {
    return this.usageAlert.getAlertingPipelines();
  }

  @Get('alerts/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get human-readable alert summary' })
  @ApiResponse({ status: 200, description: 'Summary string' })
  async getAlertSummary(): Promise<{ summary: string }> {
    const alerts = await this.usageAlert.checkAllAlerts();
    return { summary: this.usageAlert.getAlertSummary(alerts) };
  }
}