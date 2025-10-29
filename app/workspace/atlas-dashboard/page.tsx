'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import Link from 'next/link';
import { ManageWallet } from '../../components/ManageWallet';

type BalanceData = {
  evm: { network: string; native: string; usdc: string } | null;
  solana: { network: string; native: string; usdc: string } | null;
};

type ActivityKind =
  | 'payment'
  | 'mint'
  | 'token_minted'
  | 'inbound'
  | 'outbound'
  | 'registration'
  | 'service'
  | 'service_registered'
  | 'access_granted'
  | 'operator_action'
  | 'other';

type ActivityItem = {
  network: 'base' | 'solana-mainnet';
  kind: ActivityKind;
  amount: string;
  timestamp: number;
  txHash?: string;
  signature?: string;
  merchant?: { name: string; endpoint: string };
  metadata?: Record<string, any>;
};

export default function AtlasDashboardPage() {
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [tab, setTab] = useState<'overview' | 'activity' | 'payments' | 'minted' | 'services'>('overview');
  const [loading, setLoading] = useState(false);

  // Detect if connected wallet is Solana or EVM based on address format
  const isSolanaWallet = useMemo(() => {
    if (!address) return false;
    // Solana addresses are base58 and typically 32-44 characters without 0x prefix
    // EVM addresses start with 0x and are 42 characters
    return !address.startsWith('0x') && address.length >= 32;
  }, [address]);

  const evmAddress = useMemo(() => {
    return !isSolanaWallet && address ? address : '';
  }, [isSolanaWallet, address]);

  const solAddress = useMemo(() => {
    return isSolanaWallet && address ? address : '';
  }, [isSolanaWallet, address]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      if (!isConnected || !address) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (evmAddress) params.append('address', evmAddress);
        if (solAddress) params.append('solAddress', solAddress);
        
        const [bRes, aRes] = await Promise.all([
          fetch(`/api/user/balances?${params.toString()}`),
          fetch(`/api/user/activity?${params.toString()}`)
        ]);
        const bJson = await bRes.json();
        const aJson = await aRes.json();
        if (bJson.success) setBalances(bJson.data);
        if (aJson.success) setActivity(aJson.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isConnected, address, evmAddress, solAddress]);

  const paymentEvents = useMemo(() => activity.filter(a => ['payment','registration','service','operator_action'].includes(a.kind)), [activity]);
  const mintEvents = useMemo(() => activity.filter(a => a.kind === 'mint' || a.kind === 'token_minted'), [activity]);
  const serviceEvents = useMemo(() => activity.filter(a => a.kind === 'service_registered' || a.kind === 'registration'), [activity]);
  const accessEvents = useMemo(() => activity.filter(a => a.kind === 'access_granted'), [activity]);
  const operatorEvents = useMemo(() => activity.filter(a => a.kind === 'operator_action'), [activity]);

  const totalSpent = useMemo(() => paymentEvents.reduce((acc, evt) => acc + Number(evt.amount || 0), 0), [paymentEvents]);
  const totalMinted = mintEvents.length;
  const totalServices = serviceEvents.length;
  const totalAccess = accessEvents.length;
  const totalOperator = operatorEvents.length;

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-20">
      {/* Back */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg"
        >
          <span className="text-sm sm:text-base font-medium">Back</span>
          <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">↩</span>
        </Link>
      </div>

      {/* Manage Wallet */}
      <ManageWallet />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-bold font-title">Atlas <span className="text-red-600">Dashboard</span></h1>
          <p className="text-gray-600 mt-3">All your balances, payments, mints, services — across Base and Solana.</p>
        </div>

        {/* Connection gate */}
        {!isConnected && (
          <div className="mb-12 p-8 border-2 border-dashed border-red-600 bg-red-50">
            <h2 className="text-2xl font-bold text-black mb-3 font-title">Connect Wallet</h2>
            <p className="text-gray-700 mb-6">Connect to view your balances and on‑chain activity.</p>
            <button onClick={() => open()} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-all font-medium">Connect Wallet</button>
          </div>
        )}

        {isConnected && (
          <>
            {/* Overview balances */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 border-2 border-black bg-white">
                <div className="text-xs text-gray-500 mb-1">Base</div>
                <div className="text-3xl font-title font-bold mb-2">USDC {balances?.evm?.usdc ?? '—'}</div>
                <div className="text-sm text-gray-600">ETH {balances?.evm?.native ?? '—'}</div>
              </div>
              <div className="p-6 border-2 border-black bg-white">
                <div className="text-xs text-gray-500 mb-1">Solana</div>
                <div className="text-3xl font-title font-bold mb-2">USDC {balances?.solana?.usdc ?? '—'}</div>
                <div className="text-sm text-gray-600">SOL {balances?.solana?.native ?? '—'}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b-2 border-gray-200 mb-6 flex gap-8">
              {(['overview','activity','payments','minted','services'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`py-4 font-title ${tab===t?'text-black border-b-2 border-red-600':'text-gray-400 hover:text-black'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
              ))}
            </div>

            {/* Content */}
            {tab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6 mb-10">
              <div className="p-6 border-2 border-dashed border-black bg-white">
                <h3 className="font-title font-bold text-xl mb-3">Recent Activity</h3>
                <div className="space-y-3 max-h-80 overflow-auto pr-2">
                  {activity.slice(0,8).map((a,i)=> (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded ${a.kind==='payment'?'bg-red-100 text-red-600':a.kind==='registration'||a.kind==='service_registered'?'bg-black text-white':a.kind==='token_minted'||a.kind==='mint'?'bg-gray-900 text-white':a.kind==='access_granted'?'bg-gray-200 text-black':'bg-gray-100 text-gray-600'}`}>{a.kind.replace('_',' ')}</span>
                        <div className="text-gray-500 text-xs">{a.network}</div>
                      </div>
                      <div className="text-black font-medium">{Number(a.amount || 0).toFixed(2)} USDC</div>
                    </div>
                  ))}
                  {activity.length===0 && <div className="text-gray-500 text-sm">No activity yet.</div>}
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-black bg-white">
                <h3 className="font-title font-bold text-xl mb-3">Spending Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-gray-600">Total Spent</span><span className="font-bold text-black">${totalSpent.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Access Passes</span><span className="font-bold text-black">{totalAccess}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Operator Actions</span><span className="font-bold text-black">{totalOperator}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Tokens Minted</span><span className="font-bold text-black">{totalMinted}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Services Registered</span><span className="font-bold text-black">{totalServices}</span></div>
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-black bg-white">
                <h3 className="font-title font-bold text-xl mb-3">Top Merchants</h3>
                <div className="space-y-3 max-h-80 overflow-auto pr-2">
                  {Object.values(paymentEvents.reduce<Record<string,{name:string;endpoint:string;spent:number}>>((acc,a)=>{
                    const key = a.merchant?.endpoint || a.metadata?.endpoint || 'unknown';
                    const name = a.merchant?.name || a.metadata?.serviceName || 'Unknown Merchant';
                    if (!acc[key]) acc[key] = { name, endpoint: key, spent: 0 };
                    acc[key].spent += Number(a.amount || 0);
                    return acc;
                  },{})).sort((x,y)=>y.spent-x.spent).slice(0,5).map((m,i)=> (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                      <div className="text-black">{m.name}</div>
                      <div className="text-black font-medium">${m.spent.toFixed(2)}</div>
                    </div>
                  ))}
                  {paymentEvents.length===0 && <div className="text-gray-500 text-sm">No payments yet.</div>}
                </div>
              </div>
              </div>
            )}

            {tab === 'activity' && (
              <div className="space-y-3">
                {activity.map((a,i)=> (
                  <div key={i} className="p-4 border-2 border-black bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded ${a.kind==='payment'?'bg-red-100 text-red-600':a.kind==='registration'||a.kind==='service_registered'?'bg-black text-white':a.kind==='token_minted'||a.kind==='mint'?'bg-gray-900 text-white':a.kind==='access_granted'?'bg-gray-200 text-black':'bg-gray-100 text-gray-600'}`}>{a.kind.replace('_',' ')}</span>
                      <div className="text-gray-500">{new Date(a.timestamp).toLocaleString()}</div>
                      <div className="text-gray-500">{a.network}</div>
                      {(a.merchant?.name || a.metadata?.serviceName) && <div className="text-black">{a.merchant?.name || a.metadata?.serviceName}</div>}
                    </div>
                    <div className="text-black font-bold">{a.amount} USDC</div>
                  </div>
                ))}
                {activity.length===0 && <div className="text-gray-500 text-sm">No activity.</div>}
              </div>
            )}

            {tab === 'payments' && (
              <div className="space-y-3">
                {paymentEvents.map((a,i)=> {
                  const explorer = a.network === 'base' && a.txHash
                    ? `https://basescan.org/tx/${a.txHash}`
                    : a.signature ? `https://solscan.io/tx/${a.signature}` : undefined;
                  const label = a.kind === 'registration' || a.kind === 'service' ? 'Service Payment' : a.kind === 'operator_action' ? 'Operator Action' : 'Payment';
                  const name = a.merchant?.name || a.metadata?.serviceName || '—';
                  return (
                    <div key={i} className="p-4 border-2 border-black bg-white flex items-center justify-between">
                      <div>
                        <div className="text-black font-medium">{label}</div>
                        <div className="text-xs text-gray-500 break-all">{name}</div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{Number(a.amount || 0).toFixed(2)} USDC</span>
                        <span>{a.network}</span>
                        {explorer && <a className="text-red-600 underline" href={explorer} target="_blank" rel="noreferrer">Explorer</a>}
                      </div>
                    </div>
                  );
                })}
                {paymentEvents.length===0 && <div className="text-gray-500 text-sm">No payments.</div>}
              </div>
            )}

            {tab === 'minted' && (
              <div className="space-y-3">
                {mintEvents.map((a,i)=> {
                  const explorer = a.network === 'base' && a.txHash
                    ? `https://basescan.org/tx/${a.txHash}`
                    : a.signature ? `https://solscan.io/tx/${a.signature}` : undefined;
                  const tokenName = a.metadata?.tokenName || a.metadata?.serviceName || 'Token';
                  return (
                    <div key={i} className="p-4 border-2 border-black bg-white flex items-center justify-between">
                      <div>
                        <div className="text-black font-medium">{tokenName}</div>
                        <div className="text-xs text-gray-500">Mint • {new Date(a.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{Number(a.amount || 0).toFixed(2)} USDC</span>
                        {explorer && <a className="text-red-600 underline" href={explorer} target="_blank" rel="noreferrer">Explorer</a>}
                      </div>
                    </div>
                  );
                })}
                {mintEvents.length===0 && <div className="text-gray-500 text-sm">No token mints detected.</div>}
              </div>
            )}

            {tab === 'services' && (
              <div className="space-y-3">
                {serviceEvents.map((a,i)=> {
                  const explorer = a.network === 'base' && a.txHash
                    ? `https://basescan.org/tx/${a.txHash}`
                    : a.signature ? `https://solscan.io/tx/${a.signature}` : undefined;
                  const serviceName = a.metadata?.name || a.metadata?.serviceName || a.merchant?.name || 'Service';
                  return (
                    <div key={i} className="p-4 border-2 border-black bg-white flex items-center justify-between">
                      <div>
                        <div className="text-black font-medium">{serviceName}</div>
                        {a.metadata?.endpoint && <div className="text-xs text-gray-500 break-all">{a.metadata.endpoint}</div>}
                        <div className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()} • {a.network}</div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{Number(a.amount || 0).toFixed(2)} USDC</span>
                        {explorer && <a className="text-red-600 underline" href={explorer} target="_blank" rel="noreferrer">Explorer</a>}
                      </div>
                    </div>
                  );
                })}
                {serviceEvents.length===0 && <div className="text-gray-500 text-sm">No service registrations yet.</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


