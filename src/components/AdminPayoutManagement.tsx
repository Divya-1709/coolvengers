import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Search,
  RefreshCw,
} from 'lucide-react';
import { AmbassadorSummary, ReferralLead, PayoutRecord } from '../types/index.js';
import { api } from '../services/api.js';
import { ManualPayoutModal } from './ManualPayoutModal.js';

interface Props {
  onPayoutCompleted: () => void;
  onSelectLead: (lead: ReferralLead) => void;
}

export const AdminPayoutManagement: React.FC<Props> = ({
  onPayoutCompleted,
  onSelectLead,
}) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalAmbassadors: 0,
    payableReferralsCount: 0,
    totalPendingAmount: 0,
    totalPaidAmount: 0,
    totalPayoutTransactions: 0,
  });
  const [ambassadors, setAmbassadors] = useState<AmbassadorSummary[]>([]);
  const [payableLeads, setPayableLeads] = useState<ReferralLead[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ONLY_DUE'>('ONLY_DUE');

  // Manual Payout Modal state
  const [selectedAmbassadorForPayout, setSelectedAmbassadorForPayout] =
    useState<AmbassadorSummary | null>(null);

  const [exporting, setExporting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getPayoutSummary();
      setMetrics(res.metrics);
      setAmbassadors(res.ambassadors);
      setPayableLeads(res.payableLeads);
    } catch (err) {
      console.error('Failed to load payout summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filter ambassadors
  const filteredAmbassadors = ambassadors.filter(amb => {
    if (filterMode === 'ONLY_DUE' && amb.amountDue === 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        amb.ambassadorName.toLowerCase().includes(q) ||
        amb.ambassadorId.toLowerCase().includes(q) ||
        amb.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700 mb-1">
            <span className="font-bold">SUPER ADMIN COMMAND</span>
            <span>&middot;</span>
            <span className="text-slate-500">Manual Payout Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ambassador Payouts Management
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Execute manual money transfers via your banking portal or UPI app. Once processed, record the transaction UTR to officially settle the referrals and generate an auditable ledger record.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-600" />
            {exporting ? 'Exporting...' : 'Export Payouts (CSV)'}
          </button>
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            title="Refresh Summary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-amber-200 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 group-hover:text-amber-700 transition-colors">Payable Referrals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {metrics.payableReferralsCount}
            </span>
            <span className="text-[11px] text-slate-500">Jobs verified</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-amber-200 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 group-hover:text-amber-700 transition-colors">Total Amount Due</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              ₹{metrics.totalPendingAmount}
            </span>
            <span className="text-[11px] text-slate-500">Pending transfer</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-200 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Total Disbursed (Paid)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              ₹{metrics.totalPaidAmount}
            </span>
            <span className="text-[11px] text-slate-500">Audited via UTR</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-sky-200 transform transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer select-none group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 group-hover:text-sky-700 transition-colors">Total Ambassadors</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.totalAmbassadors}
            </span>
            <span className="text-[11px] text-slate-500">Club members</span>
          </div>
        </div>
      </div>

      {/* Main Section: Ambassador Payouts Queue */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Ambassador Payable Accounts</h2>
            <p className="text-xs text-slate-500">
              Ambassadors with verified referrals awaiting manual payout
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterMode('ONLY_DUE')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterMode === 'ONLY_DUE'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Due Only ({ambassadors.filter(a => a.amountDue > 0).length})
              </button>
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({ambassadors.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ambassador, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 w-52"
              />
            </div>
          </div>
        </div>

        {/* Ambassador Cards Grid */}
        <div className="p-4 sm:p-6">
          {filteredAmbassadors.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-900">All payouts are up to date</p>
              <p className="text-slate-500">No pending referrals requiring manual payout at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAmbassadors.map(amb => (
                <div
                  key={amb.ambassadorId}
                  className={`rounded-xl border p-4 space-y-3 transition-colors ${
                    amb.amountDue > 0
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{amb.ambassadorName}</h3>
                      <div className="text-[11px] font-mono text-sky-700 font-semibold">{amb.ambassadorId}</div>
                      <p className="text-[11px] text-slate-500">{amb.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Amount Due</span>
                      <p className={`text-xl font-mono font-bold tabular-nums ${
                        amb.amountDue > 0 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        ₹{amb.amountDue}
                      </p>
                    </div>
                  </div>

                  {/* Registered Payout Method Snapshot */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Destination:</span>
                      <span className="font-semibold text-slate-800">
                        {amb.payoutDetails?.method || 'Not configured'}
                      </span>
                    </div>

                    {amb.payoutDetails?.method === 'UPI' && amb.payoutDetails.upiId ? (
                      <div className="flex items-center justify-between font-mono text-sky-800 pt-1 border-t border-slate-100 text-[11px]">
                        <span className="truncate max-w-[170px]" title={amb.payoutDetails.upiId}>
                          {amb.payoutDetails.upiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(amb.payoutDetails!.upiId!, amb.ambassadorId)}
                          className="text-[10px] text-slate-500 hover:text-sky-700 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedField === amb.ambassadorId ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ) : amb.payoutDetails?.method === 'BANK_TRANSFER' && amb.payoutDetails.bankDetails ? (
                      <div className="space-y-0.5 font-mono text-[11px] pt-1 border-t border-slate-100">
                        <div className="flex justify-between text-slate-600">
                          <span>A/C:</span>
                          <span className="text-slate-900 font-semibold">{amb.payoutDetails.bankDetails.accountNumber}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>IFSC:</span>
                          <span className="text-slate-900 font-semibold">{amb.payoutDetails.bankDetails.ifscCode}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-amber-700 pt-1 border-t border-slate-100">
                        No verified payout channel registered
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                    <span>Pending: <strong className="text-slate-800 font-mono">{amb.pendingCount}</strong></span>
                    <span>Paid: <strong className="text-emerald-700 font-mono">₹{amb.lifetimePaidAmount}</strong></span>
                  </div>

                  {amb.amountDue > 0 ? (
                    <button
                      onClick={() => setSelectedAmbassadorForPayout(amb)}
                      className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-4 h-4" />
                      Record Manual Payout (₹{amb.amountDue})
                    </button>
                  ) : (
                    <div className="w-full py-1.5 rounded-lg bg-slate-100 text-slate-500 text-center text-xs font-medium">
                      All referrals settled
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Individual Payable Leads Queue */}
        <div className="border-t border-slate-200 p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Completed Referrals Awaiting Disbursement ({payableLeads.length})
            </h3>
            <p className="text-xs text-slate-500">
              Each job below has been completed and verified with an unlocked ₹100 liability
            </p>
          </div>

          <div className="overflow-x-auto">
            {payableLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No individual referrals in Payment Pending queue.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Referral ID</th>
                    <th className="py-2.5 px-3">Ambassador</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Verified By</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {payableLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                        {lead.referralId}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{lead.ambassadorName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{lead.ambassadorId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{lead.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">+91 {lead.customerPhone}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {lead.acServiceType} ({lead.acUnitsCount} units)
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {lead.verifiedByStaffName || 'Super Admin'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                        ₹{lead.rewardAmount || 100}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            const amb = ambassadors.find(a => a.ambassadorId === lead.ambassadorId);
                            if (amb) setSelectedAmbassadorForPayout(amb);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Process Payout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Manual Payout Modal */}
      {selectedAmbassadorForPayout && (
        <ManualPayoutModal
          isOpen={!!selectedAmbassadorForPayout}
          onClose={() => setSelectedAmbassadorForPayout(null)}
          ambassador={selectedAmbassadorForPayout}
          onSuccess={() => {
            fetchSummary();
            onPayoutCompleted();
          }}
        />
      )}
    </div>
  );
};
