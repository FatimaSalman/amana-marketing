// app/weekly-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '@/src/lib/api';
import { MarketingData, WeeklyPerformance } from '@/src/types/marketing';
import { Navbar } from '@/src/components/ui/navbar';
import { Footer } from '@/src/components/ui/footer';
import { CardMetric } from '@/src/components/ui/card-metric';
import { BarChart } from '@/src/components/ui/bar-chart';
import { LineChart } from '@/src/components/ui/line-chart';
import { Table } from '@/src/components/ui/table';
import { Calendar, TrendingUp, DollarSign, Users, Target, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';

export default function WeeklyView() {
    const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchMarketingData();
                setMarketingData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Error loading marketing data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Aggregate weekly performance data
    const weeklyData = useMemo(() => {
        if (!marketingData?.campaigns) return [];

        const weeklyMap: { [key: string]: WeeklyPerformance } = {};

        marketingData.campaigns.forEach(campaign => {
            campaign.weekly_performance?.forEach(week => {
                const weekKey = week.week_start;
                if (!weeklyMap[weekKey]) {
                    weeklyMap[weekKey] = { ...week };
                } else {
                    weeklyMap[weekKey].impressions += week.impressions;
                    weeklyMap[weekKey].clicks += week.clicks;
                    weeklyMap[weekKey].conversions += week.conversions;
                    weeklyMap[weekKey].spend += week.spend;
                    weeklyMap[weekKey].revenue += week.revenue;
                }
            });
        });

        return Object.values(weeklyMap)
            .sort((a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime())
            .slice(-8); // Last 8 weeks for better visualization
    }, [marketingData?.campaigns]);

    // Calculate week-over-week growth
    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    // Prepare data for line charts
    const revenueLineData = useMemo(() => {
        return weeklyData.map(week => ({
            label: new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: week.revenue,
            color: '#10B981'
        }));
    }, [weeklyData]);

    const spendLineData = useMemo(() => {
        return weeklyData.map(week => ({
            label: new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: week.spend,
            color: '#3B82F6'
        }));
    }, [weeklyData]);

    const conversionsLineData = useMemo(() => {
        return weeklyData.map(week => ({
            label: new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: week.conversions,
            color: '#8B5CF6'
        }));
    }, [weeklyData]);

    const latestWeek = weeklyData[weeklyData.length - 1];
    const previousWeek = weeklyData[weeklyData.length - 2];

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-900">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading weekly data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
            <Navbar />

            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
                <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            {error ? (
                                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                                    Error loading data: {error}
                                </div>
                            ) : (
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                                    Weekly Performance
                                </h1>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
                    {marketingData && weeklyData.length > 0 && (
                        <>
                            {/* Weekly Overview Metrics */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <CardMetric
                                    title="Current Week Revenue"
                                    value={`$${latestWeek?.revenue.toLocaleString()}`}
                                    icon={<DollarSign className="h-5 w-5" />}
                                    trend={previousWeek ? {
                                        value: calculateGrowth(latestWeek.revenue, previousWeek.revenue),
                                        isPositive: latestWeek.revenue >= previousWeek.revenue
                                    } : undefined}
                                />

                                <CardMetric
                                    title="Current Week Spend"
                                    value={`$${latestWeek?.spend.toLocaleString()}`}
                                    icon={<TrendingUp className="h-5 w-5" />}
                                    trend={previousWeek ? {
                                        value: calculateGrowth(latestWeek.spend, previousWeek.spend),
                                        isPositive: latestWeek.spend <= previousWeek.spend
                                    } : undefined}
                                />

                                <CardMetric
                                    title="Current Week Conversions"
                                    value={latestWeek?.conversions.toLocaleString()}
                                    icon={<Users className="h-5 w-5" />}
                                    trend={previousWeek ? {
                                        value: calculateGrowth(latestWeek.conversions, previousWeek.conversions),
                                        isPositive: latestWeek.conversions >= previousWeek.conversions
                                    } : undefined}
                                />

                                <CardMetric
                                    title="Weekly ROAS"
                                    value={`${(latestWeek?.revenue / latestWeek?.spend).toFixed(1)}x`}
                                    icon={<Target className="h-5 w-5" />}
                                />
                            </div>

                            {/* Line Charts Section */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
                                    Weekly Trends
                                </h2>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
                                    {/* Revenue Trend Line Chart */}
                                    <LineChart
                                        title="Weekly Revenue Trend"
                                        data={revenueLineData}
                                        formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
                                        height={300}
                                        strokeWidth={3}
                                    />

                                    {/* Spend Trend Line Chart */}
                                    <LineChart
                                        title="Weekly Spend Trend"
                                        data={spendLineData}
                                        formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
                                        height={300}
                                        strokeWidth={3}
                                    />
                                </div>

                                {/* Additional Line Charts */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Conversions Trend Line Chart */}
                                    <LineChart
                                        title="Weekly Conversions Trend"
                                        data={conversionsLineData}
                                        formatValue={(value) => value.toLocaleString()}
                                        height={280}
                                        strokeWidth={2.5}
                                    />

                                    {/* Combined Revenue & Spend Trend */}
                                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">Revenue vs Spend Trend</h3>
                                        <div className="relative" style={{ height: '280px' }}>
                                            <svg
                                                width="100%"
                                                height="100%"
                                                viewBox="0 0 100 100"
                                                preserveAspectRatio="none"
                                                className="overflow-visible"
                                            >
                                                {/* Grid lines */}
                                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                                                    <line
                                                        key={index}
                                                        x1={8}
                                                        y1={8 + ratio * 84}
                                                        x2={92}
                                                        y2={8 + ratio * 84}
                                                        stroke="#374151"
                                                        strokeWidth="0.5"
                                                        strokeDasharray="1,2"
                                                    />
                                                ))}

                                                {/* Revenue Line */}
                                                <path
                                                    d={revenueLineData.map((point, index) =>
                                                        `${index === 0 ? 'M' : 'L'} ${8 + (index / (revenueLineData.length - 1)) * 84} ${8 + ((Math.max(...revenueLineData.map(p => p.value)) - point.value) / (Math.max(...revenueLineData.map(p => p.value)) - Math.min(...revenueLineData.map(p => p.value)))) * 84}`
                                                    ).join(' ')}
                                                    fill="none"
                                                    stroke="#10B981"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />

                                                {/* Spend Line */}
                                                <path
                                                    d={spendLineData.map((point, index) =>
                                                        `${index === 0 ? 'M' : 'L'} ${8 + (index / (spendLineData.length - 1)) * 84} ${8 + ((Math.max(...spendLineData.map(p => p.value)) - point.value) / (Math.max(...spendLineData.map(p => p.value)) - Math.min(...spendLineData.map(p => p.value)))) * 84}`
                                                    ).join(' ')}
                                                    fill="none"
                                                    stroke="#3B82F6"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />

                                                {/* Data points */}
                                                {revenueLineData.map((point, index) => (
                                                    <g key={`revenue-${index}`}>
                                                        <circle
                                                            cx={8 + (index / (revenueLineData.length - 1)) * 84}
                                                            cy={8 + ((Math.max(...revenueLineData.map(p => p.value)) - point.value) / (Math.max(...revenueLineData.map(p => p.value)) - Math.min(...revenueLineData.map(p => p.value)))) * 84}
                                                            r="1"
                                                            fill="#10B981"
                                                            stroke="#1F2937"
                                                            strokeWidth="0.3"
                                                        />
                                                    </g>
                                                ))}

                                                {spendLineData.map((point, index) => (
                                                    <g key={`spend-${index}`}>
                                                        <circle
                                                            cx={8 + (index / (spendLineData.length - 1)) * 84}
                                                            cy={8 + ((Math.max(...spendLineData.map(p => p.value)) - point.value) / (Math.max(...spendLineData.map(p => p.value)) - Math.min(...spendLineData.map(p => p.value)))) * 84}
                                                            r="1"
                                                            fill="#3B82F6"
                                                            stroke="#1F2937"
                                                            strokeWidth="0.3"
                                                        />
                                                    </g>
                                                ))}

                                                {/* X-axis labels */}
                                                {revenueLineData.map((point, index) => (
                                                    <text
                                                        key={index}
                                                        x={8 + (index / (revenueLineData.length - 1)) * 84}
                                                        y={96}
                                                        textAnchor="middle"
                                                        fontSize="2.5"
                                                        fill="#6B7280"
                                                        className="font-medium"
                                                    >
                                                        {point.label}
                                                    </text>
                                                ))}
                                            </svg>

                                            {/* Legend */}
                                            <div className="absolute top-2 right-4 flex flex-col space-y-1 text-xs">
                                                <div className="flex items-center space-x-2 text-green-400">
                                                    <div className="w-3 h-0.5 bg-green-400 rounded-full" />
                                                    <span>Revenue</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-blue-400">
                                                    <div className="w-3 h-0.5 bg-blue-400 rounded-full" />
                                                    <span>Spend</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bar Charts for Comparison */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {/* Impressions Trend */}
                                <BarChart
                                    title="Weekly Impressions"
                                    data={weeklyData.map(week => ({
                                        label: new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                        value: week.impressions,
                                        color: '#8B5CF6'
                                    }))}
                                    formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
                                />

                                {/* CTR Trend */}
                                <BarChart
                                    title="Weekly Click-Through Rate"
                                    data={weeklyData.map(week => ({
                                        label: new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                        value: week.impressions > 0 ? (week.clicks / week.impressions) * 100 : 0,
                                        color: '#F59E0B'
                                    }))}
                                    formatValue={(value) => `${value.toFixed(2)}%`}
                                />
                            </div>

                            {/* Performance Metrics Table */}
                            <Table
                                title="Weekly Performance Details"
                                showIndex={true}
                                maxHeight="400px"
                                columns={[
                                    {
                                        key: 'week_start',
                                        header: 'Week Start',
                                        width: '15%',
                                        sortable: true,
                                        sortType: 'date',
                                        render: (value) => new Date(value).toLocaleDateString()
                                    },
                                    {
                                        key: 'week_end',
                                        header: 'Week End',
                                        width: '15%',
                                        sortable: true,
                                        sortType: 'date',
                                        render: (value) => new Date(value).toLocaleDateString()
                                    },
                                    {
                                        key: 'impressions',
                                        header: 'Impressions',
                                        width: '12%',
                                        align: 'right',
                                        sortable: true,
                                        sortType: 'number',
                                        render: (value) => value.toLocaleString()
                                    },
                                    {
                                        key: 'clicks',
                                        header: 'Clicks',
                                        width: '10%',
                                        align: 'right',
                                        sortable: true,
                                        sortType: 'number',
                                        render: (value) => value.toLocaleString()
                                    },
                                    {
                                        key: 'conversions',
                                        header: 'Conversions',
                                        width: '12%',
                                        align: 'right',
                                        sortable: true,
                                        sortType: 'number',
                                        render: (value) => value.toLocaleString()
                                    },
                                    {
                                        key: 'spend',
                                        header: 'Spend',
                                        width: '12%',
                                        align: 'right',
                                        sortable: true,
                                        sortType: 'number',
                                        render: (value) => `$${value.toLocaleString()}`
                                    },
                                    {
                                        key: 'revenue',
                                        header: 'Revenue',
                                        width: '12%',
                                        align: 'right',
                                        sortable: true,
                                        sortType: 'number',
                                        render: (value) => `$${value.toLocaleString()}`
                                    },
                                    {
                                        key: 'roas',
                                        header: 'ROAS',
                                        width: '12%',
                                        align: 'right',
                                        sortable: true,
                                        sortType: 'number',
                                        render: (value, row) => {
                                            const roas = row.revenue / row.spend;
                                            return (
                                                <span className={`font-medium ${roas >= 3 ? 'text-green-400' : roas >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {roas.toFixed(1)}x
                                                </span>
                                            );
                                        }
                                    }
                                ]}
                                defaultSort={{ key: 'week_start', direction: 'desc' }}
                                data={weeklyData}
                                emptyMessage="No weekly performance data available"
                            />
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}