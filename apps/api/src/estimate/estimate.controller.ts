import { Controller, Post, Body } from '@nestjs/common';
import { EstimateService } from './estimate.service';
import type { EstimateInput, EstimateResult, RecommendResponse } from '@voltess/contracts';

@Controller('estimate')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Post('v0')
  async estimate(@Body() input: EstimateInput): Promise<EstimateResult> {
    return this.estimateService.calculateEstimate(input);
  }

  @Post('recommend')
  async recommend(@Body() body: { input: EstimateInput; tariff_rp_per_kwh: number }): Promise<RecommendResponse> {
    const tariff = body.tariff_rp_per_kwh || 1444;
    return this.estimateService.generateRecommendations(body.input, tariff);
  }
}
