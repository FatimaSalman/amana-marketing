// src/components/ui/line-chart.tsx
interface LineChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

interface LineChartProps {
    title: string;
    data: LineChartDataPoint[];
    className?: string;
    height?: number;
    showValues?: boolean;
    formatValue?: (value: number) => string;
    strokeWidth?: number;
}

export function LineChart({
    title,
    data,
    className = "",
    height = 300,
    showValues = true,
    formatValue = (value) => value.toLocaleString(),
    strokeWidth = 3
}: LineChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                <div className="flex items-center justify-center h-48 text-gray-400">
                    No data available
                </div>
            </div>
        );
    }

    const values = data.map(item => item.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue;

    // SVG dimensions
    const svgWidth = '100%';
    const svgHeight = height;
    const padding = { top: 40, right: 20, bottom: 40, left: 40 };

    // Calculate points for the line
    const points = data.map((item, index) => {
        const x = ((index / (data.length - 1)) * (100 - (padding.left + padding.right) / 5)) + (padding.left / 5);
        const y = valueRange > 0
            ? ((maxValue - item.value) / valueRange) * (100 - (padding.top + padding.bottom) / 3) + (padding.top / 3)
            : 50; // Center if all values are the same

        return { x, y, value: item.value, label: item.label };
    });

    // Create SVG path for the line
    const pathData = points.map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
        <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
            <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

            <div className="relative" style={{ height: `${height}px` }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="overflow-visible"
                >
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                        <line
                            key={index}
                            x1={padding.left / 5}
                            y1={padding.top / 3 + ratio * (100 - (padding.top + padding.bottom) / 3)}
                            x2={100 - padding.right / 5}
                            y2={padding.top / 3 + ratio * (100 - (padding.top + padding.bottom) / 3)}
                            stroke="#374151"
                            strokeWidth="0.5"
                            strokeDasharray="1,2"
                        />
                    ))}

                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={data[0]?.color || '#3B82F6'}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points and value labels */}
                    {points.map((point, index) => (
                        <g key={index}>
                            {/* Value label */}
                            {showValues && (
                                <text
                                    x={point.x}
                                    y={point.y - 8}
                                    textAnchor="middle"
                                    fontSize="3"
                                    fill="#9CA3AF"
                                    className="font-medium"
                                >
                                    {formatValue(point.value)}
                                </text>
                            )}

                            {/* Data point circle */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="1.5"
                                fill={data[index]?.color || '#3B82F6'}
                                stroke="#1F2937"
                                strokeWidth="0.5"
                                className="transition-all duration-200 hover:r-2"
                            />

                            {/* X-axis labels */}
                            <text
                                x={point.x}
                                y={95}
                                textAnchor="middle"
                                fontSize="2.5"
                                fill="#6B7280"
                                className="font-medium"
                            >
                                {point.label}
                            </text>
                        </g>
                    ))}

                    {/* Y-axis labels */}
                    {[0, 0.5, 1].map((ratio, index) => {
                        const value = maxValue - (ratio * valueRange);
                        return (
                            <text
                                key={index}
                                x={padding.left / 5 - 2}
                                y={padding.top / 3 + ratio * (100 - (padding.top + padding.bottom) / 3)}
                                textAnchor="end"
                                fontSize="2.5"
                                fill="#6B7280"
                                className="font-medium"
                                dy="0.3em"
                            >
                                {formatValue(value)}
                            </text>
                        );
                    })}
                </svg>

                {/* Legend for min/max values */}
                <div className="absolute top-2 right-4 flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                        <div
                            className="w-3 h-0.5 rounded-full"
                            style={{ backgroundColor: data[0]?.color || '#3B82F6' }}
                        />
                        <span>Max: {formatValue(maxValue)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div
                            className="w-3 h-0.5 rounded-full opacity-50"
                            style={{ backgroundColor: data[0]?.color || '#3B82F6' }}
                        />
                        <span>Min: {formatValue(minValue)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}