'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  href: string;
}

const tabs: Tab[] = [
  { label: 'Overview', href: '/explorer' },
  { label: 'Transactions', href: '/explorer/transactions' },
  { label: 'Facilitators', href: '/explorer/facilitators' },
  { label: 'Resources', href: '/explorer/resources' },
  { label: 'Ecosystem', href: '/explorer/ecosystem' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href === '/explorer' && pathname === '/explorer');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

