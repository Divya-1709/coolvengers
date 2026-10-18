import React, { useState, useEffect } from 'react';
import { Search, Copy } from 'lucide-react';
import { AmbassadorSummary } from '../types/index.js';
import { api } from '../services/api.js';

export const AmbassadorDirectory: React.FC = () => {
  const [ambassadors, setAmbassadors] = useState<AmbassadorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getPayoutSummary()
      .then(res => setAmbassadors(res.ambassadors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = ambassadors.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.ambassadorName.toLowerCase().includes(q) ||
      a.ambassadorId.toLowerCase().includes(q) ||
      a.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-700">
              AMBASSADOR NETWORK &middot; ROSTER
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ambassador Roster & Payout Status</h2>
          <p className="text-xs text-slate-600 mt-1">
            Directory of registered Coolvengers Aircons ambassadors, verified payout channels, and earnings.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ambassadors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
              <th className="py-3 px-4">Ambassador ID</th>
              <th className="py-3 px-4">Name & Phone</th>
              <th className="py-3 px-4">Payout Method</th>
              <th className="py-3 px-4">Payment Destination</th>
              <th className="py-3 px-4 text-center">Pending Leads</th>
              <th className="py-3 px-4 text-right">Amount Due</th>
              <th className="py-3 px-4 text-right">Lifetime Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map(amb => (
              <tr key={amb.ambassadorId} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                  {amb.ambassadorId}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{amb.ambassadorName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{amb.phone}</div>
                </td>
                <td className="py-3.5 px-4">
                  {amb.payoutDetails?.method === 'UPI' ? (
                    <span className="font-semibold text-sky-800">
                      UPI VPA
                    </span>
                  ) : amb.payoutDetails?.method === 'BANK_TRANSFER' ? (
                    <span className="font-semibold text-slate-800">
                      Bank Transfer
                    </span>
                  ) : (
                    <span className="text-slate-400">Not Configured</span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px]">
                  {amb.payoutDetails?.method === 'UPI' && amb.payoutDetails.upiId ? (
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span>{amb.payoutDetails.upiId}</span>
                      <button
                        onClick={() => copyToClipboard(amb.payoutDetails!.upiId!, amb.ambassadorId)}
                        className="text-slate-400 hover:text-sky-700 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ) : amb.payoutDetails?.method === 'BANK_TRANSFER' && amb.payoutDetails.bankDetails ? (
                    <div className="text-slate-700">
                      <div>A/C: {amb.payoutDetails.bankDetails.accountNumber}</div>
                      <div className="text-[10px] text-slate-500">IFSC: {amb.payoutDetails.bankDetails.ifscCode}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-800">
                  {amb.pendingCount}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                  {amb.amountDue > 0 ? (
                    <span className="text-amber-700">₹{amb.amountDue}</span>
                  ) : (
                    <span className="text-slate-400">₹0</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                  ₹{amb.lifetimePaidAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
