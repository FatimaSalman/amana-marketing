// app/demographic-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '@/src/lib/api';
import { MarketingData, DemographicBreakdown } from '@/src/types/marketing';
import { Navbar } from '@/src/components/ui/navbar';
import { Footer } from '@/src/components/ui/footer';
import { CardMetric } from '@/src/components/ui/card-metric';
import { BarChart } from '@/src/components/ui/bar-chart';
import { Table } from '@/src/components/ui/table';
import { Users, UserCheck, DollarSign, TrendingUp, Target, Circle } from 'lucide-react';

export default function DemographicView() {
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

    // Aggregate demographic data by gender and age group
    const demographicData = useMemo(() => {
        if (!marketingData?.campaigns) return { male: {}, female: {} };

        const maleData: { [key: string]: { clicks: number; spend: number; revenue: number; impressions: number; conversions: number } } = {};
        const femaleData: { [key: string]: { clicks: number; spend: number; revenue: number; impressions: number; conversions: number } } = {};

        marketingData.campaigns.forEach(campaign => {
            campaign.demographic_breakdown?.forEach(demo => {
                // Calculate spend and revenue allocation based on percentage_of_audience
                const spendAllocation = campaign.spend * (demo.percentage_of_audience / 100);
                const revenueAllocation = campaign.revenue * (demo.percentage_of_audience / 100);

                if (demo.gender === 'Male') {
                    if (!maleData[demo.age_group]) {
                        maleData[demo.age_group] = { clicks: 0, spend: 0, revenue: 0, impressions: 0, conversions: 0 };
                    }
                    maleData[demo.age_group].clicks += demo.performance.clicks;
                    maleData[demo.age_group].spend += spendAllocation;
                    maleData[demo.age_group].revenue += revenueAllocation;
                    maleData[demo.age_group].impressions += demo.performance.impressions;
                    maleData[demo.age_group].conversions += demo.performance.conversions;
                } else if (demo.gender === 'Female') {
                    if (!femaleData[demo.age_group]) {
                        femaleData[demo.age_group] = { clicks: 0, spend: 0, revenue: 0, impressions: 0, conversions: 0 };
                    }
                    femaleData[demo.age_group].clicks += demo.performance.clicks;
                    femaleData[demo.age_group].spend += spendAllocation;
                    femaleData[demo.age_group].revenue += revenueAllocation;
                    femaleData[demo.age_group].impressions += demo.performance.impressions;
                    femaleData[demo.age_group].conversions += demo.performance.conversions;
                }
            });
        });

        return { male: maleData, female: femaleData };
    }, [marketingData?.campaigns]);

    // Calculate total metrics for cards
    const maleTotals = useMemo(() => {
        const totals = { clicks: 0, spend: 0, revenue: 0 };
        Object.values(demographicData.male).forEach(data => {
            totals.clicks += data.clicks;
            totals.spend += data.spend;
            totals.revenue += data.revenue;
        });
        return totals;
    }, [demographicData.male]);

    const femaleTotals = useMemo(() => {
        const totals = { clicks: 0, spend: 0, revenue: 0 };
        Object.values(demographicData.female).forEach(data => {
            totals.clicks += data.clicks;
            totals.spend += data.spend;
            totals.revenue += data.revenue;
        });
        return totals;
    }, [demographicData.female]);

    // Prepare data for bar charts
    const ageGroupSpendData = useMemo(() => {
        const allAgeGroups = new Set([
            ...Object.keys(demographicData.male),
            ...Object.keys(demographicData.female)
        ]);

        return Array.from(allAgeGroups).map(ageGroup => ({
            label: ageGroup,
            value: (demographicData.male[ageGroup]?.spend || 0) + (demographicData.female[ageGroup]?.spend || 0),
            color: ageGroup.includes('18-24') ? '#3B82F6' :
                ageGroup.includes('25-34') ? '#10B981' :
                    ageGroup.includes('35-44') ? '#F59E0B' :
                        ageGroup.includes('45-54') ? '#EF4444' : '#8B5CF6'
        }));
    }, [demographicData]);

    const ageGroupRevenueData = useMemo(() => {
        const allAgeGroups = new Set([
            ...Object.keys(demographicData.male),
            ...Object.keys(demographicData.female)
        ]);

        return Array.from(allAgeGroups).map(ageGroup => ({
            label: ageGroup,
            value: (demographicData.male[ageGroup]?.revenue || 0) + (demographicData.female[ageGroup]?.revenue || 0),
            color: ageGroup.includes('18-24') ? '#3B82F6' :
                ageGroup.includes('25-34') ? '#10B981' :
                    ageGroup.includes('35-44') ? '#F59E0B' :
                        ageGroup.includes('45-54') ? '#EF4444' : '#8B5CF6'
        }));
    }, [demographicData]);

    // Prepare table data for male and female age groups
    const maleTableData = useMemo(() => {
        return Object.entries(demographicData.male).map(([ageGroup, data]) => {
            const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
            const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;

            return {
                age_group: ageGroup,
                impressions: data.impressions,
                clicks: data.clicks,
                conversions: data.conversions,
                ctr: ctr,
                conversion_rate: conversionRate
            };
        });
    }, [demographicData.male]);

    const femaleTableData = useMemo(() => {
        return Object.entries(demographicData.female).map(([ageGroup, data]) => {
            const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
            const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;

            return {
                age_group: ageGroup,
                impressions: data.impressions,
                clicks: data.clicks,
                conversions: data.conversions,
                ctr: ctr,
                conversion_rate: conversionRate
            };
        });
    }, [demographicData.female]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-900">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading demographic data...</div>
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
                                    Demographic Insights
                                </h1>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
                    {marketingData && (
                        <>
                            {/* Male Metrics Cards */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Circle className="h-5 w-5 text-blue-400 mr-2" />
                                    Male Audience Performance
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <CardMetric
                                        title="Total Clicks by Males"
                                        value={maleTotals.clicks.toLocaleString()}
                                        icon={<UserCheck className="h-5 w-5" />}
                                        className="border-l-4 border-blue-500"
                                    />

                                    <CardMetric
                                        title="Total Spend by Males"
                                        value={`$${maleTotals.spend.toLocaleString()}`}
                                        icon={<DollarSign className="h-5 w-5" />}
                                        className="border-l-4 border-blue-500"
                                    />

                                    <CardMetric
                                        title="Total Revenue by Males"
                                        value={`$${maleTotals.revenue.toLocaleString()}`}
                                        icon={<TrendingUp className="h-5 w-5" />}
                                        className="border-l-4 border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Female Metrics Cards */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Circle className="h-5 w-5 text-pink-400 mr-2" />
                                    Female Audience Performance
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <CardMetric
                                        title="Total Clicks by Females"
                                        value={femaleTotals.clicks.toLocaleString()}
                                        icon={<UserCheck className="h-5 w-5" />}
                                        className="border-l-4 border-pink-500"
                                    />

                                    <CardMetric
                                        title="Total Spend by Females"
                                        value={`$${femaleTotals.spend.toLocaleString()}`}
                                        icon={<DollarSign className="h-5 w-5" />}
                                        className="border-l-4 border-pink-500"
                                    />

                                    <CardMetric
                                        title="Total Revenue by Females"
                                        value={`$${femaleTotals.revenue.toLocaleString()}`}
                                        icon={<TrendingUp className="h-5 w-5" />}
                                        className="border-l-4 border-pink-500"
                                    />
                                </div>
                            </div>

                            {/* Age Group Performance Charts */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {/* Total Spend by Age Group */}
                                <BarChart
                                    title="Total Spend by Age Group"
                                    data={ageGroupSpendData}
                                    formatValue={(value) => `$${(value / 1000).toFixed(1)}K`}
                                    height={350}
                                />

                                {/* Total Revenue by Age Group */}
                                <BarChart
                                    title="Total Revenue by Age Group"
                                    data={ageGroupRevenueData}
                                    formatValue={(value) => `$${(value / 1000).toFixed(1)}K`}
                                    height={350}
                                />
                            </div>

                            {/* Male Age Group Performance Table */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Circle className="h-5 w-5 text-blue-400 mr-2" />
                                    Campaign Performance by Male Age Groups
                                </h2>
                                <Table
                                    showIndex={true}
                                    maxHeight="400px"
                                    columns={[
                                        {
                                            key: 'age_group',
                                            header: 'Age Group',
                                            width: '15%',
                                            sortable: true,
                                            sortType: 'string'
                                        },
                                        {
                                            key: 'impressions',
                                            header: 'Impressions',
                                            width: '15%',
                                            align: 'right',
                                            sortable: true,
                                            sortType: 'number',
                                            render: (value) => value.toLocaleString()
                                        },
                                        {
                                            key: 'clicks',
                                            header: 'Clicks',
                                            width: '12%',
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
                                            key: 'ctr',
                                            header: 'CTR',
                                            width: '12%',
                                            align: 'right',
                                            sortable: true,
                                            sortType: 'number',
                                            render: (value) => `${value.toFixed(2)}%`
                                        },
                                        {
                                            key: 'conversion_rate',
                                            header: 'Conversion Rate',
                                            width: '15%',
                                            align: 'right',
                                            sortable: true,
                                            sortType: 'number',
                                            render: (value) => `${value.toFixed(2)}%`
                                        }
                                    ]}
                                    defaultSort={{ key: 'conversions', direction: 'desc' }}
                                    data={maleTableData}
                                    emptyMessage="No male demographic data available"
                                />
                            </div>

                            {/* Female Age Group Performance Table */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Circle className="h-5 w-5 text-pink-400 mr-2" />
                                    Campaign Performance by Female Age Groups
                                </h2>
                                <Table
                                    showIndex={true}
                                    maxHeight="400px"
                                    columns={[
                                        {
                                            key: 'age_group',
                                            header: 'Age Group',
                                            width: '15%',
                                            sortable: true,
                                            sortType: 'string'
                                        },
                                        {
                                            key: 'impressions',
                                            header: 'Impressions',
                                            width: '15%',
                                            align: 'right',
                                            sortable: true,
                                            sortType: 'number',
                                            render: (value) => value.toLocaleString()
                                        },
                                        {
                                            key: 'clicks',
                                            header: 'Clicks',
                                            width: '12%',
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
                                            key: 'ctr',
                                            header: 'CTR',
                                            width: '12%',
                                            align: 'right',
                                            sortable: true,
                                            sortType: 'number',
                                            render: (value) => `${value.toFixed(2)}%`
                                        },
                                        {
                                            key: 'conversion_rate',
                                            header: 'Conversion Rate',
                                            width: '15%',
                                            align: 'right',
                                            sortable: true,
                                            sortType: 'number',
                                            render: (value) => `${value.toFixed(2)}%`
                                        }
                                    ]}
                                    defaultSort={{ key: 'conversions', direction: 'desc' }}
                                    data={femaleTableData}
                                    emptyMessage="No female demographic data available"
                                />
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <CardMetric
                                    title="Total Male Clicks"
                                    value={maleTotals.clicks.toLocaleString()}
                                    icon={<Circle className="h-5 w-5 text-blue-400" />}
                                />

                                <CardMetric
                                    title="Total Female Clicks"
                                    value={femaleTotals.clicks.toLocaleString()}
                                    icon={<Circle className="h-5 w-5 text-pink-400" />}
                                />

                                <CardMetric
                                    title="Male/Female Click Ratio"
                                    value={maleTotals.clicks > 0 ? ((femaleTotals.clicks / maleTotals.clicks) * 100).toFixed(1) + '%' : 'N/A'}
                                    icon={<Users className="h-5 w-5" />}
                                />

                                <CardMetric
                                    title="Total Audience"
                                    value={(maleTotals.clicks + femaleTotals.clicks).toLocaleString()}
                                    icon={<Target className="h-5 w-5" />}
                                />
                            </div>
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}