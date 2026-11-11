import { Injectable, Logger } from '@nestjs/common';
import { UsageTrackerService, UsageSummary } from './usage-tracker.service';

export interface AlertResult {
  pipeline: string;
  isAlerting: boolean;
  currentUsage: number;
  limit: number;
  percentage: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

@Injectable()
export class UsageAlertService {
  private readonly logger = new Logger(UsageAlertService.name);
  private readonly ALERT_THRESHOLD = 85; // 85%

  constructor(private readonly usageTracker: UsageTrackerService) {}

  /**
   * Check all pipelines and return alert status
   */
  async checkAllAlerts(): Promise<AlertResult[]> {
    const summaries = await this.usageTracker.getAllUsageSummaries();
    return summaries.map((summary) => this.createAlert(summary));
  }

  /**
   * Check alert for a specific pipeline
   */
  async checkAlert(pipeline: string): Promise<AlertResult | null> {
    const currentUsage = await this.usageTracker.getCurrentUsage(pipeline);
    const limit = this.usageTracker.getDailyLimit(pipeline);

    if (limit === 0) {
      return null;
    }

    const percentage = (currentUsage / limit) * 100;
    const isAlerting = percentage >= this.ALERT_THRESHOLD;

    return this.createAlert({
      pipeline,
      currentUsage,
      limit,
      percentage,
      resetTime: new Date().toISOString(),
      isAlerting,
    });
  }

  /**
   * Get pipelines that are currently alerting
   */
  async getAlertingPipelines(): Promise<AlertResult[]> {
    const allAlerts = await this.checkAllAlerts();
    return allAlerts.filter((alert) => alert.isAlerting);
  }

  /**
   * Check if any pipeline is alerting
   */
  async hasAnyAlert(): Promise<boolean> {
    const alerting = await this.getAlertingPipelines();
    return alerting.length > 0;
  }

  private createAlert(summary: UsageSummary): AlertResult {
    let severity: 'info' | 'warning' | 'critical' = 'info';
    let message = '';

    if (summary.percentage >= 100) {
      severity = 'critical';
      message = `${summary.pipeline} has exceeded daily quota (${summary.currentUsage}/${summary.limit}). Requests will be rate limited.`;
    } else if (summary.percentage >= this.ALERT_THRESHOLD) {
      severity = 'warning';
      message = `${summary.pipeline} is at ${summary.percentage.toFixed(1)}% of daily quota (${summary.currentUsage}/${summary.limit}). Approaching limit.`;
    } else {
      severity = 'info';
      message = `${summary.pipeline} is at ${summary.percentage.toFixed(1)}% of daily quota (${summary.currentUsage}/${summary.limit}).`;
    }

    return {
      pipeline: summary.pipeline,
      isAlerting: summary.isAlerting,
      currentUsage: summary.currentUsage,
      limit: summary.limit,
      percentage: summary.percentage,
      message,
      severity,
    };
  }

  /**
   * Format alerts for dashboard display
   */
  formatForDashboard(alerts: AlertResult[]): AlertResult[] {
    return alerts.sort((a, b) => {
      // Sort by severity: critical > warning > info
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Get human-readable alert summary
   */
  getAlertSummary(alerts: AlertResult[]): string {
    const critical = alerts.filter((a) => a.severity === 'critical').length;
    const warning = alerts.filter((a) => a.severity === 'warning').length;
    const info = alerts.filter((a) => a.severity === 'info').length;

    if (critical > 0) {
      return `${critical} pipeline(s) over quota, ${warning} warning(s), ${info} OK`;
    }
    if (warning > 0) {
      return `${warning} pipeline(s) near quota, ${info} OK`;
    }
    return `All ${info} pipelines within normal limits`;
  }
}