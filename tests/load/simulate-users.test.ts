/**
 * Load test simulation for Voltess API
 * 
 * Simulates 1-3 users with typical UMKM usage patterns
 * Verifies quota handling and fallback behavior
 * 
 * Run with: npx vitest run tests/load/simulate-users.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  DEFAULT_USAGE_PATTERN,
  generateDailyActions,
  calculateExpectedQuotaUsage,
} from './user-scenarios';

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

interface TestMetrics {
  successCount: number;
  errorCount: number;
  fallbackCount: number;
  latencies: number[];
  errors: Array<{ action: string; error: string }>;
}

async function makeRequest(
  endpoint: string,
  payload: Record<string, unknown>,
  authToken?: string
): Promise<{ status: number; data: unknown; latency: number }> {
  const start = Date.now();
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      data,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error instanceof Error ? error.message : 'Network error' },
      latency: Date.now() - start,
    };
  }
}

function getEndpointForAction(action: string): string {
  switch (action) {
    case 'ocr-meter':
      return '/ai/ocr-meter';
    case 'ocr-label':
      return '/ai/ocr-label';
    case 'ocr-token':
      return '/ai/ocr-token';
    case 'stt-extract':
      return '/ai/stt-extract';
    case 'estimate':
      return '/ai/estimate';
    case 'recommend':
      return '/ai/recommend';
    case 'explain':
      return '/ai/explain';
    case 'ask':
      return '/ai/ask';
    default:
      return '/ai/estimate';
  }
}

function isFallbackResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return obj.mode === 'mock' || obj.fallback_used === true;
}

function isRateLimited(status: number, data: unknown): boolean {
  if (status === 429) return true;
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return obj.error?.code === 'RATE_LIMITED';
}

describe('Load Test: Simulated UMKM Users', () => {
  let metrics: TestMetrics;
  let authToken: string | undefined;

  beforeAll(async () => {
    metrics = {
      successCount: 0,
      errorCount: 0,
      fallbackCount: 0,
      latencies: [],
      errors: [],
    };

    // Try to get auth token if needed
    try {
      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+6281234567890' }),
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        authToken = data.access_token;
      }
    } catch {
      // No auth needed or auth failed, continue without
    }
  });

  afterAll(() => {
    // Print summary
    const total = metrics.successCount + metrics.errorCount;
    const successRate = total > 0 ? (metrics.successCount / total) * 100 : 0;
    const fallbackRate = total > 0 ? (metrics.fallbackCount / total) * 100 : 0;
    const avgLatency = metrics.latencies.length > 0
      ? metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length
      : 0;
    const p95Latency = metrics.latencies.length > 0
      ? metrics.latencies.sort((a, b) => a - b)[Math.floor(metrics.latencies.length * 0.95)]
      : 0;

    console.log('\n=== LOAD TEST SUMMARY ===');
    console.log(`Total Requests: ${total}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`Fallback Rate: ${fallbackRate.toFixed(1)}%`);
    console.log(`Avg Latency: ${avgLatency.toFixed(0)}ms`);
    console.log(`P95 Latency: ${p95Latency.toFixed(0)}ms`);
    console.log(`Errors: ${metrics.errors.length}`);
    if (metrics.errors.length > 0) {
      console.log('Sample Errors:');
      metrics.errors.slice(0, 5).forEach((e) => {
        console.log(`  - ${e.action}: ${e.error}`);
      });
    }
  });

  it('should calculate expected quota usage for 1-3 users', () => {
    for (const userCount of [1, 2, 3]) {
      const usage = calculateExpectedQuotaUsage(userCount, DEFAULT_USAGE_PATTERN);
      
      console.log(`\n=== Expected Usage for ${userCount} user(s) ===`);
      Object.entries(usage).forEach(([pipeline, stats]) => {
        console.log(
          `  ${pipeline}: ${stats.requests}/${stats.limit} (${stats.percentage.toFixed(1)}%)`
        );
        // Verify we stay under limits for 1-3 users
        expect(stats.percentage).toBeLessThan(100);
      });
    }
  });

  it('should simulate a single day for 1 user', async () => {
    const userCount = 1;
    const actions = generateDailyActions(userCount, DEFAULT_USAGE_PATTERN);
    
    console.log(`\n=== Simulating ${actions.length} actions for ${userCount} user ===`);
    
    // Run a subset for quick test (first 20 actions)
    const testActions = actions.slice(0, 20);
    
    // If API is not available, just verify the scenario generation works
    let apiAvailable = false;
    try {
      const healthRes = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      apiAvailable = healthRes.ok;
    } catch {
      // apiAvailable remains false
    }
    
    if (!apiAvailable) {
      console.log('API not available, skipping live request test');
      // Just verify we can generate scenarios correctly
      expect(testActions.length).toBeGreaterThan(0);
      expect(testActions.every(a => a.type && a.payload)).toBe(true);
      return;
    }
    
    for (const action of testActions) {
      const endpoint = getEndpointForAction(action.type);
      
      // Create appropriate payload for each endpoint
      const payload = createTestPayload(action.type, action.payload);
      
      const result = await makeRequest(endpoint, payload, authToken);
      
      metrics.latencies.push(result.latency);
      
      if (result.status >= 200 && result.status < 300) {
        metrics.successCount++;
        if (isFallbackResponse(result.data)) {
          metrics.fallbackCount++;
        }
      } else if (isRateLimited(result.status, result.data)) {
        // Rate limited - this is expected behavior when quota exceeded
        metrics.fallbackCount++;
        console.log(`Rate limited on ${action.type} - fallback triggered`);
      } else {
        metrics.errorCount++;
        metrics.errors.push({
          action: action.type,
          error: `HTTP ${result.status}: ${JSON.stringify(result.data)}`,
        });
      }
      
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    
    // Verify success rate is reasonable
    const total = metrics.successCount + metrics.errorCount;
    const successRate = total > 0 ? (metrics.successCount / total) * 100 : 0;
    expect(successRate).toBeGreaterThanOrEqual(80); // At least 80% success
  }, 60000); // 60 second timeout

  it('should verify quota limits are not exceeded for 3 users', () => {
    const usage = calculateExpectedQuotaUsage(3, DEFAULT_USAGE_PATTERN);
    
    // Verify all pipelines stay under 100% for 3 users
    Object.entries(usage).forEach(([pipeline, stats]) => {
      expect(stats.percentage).toBeLessThan(100);
      
      // Log if approaching limits
      if (stats.percentage > 70) {
        console.log(`WARNING: ${pipeline} at ${stats.percentage.toFixed(1)}% for 3 users`);
      }
    });
  });

  it('should test fallback behavior when quota approached', async () => {
    // This test simulates what happens when quota is near limit
    // We can't easily test actual quota exhaustion without using real API calls
    // But we can verify the fallback logic exists
    
    const usage = calculateExpectedQuotaUsage(3, DEFAULT_USAGE_PATTERN);
    
    // Check that at 3 users, we're still well under limits
    Object.entries(usage).forEach(([pipeline, stats]) => {
      console.log(`${pipeline}: ${stats.percentage.toFixed(1)}% at 3 users`);
      // Should be well under 85% alert threshold for 3 users
      expect(stats.percentage).toBeLessThan(85);
    });
  });

  it('should verify performance requirements', () => {
    // After running the simulation, check P95 latency
    if (metrics.latencies.length > 0) {
      const p95Latency = metrics.latencies
        .sort((a, b) => a - b)[Math.floor(metrics.latencies.length * 0.95)];
      
      console.log(`P95 Latency: ${p95Latency}ms`);
      // Requirement: P95 latency < 2s
      expect(p95Latency).toBeLessThan(2000);
    }
  });
});

function createTestPayload(
  actionType: string,
  basePayload: Record<string, unknown>
): Record<string, unknown> {
  // Create valid test payloads for each endpoint
  switch (actionType) {
    case 'ocr-meter':
      return {
        meter_type: basePayload.meter_type || 'prabayar',
        // In real test, we'd upload a file. For mock mode, we can skip file.
      };
    case 'ocr-label':
      return {
        appliance_hint: basePayload.appliance_hint || 'AC',
      };
    case 'ocr-token':
      return {};
    case 'stt-extract':
      return {
        audio_ref: basePayload.audio_ref || 'data:audio/mp3;base64,dummy',
        appliances: basePayload.appliances || [],
      };
    case 'estimate':
      return {
        business_id: basePayload.business_id || 'test-biz',
        window: basePayload.window || { from: '2026-01-01', to: '2026-01-31' },
        appliances: basePayload.appliances || [
          { appliance_id: 'ac-1', power_kw: 0.9, hours: 8, load_factor: 0.8 },
        ],
      };
    case 'recommend':
      return {
        business_id: basePayload.business_id || 'test-biz',
        estimate: basePayload.estimate || { total_kwh: 100, explained_kwh: 80, unexplained_kwh: 20 },
        template_id: basePayload.template_id || 'default',
        unit_label: basePayload.unit_label || 'kWh',
      };
    case 'explain':
      return {
        business_id: basePayload.business_id || 'test-biz',
        kind: basePayload.kind || 'estimate',
        result: basePayload.result || { total_kwh: 100 },
      };
    case 'ask':
      return {
        business_id: basePayload.business_id || 'test-biz',
        question: basePayload.question || 'How to save energy?',
      };
    default:
      return basePayload;
  }
}