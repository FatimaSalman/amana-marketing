"use client";

import { RegionalPerformance } from "@/src/types/marketing";

interface HeatMapProps {
  data: RegionalPerformance[];
  metric: 'revenue' | 'spend';
  className?: string;
  height?: number;
}

export function HeatMap({
  data,
  metric,
  className = "",
  height = 500
}: HeatMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">
          Regional {metric === 'revenue' ? 'Revenue' : 'Spend'} Heat Map
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No regional data available
        </div>
      </div>
    );
  }

  // Calculate min and max values for scaling
  const values = data.map(item => item[metric]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  // Function to calculate circle size based on value
  const getCircleSize = (value: number): number => {
    const minSize = 40;
    const maxSize = 120;
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    return minSize + normalized * (maxSize - minSize);
  };

  // Function to get color intensity based on value
  const getColorIntensity = (value: number): number => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    return Math.floor(normalized * 100);
  };

  const formatMetricValue = (value: number): string => {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Regional {metric === 'revenue' ? 'Revenue' : 'Spend'} Heat Map
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Bubble size represents {metric === 'revenue' ? 'revenue' : 'spend'} amount
        </p>

        <div className="flex gap-8 items-start">
          {/* Bubble Chart */}
          <div className="flex-1 flex flex-wrap gap-6 justify-center items-center min-h-[300px]">
            {data.map((region) => (
              <div key={region.region} className="flex flex-col items-center">
                <div
                  className="rounded-full flex flex-col items-center justify-center text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    width: `${getCircleSize(region[metric])}px`,
                    height: `${getCircleSize(region[metric])}px`,
                    backgroundColor: metric === 'revenue'
                      ? `rgba(34, 197, 94, ${getColorIntensity(region[metric]) / 100 + 0.3})`
                      : `rgba(59, 130, 246, ${getColorIntensity(region[metric]) / 100 + 0.3})`,
                    border: `3px solid ${metric === 'revenue'
                        ? `rgba(21, 128, 61, ${getColorIntensity(region[metric]) / 100 + 0.5})`
                        : `rgba(37, 99, 235, ${getColorIntensity(region[metric]) / 100 + 0.5})`
                      }`
                  }}
                  title={`${region.region}: ${formatMetricValue(region[metric])}`}
                >
                  <span className="text-sm font-bold drop-shadow-sm text-center px-2">
                    {region.region}
                  </span>
                  <span className="text-xs mt-1 drop-shadow-sm bg-white/20 px-2 py-1 rounded-full">
                    {formatMetricValue(region[metric])}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">
                  {region.country}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="w-48 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <h4 className="font-semibold text-white mb-3 text-center">Bubble Size</h4>
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: metric === 'revenue' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                    borderColor: metric === 'revenue' ? 'rgb(21, 128, 61)' : 'rgb(37, 99, 235)'
                  }}
                >
                  Small
                </div>
                <span className="text-xs text-gray-300 mt-1">
                  {formatMetricValue(minValue)}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: metric === 'revenue' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                    borderColor: metric === 'revenue' ? 'rgb(21, 128, 61)' : 'rgb(37, 99, 235)'
                  }}
                >
                  Medium
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: metric === 'revenue' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(59, 130, 246, 0.7)',
                    borderColor: metric === 'revenue' ? 'rgb(21, 128, 61)' : 'rgb(37, 99, 235)'
                  }}
                >
                  Large
                </div>
                <span className="text-xs text-gray-300 mt-1">
                  {formatMetricValue(maxValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}