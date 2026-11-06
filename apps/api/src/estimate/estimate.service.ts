import { Injectable } from '@nestjs/common';
import { estimate, calculateCostRp } from '@voltess/energy-calc';
import type {
  EstimateInput,
  EstimateResult,
  RecommendResponse,
  Recommendation,
} from '@voltess/contracts';

@Injectable()
export class EstimateService {
  calculateEstimate(input: EstimateInput): EstimateResult {
    return estimate(input);
  }

  generateRecommendations(input: EstimateInput, tariff: number): RecommendResponse {
    const estimateResult = estimate(input);

    const recommendations: Recommendation[] = [];

    for (const appEst of estimateResult.per_appliance.slice(0, 3)) {
      const appliance = input.appliances.find((a) => a.appliance_id === appEst.appliance_id);
      if (!appliance) continue;

      const currentKwh = appEst.kwh;
      const reducedKwh = currentKwh * 0.8;
      const savingsKwh = currentKwh - reducedKwh;
      const savingsRp = calculateCostRp(savingsKwh, tariff);

      const confidenceWeight = this.confidenceToWeight(appEst.confidence);
      const easeScore = 0.7;
      const score = savingsKwh * confidenceWeight * easeScore;

      recommendations.push({
        action_id: `reduce_${appEst.appliance_id}`,
        title: `Kurangi pemakaian ${appliance.appliance_id} 20%`,
        est_saving_kwh: { min: savingsKwh * 0.8, max: savingsKwh * 1.2 },
        est_saving_rp: { min: Math.floor(savingsRp * 0.8), max: Math.ceil(savingsRp * 1.2) },
        confidence: appEst.confidence,
        effort: 'medium',
        safety_note: 'Pastikan alat tidak dipakai saat puncak kebutuhan',
        score,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);

    return {
      request_id: Date.now().toString(),
      engine_version: '0.1.0',
      mode: 'mock',
      confidence: estimateResult.overall_confidence,
      warnings: estimateResult.display_level === 'insufficient_data' ? ['Belum cukup data'] : [],
      recommendations: recommendations.slice(0, 3),
    };
  }

  private confidenceToWeight(confidence: string): number {
    if (confidence === 'high') return 1.0;
    if (confidence === 'medium') return 0.7;
    return 0.4;
  }
}
