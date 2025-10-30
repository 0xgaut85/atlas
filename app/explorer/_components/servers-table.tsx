'use client';

import Image from 'next/image';
import { Section } from './page-utils';

interface Server {
  name: string;
  addresses: string;
  txns: string;
  volume: string;
  buyers: string;
  latest: string;
  facilitator: string;
  activity: 'high' | 'medium' | 'low';
}

const sampleServers: Server[] = [
  { 
    name: 'atlas-index', 
    addresses: '2 addresses',
    txns: '12', 
    volume: '$5.25', 
    buyers: '8',
    latest: '15m ago',
    facilitator: 'PayAi',
    activity: 'high'
  },
  { 
    name: 'atlas-operator', 
    addresses: '1 address',
    txns: '8', 
    volume: '$3.50', 
    buyers: '5',
    latest: '42m ago',
    facilitator: 'Coinbase',
    activity: 'high'
  },
  { 
    name: 'atlas-mesh', 
    addresses: '3 addresses',
    txns: '6', 
    volume: '$4.20', 
    buyers: '4',
    latest: '2h ago',
    facilitator: 'Thirdweb',
    activity: 'medium'
  },
  { 
    name: 'atlas-foundry', 
    addresses: '1 address',
    txns: '4', 
    volume: '$2.10', 
    buyers: '3',
    latest: '3h ago',
    facilitator: 'PayAi',
    activity: 'medium'
  },
  { 
    name: 'api.atlas402.com', 
    addresses: '5 addresses',
    txns: '15', 
    volume: '$8.75', 
    buyers: '10',
    latest: '8m ago',
    facilitator: 'Coinbase',
    activity: 'high'
  },
  { 
    name: 'services.atlas402.io', 
    addresses: '2 addresses',
    txns: '10', 
    volume: '$6.30', 
    buyers: '7',
    latest: '1h ago',
    facilitator: 'Thirdweb',
    activity: 'high'
  },
];

export function ServersTable() {
  return (
    <Section
      title="Top Servers"
      description="Top addresses that have received x402 transfers and are listed in the Bazaar"
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Server</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Txns</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Volume</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyers</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Latest</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Facilitator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleServers.map((server, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Image 
                        src="/logo.jpg" 
                        alt="Atlas402" 
                        width={32}
                        height={32}
                        className="rounded-lg object-contain"
                      />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{server.name}</div>
                        <div className="text-xs text-gray-500">{server.addresses}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-24 h-8">
                      {server.activity === 'high' && (
                        <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
                          <path d="M0 28 L20 28 L25 8 L30 28 L40 28 L50 4 L60 28 L70 28 L80 12 L96 28" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                        </svg>
                      )}
                      {server.activity === 'medium' && (
                        <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
                          <path d="M0 24 L20 20 L40 18 L48 12 L56 16 L70 20 L96 24" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                        </svg>
                      )}
                      {server.activity === 'low' && (
                        <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
                          <path d="M0 28 L96 28" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{server.txns}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{server.volume}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{server.buyers}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{server.latest}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Image 
                        src="/logo.jpg" 
                        alt="Facilitator" 
                        width={20}
                        height={20}
                        className="rounded-md object-contain"
                      />
                      <span className="text-sm text-gray-900 font-medium">{server.facilitator}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

