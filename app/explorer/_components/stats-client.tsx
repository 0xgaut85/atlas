'use client';

import { useState } from 'react';
import { StatsCard } from './stats-card';
import { SimpleChart } from './simple-chart';

interface StatsData {
  transactions: { value: string; change: number };
  volume: { value: string; change: number };
  buyers: { value: string; change: number };
  sellers: { value: string; change: number };
}

// Small mock data
const mockStats: StatsData = {
  transactions: { value: '47', change: 8.2 },
  volume: { value: '$23.50', change: 12.5 },
  buyers: { value: '12', change: 5.8 },
  sellers: { value: '5', change: 3.2 },
};

// Generate small hourly chart data
const generateChartData = (): number[] => {
  const data = Array(24).fill(0);
  // Simulate small activity peaks
  for (let i = 0; i < 24; i++) {
    let baseValue = 1;
    // Peak hours have slightly more activity
    if ((i >= 10 && i <= 14) || (i >= 18 && i <= 22)) {
      baseValue = 2 + Math.random() * 2;
    } else if (i >= 6 && i <= 9) {
      baseValue = 1 + Math.random() * 1;
    } else if (i >= 23 || i <= 5) {
      baseValue = 0 + Math.random() * 1;
    } else {
      baseValue = 1 + Math.random() * 1;
    }
    data[i] = Math.round(baseValue);
  }
  return data;
};

export function StatsDisplay() {
  const [stats] = useState<StatsData>(mockStats);
  const [chartData] = useState<number[]>(generateChartData());
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Transactions"
        value={stats.transactions.value}
        percentageChange={stats.transactions.change}
        chart={<SimpleChart data={chartData} />}
      />
      <StatsCard
        title="Volume"
        value={stats.volume.value}
        percentageChange={stats.volume.change}
        chart={<SimpleChart data={chartData} />}
      />
      <StatsCard
        title="Buyers"
        value={stats.buyers.value}
        percentageChange={stats.buyers.change}
        chart={<SimpleChart data={chartData} />}
      />
      <StatsCard
        title="Sellers"
        value={stats.sellers.value}
        percentageChange={stats.sellers.change}
        chart={<SimpleChart data={chartData} />}
      />
    </div>
  );
}

