'use client';

import { Section } from './page-utils';

const sampleTransactions = Array.from({ length: 6 }, (_, i) => ({
  signature: 'N/A',
  block: '0',
  time: 'N/A',
}));

export function TransactionsTable() {
  return (
    <Section
      title="Transactions"
      description="x402 requests made through known facilitators"
      href="/explorer"
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Signature</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Block</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                      {tx.signature}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{tx.block}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

