'use client';

import { useState, useEffect } from 'react';
import { getSession, getSessionTimeRemaining } from '@/lib/x402-session';

interface PaymentStatusBarProps {
  pageId: string;
  pageName: string;
}

export function PaymentStatusBar({ pageId, pageName }: PaymentStatusBarProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateTimeRemaining();

    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [pageId]);

  const updateTimeRemaining = () => {
    const remaining = getSessionTimeRemaining(pageId);
    setTimeRemaining(remaining);
  };

  if (!mounted || timeRemaining === 0) return null;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (timeRemaining < 5 * 60 * 1000) return 'text-red-600'; // Less than 5 minutes
    if (timeRemaining < 15 * 60 * 1000) return 'text-black'; // Neutral
    return 'text-black';
  };

  return (
    <div className="bg-white border-2 border-dashed border-black rounded-none px-4 py-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 animate-pulse" />
          <span className="text-sm font-medium text-black">
            {pageName} Access Active
          </span>
        </div>
        <div className={`text-sm ${getColorClass()}`}>
          Expires in {formatTime(timeRemaining)}
        </div>
      </div>
    </div>
  );
}

