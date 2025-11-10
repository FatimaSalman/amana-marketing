// app/region-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '@/src/lib/api';
import { MarketingData, RegionalPerformance } from '@/src/types/marketing';
import { Navbar } from '@/src/components/ui/navbar';
import { Footer } from '@/src/components/ui/footer';
import { CardMetric } from '@/src/components/ui/card-metric';
import { BarChart } from '@/src/components/ui/bar-chart';
import { HeatMap } from '@/src/components/ui/heat-map';
import { Table } from '@/src/components/ui/table';
import { MapPin, DollarSign, TrendingUp, Users, Target, Globe, Filter } from 'lucide-react';

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'spend'>('revenue');

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

  // Aggregate regional performance data
  const regionalData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const regionMap: { [key: string]: RegionalPerformance } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.regional_performance?.forEach(region => {
        const regionKey = `${region.region}, ${region.country}`;
        if (!regionMap[regionKey]) {
          regionMap[regionKey] = { ...region };
        } else {
          regionMap[regionKey].impressions += region.impressions;
          regionMap[regionKey].clicks += region.clicks;
          regionMap[regionKey].conversions += region.conversions;
          regionMap[regionKey].spend += region.spend;
          regionMap[regionKey].revenue += region.revenue;
          // Recalculate aggregated metrics
          regionMap[regionKey].ctr = (regionMap[regionKey].clicks / regionMap[regionKey].impressions) * 100;
          regionMap[regionKey].conversion_rate = (regionMap[regionKey].conversions / regionMap[regionKey].clicks) * 100;
          regionMap[regionKey].cpc = regionMap[regionKey].spend / regionMap[regionKey].clicks;
          regionMap[regionKey].cpa = regionMap[regionKey].spend / regionMap[regionKey].conversions;
          regionMap[regionKey].roas = regionMap[regionKey].revenue / regionMap[regionKey].spend;
        }
      });
    });

    return Object.values(regionMap);
  }, [marketingData?.campaigns]);

  // Calculate totals for stats
  const totalRevenue = regionalData.reduce((sum, region) => sum + region.revenue, 0);
  const totalSpend = regionalData.reduce((sum, region) => sum + region.spend, 0);
  const totalRegions = regionalData.length;

  // Find top region by revenue
  const topRegion = regionalData.reduce((prev, current) =>
    (prev.revenue > current.revenue) ? prev : current,
    { revenue: 0, region: 'N/A' } as RegionalPerformance
  );

  // Top performing regions
  const topRegions = useMemo(() => {
    return regionalData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [regionalData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading regional data...</div>
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
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Regional Performance
                  </h1>
                  <div className="bg-blue-600 text-white inline-block px-4 py-2 rounded-full font-semibold text-sm">
                    TOTAL REGIONS {totalRegions}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && regionalData.length > 0 && (
            <>
              {/* Regional Overview Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <CardMetric
                  title="TOTAL REGIONS"
                  value={totalRegions}
                  icon={<Globe className="h-5 w-5" />}
                />

                <CardMetric
                  title="TOTAL REVENUE"
                  value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />

                <CardMetric
                  title="TOTAL SPEND"
                  value={`$${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />

                <CardMetric
                  title="TOP REGION"
                  value={topRegion.region}
                  icon={<Target className="h-5 w-5" />}
                />
              </div>

              {/* Heat Map Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                    {selectedMetric === 'revenue' ? 'Revenue by Region' : 'Spend by Region'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value as 'revenue' | 'spend')}
                      className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="revenue">Show Revenue</option>
                      <option value="spend">Show Spend</option>
                    </select>
                  </div>
                </div>

                <HeatMap
                  data={regionalData}
                  metric={selectedMetric}
                  height={500}
                />
              </div>

              {/* Top Performing Regions */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Revenue by Region */}
                <BarChart
                  title="Top Regions by Revenue"
                  data={topRegions.map(region => ({
                    label: region.region,
                    value: region.revenue,
                    color: region.roas > 50 ? '#10B981' :
                      region.roas > 20 ? '#3B82F6' :
                        '#F59E0B'
                  }))}
                  formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
                />

                {/* ROAS by Region */}
                <BarChart
                  title="Regional ROAS Performance"
                  data={topRegions.map(region => ({
                    label: region.region,
                    value: region.roas,
                    color: region.roas > 50 ? '#10B981' :
                      region.roas > 20 ? '#3B82F6' :
                        '#F59E0B'
                  }))}
                  formatValue={(value) => `${value.toFixed(1)}x`}
                />
              </div>

              {/* Regional Performance Details */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Conversions by Region */}
                <BarChart
                  title="Regional Conversions"
                  data={topRegions.map(region => ({
                    label: region.region,
                    value: region.conversions,
                    color: '#8B5CF6'
                  }))}
                  formatValue={(value) => value.toLocaleString()}
                />

                {/* CTR by Region */}
                <BarChart
                  title="Regional Click-Through Rates"
                  data={topRegions.map(region => ({
                    label: region.region,
                    value: region.ctr,
                    color: '#EC4899'
                  }))}
                  formatValue={(value) => `${value.toFixed(2)}%`}
                />
              </div>

              {/* Regional Performance Table */}
              <Table
                title="Detailed Regional Performance"
                showIndex={true}
                maxHeight="400px"
                columns={[
                  {
                    key: 'region',
                    header: 'Region',
                    width: '20%',
                    sortable: true,
                    sortType: 'string',
                    render: (value, row) => (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-white">
                          {value}, {row.country}
                        </span>
                      </div>
                    )
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
                    key: 'ctr',
                    header: 'CTR',
                    width: '10%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
                    render: (value) => `${value.toFixed(2)}%`
                  },
                  {
                    key: 'roas',
                    header: 'ROAS',
                    width: '12%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
                    render: (value) => (
                      <span className={`font-medium ${value > 50 ? 'text-green-400' :
                        value > 20 ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                        {value.toFixed(1)}x
                      </span>
                    )
                  }
                ]}
                defaultSort={{ key: 'revenue', direction: 'desc' }}
                data={regionalData}
                emptyMessage="No regional performance data available"
              />
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}