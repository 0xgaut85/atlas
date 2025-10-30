'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlitchText from './motion/GlitchText';

type ItemType = 'access' | 'learn' | 'visit';

interface NavItem {
  label: string;
  href: string;
  type: ItemType;
  external?: boolean;
  disabled?: boolean;
}

const items: NavItem[] = [
  { label: 'Atlas Workspace', href: '/workspace', type: 'access' },
  { label: 'Atlas Dashboard', href: '/workspace/atlas-dashboard', type: 'access' },
  { label: 'Atlas x402', href: '/workspace/atlas-x402', type: 'access' },
  { label: 'Atlas Foundry', href: '/workspace/atlas-foundry', type: 'access' },
  { label: 'Atlas Index', href: '/workspace/atlas-index', type: 'access' },
  { label: 'Atlas Mesh', href: '/workspace/atlas-mesh', type: 'access' },
  { label: 'Atlas Operator', href: '/workspace/atlas-operator', type: 'access' },
  { label: 'Atlas Explorer', href: '#', type: 'access', disabled: true },
  { label: 'Docs', href: '/docs', type: 'learn' },
  { label: 'CoinGecko', href: '#', type: 'visit', disabled: true },
  { label: 'CoinMarketCap', href: '#', type: 'visit', disabled: true },
  { label: 'Roadmap', href: '/roadmap', type: 'learn' },
  { label: 'GitHub', href: 'https://github.com/atlas402', type: 'visit', external: true },
  { label: 'Twitter', href: 'https://x.com/atlas402dotcom', type: 'visit', external: true },
  { label: 'Discord', href: '#', type: 'visit', external: true, disabled: true },
];

function TypeBadge({ type }: { type: ItemType }) {
  const label = type === 'access' ? 'Access' : type === 'learn' ? 'Learn' : 'Visit';
  return (
    <div className="text-xs text-gray-600">
      <GlitchText text={label} delay={0} replayOnView />
    </div>
  );
}

export default function NavbarVertical() {
  const [hovered, setHovered] = useState<string | null>(null);

  const renderGroup = (type: ItemType) => (
    <>
      {items.filter(i => i.type === type).map((it) => (
        <li key={it.label} className="relative"
            onMouseEnter={() => setHovered(it.label)}
            onMouseLeave={() => setHovered(null)}>
          {hovered === it.label && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18 }}
              className="absolute right-full mr-2 top-0 h-10 flex items-center bg-white border border-black rounded-md shadow-xl px-3 w-24 text-center pointer-events-none"
            >
              <TypeBadge type={it.type} />
            </motion.div>
          )}

          {it.disabled ? (
            <div className="w-56 h-10 px-3 bg-gray-200 text-gray-400 text-sm font-medium rounded-l-lg border border-gray-300 flex items-center whitespace-nowrap cursor-not-allowed">
              {it.label}
            </div>
          ) : it.external ? (
            <a
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-56 h-10 px-3 bg-white text-black text-sm font-medium rounded-l-lg border border-black hover:bg-gray-100 flex items-center whitespace-nowrap"
            >
              {it.label}
            </a>
          ) : (
            <Link
              href={it.href}
              className="w-56 h-10 px-3 bg-white text-black text-sm font-medium rounded-l-lg border border-black hover:bg-gray-100 flex items-center whitespace-nowrap"
            >
              {it.label}
            </Link>
          )}
        </li>
      ))}
    </>
  );

  return (
    <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-50 pr-2">
      <ul className="flex flex-col items-end gap-2">
        {renderGroup('access')}
        <li className="w-56"><div className="w-full h-px bg-red-600 my-2" /></li>
        {renderGroup('learn')}
        <li className="w-56"><div className="w-full h-px bg-red-600 my-2" /></li>
        {renderGroup('visit')}
      </ul>
    </div>
  );
}



