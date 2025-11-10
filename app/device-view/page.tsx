// app/device-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '@/src/lib/api';
import { MarketingData, DevicePerformance } from '@/src/types/marketing';
import { Navbar } from '@/src/components/ui/navbar';
import { Footer } from '@/src/components/ui/footer';
import { CardMetric } from '@/src/components/ui/card-metric';
import { BarChart } from '@/src/components/ui/bar-chart';
import { Table } from '@/src/components/ui/table';
import { Smartphone, Monitor, TrendingUp, Users, DollarSign, Target, Zap } from 'lucide-react';

export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
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

  // Aggregate device performance data from all campaigns
  const devicePerformanceData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const deviceMap = new Map<string, DevicePerformance>();

    marketingData.campaigns.forEach(campaign => {
      campaign.device_performance.forEach(devicePerf => {
        const existing = deviceMap.get(devicePerf.device);
        
        if (existing) {
          // Sum up all metrics
          existing.impressions += devicePerf.impressions;
          existing.clicks += devicePerf.clicks;
          existing.conversions += devicePerf.conversions;
          existing.spend += devicePerf.spend;
          existing.revenue += devicePerf.revenue;
          existing.percentage_of_traffic += devicePerf.percentage_of_traffic;
        } else {
          deviceMap.set(devicePerf.device, { ...devicePerf });
        }
      });
    });

    // Calculate derived metrics
    const result = Array.from(deviceMap.values()).map(device => ({
      ...device,
      ctr: (device.clicks / device.impressions) * 100,
      conversion_rate: (device.conversions / device.clicks) * 100,
    }));

    return result;
  }, [marketingData?.campaigns]);

  // Get specific device data
  const mobileData = useMemo(() => 
    devicePerformanceData.find(d => d.device === 'Mobile'), 
    [devicePerformanceData]
  );
  
  const desktopData = useMemo(() => 
    devicePerformanceData.find(d => d.device === 'Desktop'), 
    [devicePerformanceData]
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading device performance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Device Performance
                </h1>
              )}
              <p className="text-gray-300 mt-2 text-sm sm:text-base">
                Compare marketing campaign performance across Mobile and Desktop devices
              </p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && devicePerformanceData.length > 0 && (
            <>
              {/* Device Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <CardMetric
                  title="Mobile Revenue"
                  value={`$${mobileData?.revenue.toLocaleString() || '0'}`}
                  icon={<Smartphone className="h-5 w-5" />}
                  className="text-green-400"
                />
                
                <CardMetric
                  title="Desktop Revenue"
                  value={`$${desktopData?.revenue.toLocaleString() || '0'}`}
                  icon={<Monitor className="h-5 w-5" />}
                  className="text-blue-400"
                />
                
                <CardMetric
                  title="Mobile Conversions"
                  value={mobileData?.conversions || 0}
                  icon={<Users className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Desktop Conversions"
                  value={desktopData?.conversions || 0}
                  icon={<Target className="h-5 w-5" />}
                />
              </div>

              {/* Performance Comparison Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Revenue Comparison */}
                <BarChart
                  title="Revenue by Device"
                  data={[
                    {
                      label: 'Mobile',
                      value: mobileData?.revenue || 0,
                      color: '#10B981'
                    },
                    {
                      label: 'Desktop', 
                      value: desktopData?.revenue || 0,
                      color: '#3B82F6'
                    }
                  ]}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                {/* Conversion Rate Comparison */}
                <BarChart
                  title="Conversion Rates by Device"
                  data={[
                    {
                      label: 'Mobile',
                      value: mobileData?.conversion_rate || 0,
                      color: '#F59E0B'
                    },
                    {
                      label: 'Desktop',
                      value: desktopData?.conversion_rate || 0,
                      color: '#EF4444'
                    }
                  ]}
                  formatValue={(value) => `${value.toFixed(2)}%`}
                />
              </div>

              {/* Traffic and CTR Comparison */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Traffic Share */}
                <BarChart
                  title="Traffic Distribution"
                  data={[
                    {
                      label: 'Mobile',
                      value: mobileData?.percentage_of_traffic || 0,
                      color: '#8B5CF6'
                    },
                    {
                      label: 'Desktop',
                      value: desktopData?.percentage_of_traffic || 0,
                      color: '#06B6D4'
                    }
                  ]}
                  formatValue={(value) => `${value.toFixed(1)}%`}
                />

                {/* CTR Comparison */}
                <BarChart
                  title="Click-Through Rates (CTR)"
                  data={[
                    {
                      label: 'Mobile',
                      value: mobileData?.ctr || 0,
                      color: '#84CC16'
                    },
                    {
                      label: 'Desktop',
                      value: desktopData?.ctr || 0,
                      color: '#F97316'
                    }
                  ]}
                  formatValue={(value) => `${value.toFixed(2)}%`}
                />
              </div>

              {/* Detailed Device Performance Table */}
              <div className="overflow-x-auto w-full max-w-full">
                <Table
                  title="Device Performance Details"
                  showIndex={true}
                  maxHeight="400px"
                  columns={[
                    {
                      key: 'device',
                      header: 'Device',
                      width: '15%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <div className="flex items-center">
                          {value === 'Mobile' ? (
                            <Smartphone className="h-4 w-4 mr-2 text-green-400" />
                          ) : (
                            <Monitor className="h-4 w-4 mr-2 text-blue-400" />
                          )}
                          <span className="font-medium text-white">{value}</span>
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
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          ${value.toLocaleString()}
                        </span>
                      )
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
                      key: 'conversion_rate',
                      header: 'Conv. Rate',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'percentage_of_traffic',
                      header: 'Traffic Share',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(1)}%`
                    }
                  ]}
                  defaultSort={{ key: 'revenue', direction: 'desc' }}
                  data={devicePerformanceData}
                  emptyMessage="No device performance data available"
                />
              </div>

              {/* Performance Insights */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                    Mobile Performance Insights
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• {mobileData?.percentage_of_traffic.toFixed(1)}% of total traffic</p>
                    <p>• ${mobileData?.revenue.toLocaleString()} total revenue</p>
                    <p>• {mobileData?.conversion_rate.toFixed(2)}% conversion rate</p>
                    <p>• {mobileData?.ctr.toFixed(2)}% click-through rate</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                    Desktop Performance Insights
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• {desktopData?.percentage_of_traffic.toFixed(1)}% of total traffic</p>
                    <p>• ${desktopData?.revenue.toLocaleString()} total revenue</p>
                    <p>• {desktopData?.conversion_rate.toFixed(2)}% conversion rate</p>
                    <p>• {desktopData?.ctr.toFixed(2)}% click-through rate</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}