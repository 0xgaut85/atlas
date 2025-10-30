import { ExplorerHeading } from './_components/heading';
import { Body } from './_components/page-utils';
import { StatsDisplay } from './_components/stats-client';
import { ServersTable } from './_components/servers-table';
import { TransactionsDisplay } from './_components/transactions-client';
import { Section } from './_components/page-utils';
import { Nav } from './_components/nav';

export default function ExplorerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <ExplorerHeading />
        <Nav />
      </div>

      {/* Main Content */}
      <Body>
        {/* Overall Stats */}
        <Section
          title="Overall Stats"
          description="Global statistics for the x402 ecosystem"
        >
          <StatsDisplay />
        </Section>

        {/* Top Servers */}
        <ServersTable />

        {/* Top Facilitators */}
        <Section
          title="Top Facilitators"
          description="Analytics on facilitators processing x402 transfers"
          href="/explorer/facilitators"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-500 text-sm">Coming Soon</p>
          </div>
        </Section>

        {/* Latest Transactions */}
        <TransactionsDisplay />

        {/* All Sellers */}
        <Section
          title="All Sellers"
          description="All addresses that have received x402 transfers"
          href="/explorer/resources"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-500 text-sm">Coming Soon</p>
          </div>
        </Section>
      </Body>
    </div>
  );
}
