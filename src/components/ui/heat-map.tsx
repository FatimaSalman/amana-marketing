// src/components/ui/bubble-map.tsx
"use client";
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { RegionalPerformance } from '@/src/types/marketing';
import { cityCoordinates } from '@/src/utils/cityCoordinates';
import 'leaflet/dist/leaflet.css';

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
        <h3 className="text-lg font-semibold text-white mb-4">Regional Performance Map</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No regional data available
        </div>
      </div>
    );
  }

  // Function to determine bubble color based on ROAS performance
  const getColor = (roas: number): string => {
    return roas > 80 ? '#10B981' :   // High performance - Green
           roas > 50 ? '#3B82F6' :   // Medium performance - Blue
                       '#EF4444';    // Low performance - Red
  };

  // Function to determine bubble size based on metric value
  const getRadius = (value: number, maxValue: number): number => {
    const minRadius = 10000; // 10km minimum radius
    const maxRadius = 200000; // 200km maximum radius
    
    // Normalize the value and scale to radius range
    return minRadius + (value / maxValue) * (maxRadius - minRadius);
  };

  // Filter and map data to include coordinates
  const mappedData = data
    .map(item => {
      const coords = cityCoordinates[item.region];
      if (!coords) return null;
      
      return {
        ...item,
        coordinates: coords
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (mappedData.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Regional Performance Map</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No cities with coordinate data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...mappedData.map(item => item[metric]));

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Regional {metric === 'revenue' ? 'Revenue' : 'Spend'} Heat Map
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Bubble size represents {metric === 'revenue' ? 'revenue' : 'spend'} amount. Color indicates ROAS performance.
        </p>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative">
        <MapContainer 
          center={[30, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {mappedData.map((item, index) => (
            <Circle
              key={index}
              center={[item.coordinates.lat, item.coordinates.lng]}
              radius={getRadius(item[metric], maxValue)}
              pathOptions={{
                fillColor: getColor(item.roas),
                color: getColor(item.roas),
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">
                    {item.region}, {item.country}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium text-green-600">
                        ${item.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spend:</span>
                      <span className="font-medium text-blue-600">
                        ${item.spend.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <span className="font-medium">
                        {item.impressions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversions:</span>
                      <span className="font-medium">
                        {item.conversions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CTR:</span>
                      <span className="font-medium">
                        {item.ctr.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROAS:</span>
                      <span className={`font-medium ${
                        item.roas > 80 ? 'text-green-600' : 
                        item.roas > 50 ? 'text-blue-600' : 
                        'text-red-600'
                      }`}>
                        {item.roas.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">ROAS Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-700">High (ROAS &gt; 80)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-700">Medium (ROAS 50-80)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-700">Low (ROAS &lt; 50)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Bubble size represents {metric === 'revenue' ? 'revenue' : 'spend'} amount
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}