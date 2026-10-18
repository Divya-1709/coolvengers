import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { PayoutRecord } from '../types/index.js';
import { api } from '../services/api.js';
import { CoolvengersLogo } from './CoolvengersLogo.js';

export const PayoutAuditHistory: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.getPayoutHistory({
        search: search || undefined,
        method: methodFilter !== 'ALL' ? methodFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setPayouts(res.payouts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [search, methodFilter, startDate, endDate]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await api.exportCsv('payouts');
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const totalDisbursed = payouts.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalReferralsPaid = payouts.reduce((sum, p) => sum + p.referralCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-700">
              AUDIT LEDGER &middot; MANUAL PAYOUTS
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Auditable Manual Payout Records</h2>
          <p className="text-xs text-slate-600 mt-1">
            Permanent record of all manual UPI and bank transfers executed for ambassador rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            {exporting ? 'Exporting...' : 'Export Payouts (CSV)'}
          </button>
          <button
            onClick={fetchPayouts}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-lg hover:border-slate-300 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">Total Filtered Payouts</span>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">{payouts.length} Batches</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-lg hover:border-sky-200 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <span className="text-xs text-slate-500 group-hover:text-sky-700 transition-colors">Total Referrals Settled</span>
          <p className="text-2xl font-bold text-sky-700 font-mono mt-1 tabular-nums">{totalReferralsPaid} Jobs</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-lg hover:border-emerald-200 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <span className="text-xs text-slate-500 group-hover:text-emerald-700 transition-colors">Total Amount Disbursed</span>
          <p className="text-2xl font-bold text-emerald-700 font-mono mt-1 tabular-nums">₹{totalDisbursed}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by UTR, Payout ID, Ambassador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="UPI">UPI Transfer</option>
            <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
              <th className="py-3 px-4">Payout ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Ambassador</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Bank UTR / Transaction Ref</th>
              <th className="py-3 px-4">Referrals Paid</th>
              <th className="py-3 px-4 text-right">Amount (INR)</th>
              <th className="py-3 px-4 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {payouts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-sky-700">
                  {p.payoutId}
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                  {new Date(p.paymentDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{p.ambassadorName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.ambassadorId}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-700">
                    {p.payoutMethod}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-amber-700 select-all">
                  {p.transactionRef}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  <span className="font-semibold text-slate-900">{p.referralCount} leads</span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    [{p.referralIds.join(', ')}]
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm tabular-nums">
                  ₹{p.totalAmount}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => setSelectedPayout(p)}
                    className="p-1 rounded text-slate-500 hover:text-sky-700 cursor-pointer"
                    title="View Auditable Receipt"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout Details Receipt Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Manual Payout Audit Voucher</h3>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-center pb-1">
                  <CoolvengersLogo size="sm" showWordmark={true} animated={false} />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Settled Referral Reward</span>
                <p className="text-3xl font-mono font-extrabold text-emerald-700 tabular-nums">
                  ₹{selectedPayout.totalAmount}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedPayout.payoutId} &bull; {selectedPayout.paymentDate}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ambassador:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedPayout.ambassadorName} ({selectedPayout.ambassadorId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-900">{selectedPayout.payoutMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank UTR Reference:</span>
                  <span className="font-mono font-bold text-amber-700">
                    {selectedPayout.transactionRef}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized By:</span>
                  <span className="text-slate-900">{selectedPayout.adminName}</span>
                </div>
                {selectedPayout.adminNotes && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admin Notes:</span>
                    <span className="text-slate-700 text-right max-w-xs">{selectedPayout.adminNotes}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-slate-500 block mb-1">Settled Referral IDs:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPayout.referralIds.map(ref => (
                    <span
                      key={ref}
                      className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-sky-800 text-[11px]"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <button
                onClick={() => setSelectedPayout(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
