'use client';

import { useEffect, useState } from 'react';

interface UsageSummary {
  pipeline: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  resetTime: string;
  isAlerting: boolean;
}

interface AlertResult {
  pipeline: string;
  isAlerting: boolean;
  currentUsage: number;
  limit: number;
  percentage: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface DailyUsageRecord {
  id: string;
  pipeline: string;
  date: string;
  requests: number;
  tokens?: number;
  characters?: number;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

const PIPELINE_LABELS: Record<string, string> = {
  'gemini-ocr': 'Gemini OCR',
  'gemini-llm': 'Gemini LLM',
  'assemblyai-stt': 'AssemblyAI STT',
  'groq-llm': 'Groq LLM',
};

const PIPELINE_COLORS: Record<string, string> = {
  'gemini-ocr': '#4285F4',
  'gemini-llm': '#34A853',
  'assemblyai-stt': '#EA4335',
  'groq-llm': '#FBBC05',
};

export default function UsageDashboard() {
  const [usage, setUsage] = useState<UsageSummary[]>([]);
  const [alerts, setAlerts] = useState<AlertResult[]>([]);
  const [history, setHistory] = useState<Record<string, DailyUsageRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usageRes, alertsRes, historyRes] = await Promise.all([
        fetch('/api/admin/monitoring/usage'),
        fetch('/api/admin/monitoring/alerts'),
        fetch(`/api/admin/monitoring/history?days=${selectedDays}`),
      ]);

      if (!usageRes.ok || !alertsRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const usageData = await usageRes.json();
      const alertsData = await alertsRes.json();
      const historyData = await historyRes.json();

      setUsage(usageData);
      setAlerts(alertsData);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedDays]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'warning': return '#F59E0B';
      default: return '#16A34A';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FEF2F2';
      case 'warning': return '#FFFBEB';
      default: return '#F0FDF4';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatResetTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const firstAlert = alerts[0];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usage Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitor API usage across all AI pipelines. Alert threshold: 85%
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="mb-8">
          {alerts.length > 0 && firstAlert && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: getSeverityBg(firstAlert.severity) }}>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getSeverityColor(firstAlert.severity) }}
                >
                  {firstAlert.severity.toUpperCase()}
                </span>
                <span className="text-sm font-medium" style={{ color: getSeverityColor(firstAlert.severity) }}>
                  {alerts
                    .filter((a) => a.severity === firstAlert.severity)
                    .map((a) => PIPELINE_LABELS[a.pipeline] ?? a.pipeline)
                    .join(', ')}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  {alerts.find((a) => a.severity === firstAlert.severity)?.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {usage.map((item) => (
            <div
              key={item.pipeline}
              className="bg-white rounded-lg shadow-sm border p-6"
              style={{
                borderLeft: `4px solid ${item.isAlerting ? '#F59E0B' : '#16A34A'}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{PIPELINE_LABELS[item.pipeline] ?? item.pipeline}</h3>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: item.isAlerting ? '#FEF3C7' : '#D1FAE5',
                    color: item.isAlerting ? '#92400E' : '#065F46',
                  }}
                >
                  {item.isAlerting ? 'ALERT' : 'OK'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium text-gray-900">
                      {item.currentUsage.toLocaleString()} / {item.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                        backgroundColor: item.percentage >= 100 ? '#DC2626' : item.percentage >= 85 ? '#F59E0B' : '#16A34A',
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.percentage.toFixed(1)}%</span>
                  <span className="text-gray-500">
                    Resets: {formatResetTime(item.resetTime)} WIB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Usage Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Usage Trend (Last {selectedDays} Days)</h3>
            <div className="h-80 relative">
              <UsageChart
                history={history}
                limits={{
                  'gemini-ocr': 500,
                  'gemini-llm': 500,
                  'assemblyai-stt': 185,
                  'groq-llm': 500,
                }}
                height={320}
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              {Object.entries(PIPELINE_LABELS).map(([key, label]) => (
                <span key={key} className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: PIPELINE_COLORS[key] }}
                  ></span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Alert Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Alert Details</h3>
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No alerts</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.pipeline}
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: getSeverityColor(alert.severity),
                      backgroundColor: getSeverityBg(alert.severity),
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{PIPELINE_LABELS[alert.pipeline] ?? alert.pipeline}</h4>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getSeverityColor(alert.severity),
                          color: 'white',
                        }}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{alert.currentUsage.toLocaleString()} / {alert.limit.toLocaleString()}</span>
                      <span>{alert.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed History Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Usage Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  {Object.keys(PIPELINE_LABELS).map((key) => (
                    <th key={key} className="text-right py-3 px-4 font-medium text-gray-600">
                      {PIPELINE_LABELS[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(history).flatMap(([pipeline, records]) =>
                  records
                    .slice(-selectedDays)
                    .reverse()
                    .map((record, idx) => (
                      <tr key={`${pipeline}-${record.date}`} className="border-b border-gray-100 hover:bg-gray-50">
                        {idx === 0 && (
                          <td className="py-3 px-4 font-medium text-gray-900" rowSpan={records.length}>
                            {formatDate(record.date)}
                          </td>
                        )}
                        <td className="py-3 px-4 text-right text-gray-900">
                          {record.requests.toLocaleString()}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data refreshes automatically every 30 seconds</p>
          <p className="mt-1">
            Quota limits: Gemini OCR/LLM 500 RPD, AssemblyAI STT 185 RPD, Groq LLM 500 RPD
          </p>
        </div>
      </div>
    </div>
  );
}

function UsageChart({
  history,
  limits,
  height,
}: {
  history: Record<string, DailyUsageRecord[]>;
  limits: Record<string, number>;
  height: number;
}) {
  // Collect all dates
  const allDates = new Set<string>();
  Object.values(history).forEach((records) => {
    records.forEach((r) => allDates.add(r.date));
  });
  const sortedDates = Array.from(allDates).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    );
  }

  const maxLimit = Math.max(...Object.values(limits));
  const chartHeight = height - 40;
  const chartWidth = sortedDates.length * 40;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

      {/* 85% threshold line */}
      {Object.entries(limits).map(([pipeline, limit]) => {
        const y = chartHeight - (limit * 0.85 / maxLimit) * chartHeight;
        return (
          <line
            key={`threshold-${pipeline}`}
            x1="0"
            y1={y}
            x2={chartWidth}
            y2={y}
            stroke={PIPELINE_COLORS[pipeline] ?? '#000'}
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        );
      })}

      {/* Data lines */}
      {Object.entries(history).map(([pipeline, records]) => {
        const color = PIPELINE_COLORS[pipeline] ?? '#000';
        const points = sortedDates.map((date, i) => {
          const record = records.find((r) => r.date === date);
          const value = record?.requests || 0;
          const y = chartHeight - (value / maxLimit) * chartHeight;
          return `${i * 40},${y}`;
        }).join(' ');

        return (
          <g key={pipeline}>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
            {records.map((record, _idx) => {
              const dateIdx = sortedDates.indexOf(record.date);
              if (dateIdx === -1) return null;
              const y = chartHeight - (record.requests / maxLimit) * chartHeight;
              return (
                <circle
                  key={`${pipeline}-${record.date}`}
                  cx={dateIdx * 40}
                  cy={y}
                  r="3"
                  fill={color}
                />
              );
            })}
          </g>
        );
      })}

      {/* X-axis labels */}
      {sortedDates.map((date, i) => (
        <text
          key={date}
          x={i * 40}
          y={chartHeight + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
          transform={`rotate(-45 ${i * 40} ${chartHeight + 20})`}
        >
          {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </text>
      ))}

      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <text
          key={ratio}
          x="-10"
          y={chartHeight - ratio * chartHeight + 4}
          textAnchor="end"
          fontSize="10"
          fill="#6B7280"
        >
          {Math.round(ratio * maxLimit).toLocaleString()}
        </text>
      ))}
    </svg>
  );
}