'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  percentageChange?: number;
  chart?: React.ReactNode;
}

export function StatsCard({ title, value, percentageChange, chart }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {percentageChange !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono',
                  percentageChange > 0
                    ? 'bg-green-100 text-green-700'
                    : percentageChange === 0
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-red-100 text-red-600'
                )}
              >
                {percentageChange > 0 ? (
                  <TrendingUp className="size-3" />
                ) : percentageChange < 0 ? (
                  <TrendingDown className="size-3" />
                ) : null}
                <span>
                  {percentageChange >= 0 ? '+' : ''}
                  {percentageChange.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
        {chart && <div className="h-24">{chart}</div>}
      </div>
    </div>
  );
}

export function LoadingStatsCard({ title }: { title: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
        <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

