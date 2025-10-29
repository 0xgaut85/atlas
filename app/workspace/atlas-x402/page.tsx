'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ManageWallet } from '../../components/ManageWallet';

type KPI = {
  totals: { base: number; solana: number; combined: number };
  categories: { access: number; registration: number; mint: number; service: number; other: number };
  balances: { baseUSDC: string; solUSDC: string };
  stats?: {
    uniqueUsers: number;
    servicesAdded: number;
    since: string;
    sampleSize: number;
  };
};

type TxRow = {
  network: string;
  time: number;
  user: string;
  amount: number;
  category: string;
  explorer: string;
  service?: string;
  metadata?: Record<string, any>;
};
type DayPoint = { day: string; revenue: number; revenueBase: number; revenueSol: number; txCount: number; users: number };
type UserRow = { address: string; txCount: number; total: number; firstSeen: number; lastSeen: number; networks?: string[] };

export default function AtlasX402Page() {
  const [days, setDays] = useState(1);
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'overview'|'transactions'|'users'|'services'>('overview');
  const [services, setServices] = useState<any[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [rev, tx, us, act, srv] = await Promise.all([
        fetch(`/api/admin/x402/revenue?days=${days}`).then(r=>r.json()),
        fetch(`/api/admin/x402/txs?days=${days}`).then(r=>r.json()),
        fetch(`/api/admin/x402/users?days=${days}`).then(r=>r.json()),
        fetch(`/api/admin/x402/activity?days=${days}`).then(r=>r.json()),
        fetch(`/api/admin/x402/services`).then(r=>r.json()),
      ]);
      if (rev.success) setKpi(rev.data);
      if (tx.success) setTxs(tx.data);
      if (us.success) setUsers(us.data);
      if (act.success) setSeries(act.data);
      if (srv.success) setServices(srv.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [days]);

  const exportCSV = (rows: any[], filename: string) => {
    const cols = Object.keys(rows[0] || {});
    const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => JSON.stringify((r as any)[c] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-20">
      {/* Back */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50 flex gap-3">
        <Link href="/" className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg">
          <span className="text-sm sm:text-base font-medium">Back</span>
          <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">↩</span>
        </Link>
        <ManageWallet />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold font-title">Atlas <span className="text-red-600">x402</span></h1>
          <p className="text-gray-600 mt-3">Protocol revenue and usage across Base and Solana.</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-gray-600">Range</label>
          <select value={days} onChange={e=>setDays(parseInt(e.target.value))} className="px-3 py-2 border-2 border-black bg-white">
            <option value={1}>24h</option>
            <option value={7}>7d</option>
            <option value={30}>30d</option>
          </select>
          <button onClick={refresh} disabled={loading} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-all border-2 border-black">{loading?'Refreshing...':'Refresh'}</button>
        </div>

        {/* KPIs */}
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 border-2 border-black bg-white">
            <div className="text-xs text-gray-500 mb-1">Total Revenue</div>
            <div className="text-3xl font-title font-bold">${kpi?.totals.combined?.toFixed(2) ?? '—'} USDC</div>
          </div>
          <div className="p-5 border-2 border-black bg-white">
            <div className="text-xs text-gray-500 mb-1">Base USDC</div>
            <div className="text-3xl font-title font-bold">${kpi?.totals.base?.toFixed(2) ?? '—'}</div>
          </div>
          <div className="p-5 border-2 border-black bg-white">
            <div className="text-xs text-gray-500 mb-1">Solana USDC</div>
            <div className="text-3xl font-title font-bold">${kpi?.totals.solana?.toFixed(2) ?? '—'}</div>
          </div>
          <div className="p-5 border-2 border-black bg-white">
            <div className="text-xs text-gray-500 mb-1">Live Balances</div>
            <div className="text-sm">Base: {kpi?.balances.baseUSDC ?? '—'} USDC</div>
            <div className="text-sm">Sol: {kpi?.balances.solUSDC ?? '—'} USDC</div>
          </div>
        </div>

        {kpi?.stats && (
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-5 border-2 border-black bg-white">
              <div className="text-xs text-gray-500 mb-1">Unique Users</div>
              <div className="text-3xl font-title font-bold">{kpi.stats.uniqueUsers}</div>
              <div className="text-xs text-gray-500 mt-1">since {kpi.stats.since ? new Date(kpi.stats.since).toLocaleDateString() : '—'}</div>
            </div>
            <div className="p-5 border-2 border-black bg-white">
              <div className="text-xs text-gray-500 mb-1">Services Added</div>
              <div className="text-3xl font-title font-bold">{kpi.stats.servicesAdded}</div>
            </div>
            <div className="p-5 border-2 border-black bg-white">
              <div className="text-xs text-gray-500 mb-1">Transactions Sampled</div>
              <div className="text-3xl font-title font-bold">{kpi.stats.sampleSize}</div>
              <div className="text-xs text-gray-500 mt-1">across Base & Solana</div>
            </div>
            <div className="p-5 border-2 border-black bg-white">
              <div className="text-xs text-gray-500 mb-1">Top Category</div>
              {(() => {
                if (!kpi) return <div className="text-lg">—</div>;
                const entries = Object.entries(kpi.categories || {});
                if (!entries.length) return <div className="text-lg">—</div>;
                const top = entries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc));
                return (
                  <>
                    <div className="text-2xl font-title capitalize">{top[0]}</div>
                    <div className="text-sm text-gray-500">${top[1].toFixed(2)} USDC</div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 mb-6 flex gap-8">
          {(['overview','transactions','users','services'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`py-4 font-title ${tab===t?'text-black border-b-2 border-red-600':'text-gray-400 hover:text-black'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        {tab==='overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue over time (simple bars) */}
            <div className="p-6 border-2 border-dashed border-black bg-white">
              <h3 className="font-title font-bold text-xl mb-3">Revenue (last {days}d)</h3>
              <div className="h-48 flex items-end gap-1">
                {series.map((p,i)=>{
                  const max = Math.max(1, ...series.map(s=>s.revenue));
                  const h = Math.max(2, Math.round((p.revenue/max)*160));
                  return <div key={i} title={`${p.day}: $${p.revenue.toFixed(2)}`} className="bg-red-600" style={{width:8,height:h}} />
                })}
                {series.length===0 && <div className="text-gray-500 text-sm">No data.</div>}
              </div>
            </div>
            {/* Users over time */}
            <div className="p-6 border-2 border-dashed border-black bg-white">
              <h3 className="font-title font-bold text-xl mb-3">Users (last {days}d)</h3>
              <div className="h-48 flex items-end gap-1">
                {series.map((p,i)=>{
                  const max = Math.max(1, ...series.map(s=>s.users));
                  const h = Math.max(2, Math.round((p.users/max)*160));
                  return <div key={i} title={`${p.day}: ${p.users}`} className="bg-black" style={{width:8,height:h}} />
                })}
                {series.length===0 && <div className="text-gray-500 text-sm">No data.</div>}
              </div>
            </div>
            {/* Fees by category */}
            <div className="p-6 border-2 border-dashed border-black bg-white lg:col-span-2">
              <h3 className="font-title font-bold text-xl mb-3">Fees by Category</h3>
              <div className="grid sm:grid-cols-5 gap-4">
                <div className="p-4 border-2 border-black bg-white"><div className="text-xs text-gray-500">Access</div><div className="text-2xl font-title font-bold">${kpi?.categories?.access?.toFixed(2) ?? '—'}</div></div>
                <div className="p-4 border-2 border-black bg-white"><div className="text-xs text-gray-500">Registration</div><div className="text-2xl font-title font-bold">${kpi?.categories?.registration?.toFixed(2) ?? '—'}</div></div>
                <div className="p-4 border-2 border-black bg-white"><div className="text-xs text-gray-500">Mint</div><div className="text-2xl font-title font-bold">${kpi?.categories?.mint?.toFixed(2) ?? '—'}</div></div>
                <div className="p-4 border-2 border-black bg-white"><div className="text-xs text-gray-500">Service</div><div className="text-2xl font-title font-bold">${kpi?.categories?.service?.toFixed(2) ?? '—'}</div></div>
                <div className="p-4 border-2 border-black bg-white"><div className="text-xs text-gray-500">Other</div><div className="text-2xl font-title font-bold">${kpi?.categories?.other?.toFixed(2) ?? '—'}</div></div>
              </div>
            </div>
          </div>
        )}

        {tab==='transactions' && (
          <div className="p-6 border-2 border-dashed border-black bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title font-bold text-xl">Transactions</h3>
              {txs.length>0 && <div className="flex gap-2">
                <button onClick={()=>exportCSV(txs,'x402-transactions.csv')} className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100">Export CSV</button>
                <button onClick={()=>{const blob=new Blob([JSON.stringify(txs)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='x402-transactions.json';a.click();URL.revokeObjectURL(url);}} className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100">Export JSON</button>
              </div>}
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Amount (USDC)</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Network</th>
                    <th className="py-2 pr-4">Explorer</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((r,i)=> (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-600">{new Date(r.time).toLocaleString()}</td>
                      <td className="py-2 pr-4 font-mono">{r.user}</td>
                      <td className="py-2 pr-4 text-black">{r.amount.toFixed(6)}</td>
                      <td className="py-2 pr-4 capitalize">{r.category}</td>
                      <td className="py-2 pr-4 text-sm text-gray-600">{r.service || r.metadata?.serviceName || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${r.network==='base'?'bg-red-100 text-red-600':'bg-gray-100 text-gray-700'}`}>
                          {r.network}
                        </span>
                      </td>
                      <td className="py-2 pr-4"><a className="text-red-600 underline" href={r.explorer} target="_blank">Open</a></td>
                    </tr>
                  ))}
                  {txs.length===0 && <tr><td className="py-4 text-gray-500" colSpan={6}>No transactions in range.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='users' && (
          <div className="p-6 border-2 border-dashed border-black bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title font-bold text-xl">Users</h3>
              {users.length>0 && <div className="flex gap-2">
                <button onClick={()=>exportCSV(users,'x402-users.csv')} className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100">Export CSV</button>
                <button onClick={()=>{const blob=new Blob([JSON.stringify(users)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='x402-users.json';a.click();URL.revokeObjectURL(url);}} className="px-3 py-2 bg-white border-2 border-black hover:bg-gray-100">Export JSON</button>
              </div>}
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Address</th>
                    <th className="py-2 pr-4">Tx Count</th>
                    <th className="py-2 pr-4">Total Paid (USDC)</th>
                    <th className="py-2 pr-4">Networks</th>
                    <th className="py-2 pr-4">First Seen</th>
                    <th className="py-2 pr-4">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u,i)=> (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-mono">{u.address}</td>
                      <td className="py-2 pr-4">{u.txCount}</td>
                      <td className="py-2 pr-4">{u.total.toFixed(6)}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 flex-wrap">
                          {(u.networks || ['base']).map((net) => (
                            <span key={net} className={`px-2 py-1 text-xs rounded ${net==='base'?'bg-red-100 text-red-600':'bg-gray-100 text-gray-700'}`}>{net}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{new Date(u.firstSeen).toLocaleString()}</td>
                      <td className="py-2 pr-4 text-gray-600">{new Date(u.lastSeen).toLocaleString()}</td>
                    </tr>
                  ))}
                  {users.length===0 && <tr><td className="py-4 text-gray-500" colSpan={6}>No users in range.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='services' && (
          <div className="p-6 border-2 border-dashed border-black bg-white">
            <h3 className="font-title font-bold text-xl mb-4">Services</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s,i)=> (
                <div key={i} className="p-4 border-2 border-black bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-title font-bold mb-1">{s.name}</div>
                      <div className="text-xs text-gray-500">Created {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-black text-white uppercase">{s.network || '—'}</span>
                  </div>
                  {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                  {s.endpoint && (
                    <div className="text-sm text-gray-500 break-all">
                      <span className="font-medium text-gray-700">Endpoint:</span> {s.endpoint}
                    </div>
                  )}
                  {s.merchantAddress && (
                    <div className="text-sm text-gray-500 break-all">
                      <span className="font-medium text-gray-700">Merchant:</span> {s.merchantAddress}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">Accepts</div>
                  <div className="space-y-1">
                    {(s.metadata?.accepts || s.accepts || []).map((a:any,idx:number)=> (
                      <div key={idx} className="text-sm flex justify-between">
                        <div className="text-black">{a.network || s.network} • {a.scheme || '402'}</div>
                        <div className="text-gray-700">
                          {a.maxAmountRequired ? `${Number(a.maxAmountRequired)/1_000_000} ${a.asset || 'USDC'}` : a.amount ? `${Number(a.amount)/1_000_000} ${a.asset || 'USDC'}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {services.length===0 && <div className="text-gray-500 text-sm">No services.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


