import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlusCircle,
  Search,
  Download,
  CreditCard,
  Eye,
  Receipt,
  Wrench,
  Award,
  Sparkles,
} from 'lucide-react';
import { ReferralLead, User, PayoutRecord } from '../types/index.js';
import { api } from '../services/api.js';
import { CoolvengersLogo } from './CoolvengersLogo.js';

interface Props {
  currentUser: User;
  onOpenSubmitLead: () => void;
  onOpenPayoutSetup: () => void;
  onSelectLead: (lead: ReferralLead) => void;
}

export const AmbassadorDashboard: React.FC<Props> = ({
  currentUser,
  onOpenSubmitLead,
  onOpenPayoutSetup,
  onSelectLead,
}) => {
  const [leads, setLeads] = useState<ReferralLead[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'REFERRALS' | 'PAYOUTS'>('REFERRALS');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const heroImagePath = '/src/assets/images/coolvengers_ac_service_hero_1792128885044.jpg';

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, payoutsRes] = await Promise.all([
        api.getLeads({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchTerm || undefined,
          startDate: dateFilter || undefined,
        }),
        api.getPayoutHistory(),
      ]);
      setLeads(leadsRes.leads);
      setPayouts(payoutsRes.payouts);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, searchTerm, dateFilter, currentUser.id]);

  // Metrics
  const totalReferrals = leads.length;
  const successfulReferrals = leads.filter(
    l => l.status === 'Service Completed' || l.status === 'Payment Pending' || l.status === 'Paid'
  ).length;

  const pendingRewards = leads
    .filter(l => l.status === 'Payment Pending' && !l.payoutId)
    .reduce((sum, l) => sum + (l.rewardAmount || 100), 0);

  const paidRewards = leads
    .filter(l => l.status === 'Paid')
    .reduce((sum, l) => sum + (l.rewardAmount || 100), 0);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await api.exportCsv(activeTab === 'PAYOUTS' ? 'payouts' : 'referrals');
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const getStatusTextClass = (status: ReferralLead['status']) => {
    switch (status) {
      case 'New Lead':
        return 'text-sky-700 font-semibold';
      case 'Contacted':
        return 'text-indigo-700 font-semibold';
      case 'Service Scheduled':
        return 'text-amber-700 font-semibold';
      case 'Service Completed':
      case 'Payment Pending':
        return 'text-emerald-700 font-bold';
      case 'Paid':
        return 'text-teal-700 font-bold';
      case 'Rejected':
        return 'text-rose-700 font-semibold';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Hero Banner Card with Real AC Service Visual Asset */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[260px]">
          {/* Left Text Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <CoolvengersLogo size="sm" showSubtitle={false} animated={true} />
                <span>&middot;</span>
                <span className="font-mono text-sky-700 font-bold">{currentUser.ambassadorId}</span>
                <span>&middot;</span>
                <span>Welcome, {currentUser.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Earn ₹100 For Every Verified AC Referral
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Connect Chennai homeowners and offices needing AC deep cleaning, gas refills, or repairs with Coolvengers. Once our Super Admin verifies the completed service, your ₹100 reward is queued for an audited manual UPI or Bank transfer.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenSubmitLead}
                className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Customer Lead
              </motion.button>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payout destination: </span>
                {currentUser.payoutDetails?.method === 'UPI' ? (
                  <span className="font-mono text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    UPI: {currentUser.payoutDetails.upiId}
                  </span>
                ) : currentUser.payoutDetails?.method === 'BANK_TRANSFER' ? (
                  <span className="font-mono text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    Bank: {currentUser.payoutDetails.bankDetails?.bankName} (...{currentUser.payoutDetails.bankDetails?.accountNumber?.slice(-4)})
                  </span>
                ) : (
                  <button
                    onClick={onOpenPayoutSetup}
                    className="text-amber-700 hover:text-amber-800 underline font-semibold cursor-pointer"
                  >
                    Setup Payout Method
                  </button>
                )}
                {currentUser.payoutDetails && (
                  <button
                    onClick={onOpenPayoutSetup}
                    className="text-slate-500 hover:text-slate-800 underline text-[11px] ml-1 cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Visual Image Column */}
          <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full overflow-hidden bg-slate-100">
            {!imgError ? (
              <img
                src={heroImagePath}
                alt="Coolvengers AC technician performing split air conditioner maintenance"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-500">
                <Wrench className="w-8 h-8 text-sky-600 mb-2" />
                <span className="text-xs font-semibold text-slate-800">Coolvengers Aircons Technician Squad</span>
                <span className="text-[11px] text-slate-500">Fast 30-min response in Chennai</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* KPI Metric Strip (High-Density, Tabular Figures, Light Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.035, y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300 transition-shadow duration-200 cursor-pointer select-none group"
        >
          <div className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Total Referrals</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalReferrals}</span>
            <span className="text-[11px] text-slate-500">Leads logged</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.035, y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-shadow duration-200 cursor-pointer select-none group"
        >
          <div className="text-xs font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">Successful Jobs</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">{successfulReferrals}</span>
            <span className="text-[11px] text-slate-500">Verified complete</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.035, y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-amber-200 transition-shadow duration-200 cursor-pointer select-none group"
        >
          <div className="text-xs font-medium text-slate-500 group-hover:text-amber-700 transition-colors">Pending Rewards</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">₹{pendingRewards}</span>
            <span className="text-[11px] text-slate-500">Awaiting UTR transfer</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.035, y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-sky-200 transition-shadow duration-200 cursor-pointer select-none group"
        >
          <div className="text-xs font-medium text-slate-500 group-hover:text-sky-700 transition-colors">Paid Rewards</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-sky-600 tabular-nums">₹{paidRewards}</span>
            <span className="text-[11px] text-slate-500">Disbursed to account</span>
          </div>
        </motion.div>
      </div>

      {/* 3-Step Lifecycle Mechanism Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3">
            <span className="font-mono font-bold text-sky-600 text-sm">01.</span>
            <div>
              <p className="font-semibold text-slate-900">Submit Referral Lead</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Share customer details & required AC service. A unique Referral ID is instantly issued.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono font-bold text-sky-600 text-sm">02.</span>
            <div>
              <p className="font-semibold text-slate-900">Technician Service & Verification</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Super Admin contacts customer, schedules the technician, and verifies completion to lock ₹100.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono font-bold text-sky-600 text-sm">03.</span>
            <div>
              <p className="font-semibold text-slate-900">Manual Payout with Bank UTR</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Super Admin transfers funds via UPI or Bank IMPS outside the portal and enters the UTR proof.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('REFERRALS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'REFERRALS'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Referrals ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('PAYOUTS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PAYOUTS'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Payout Receipts ({payouts.length})
            </button>
          </div>

          {/* Search, Status & CSV */}
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'REFERRALS' && (
              <>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search customer, phone, ref ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 w-48 sm:w-56"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Service Scheduled">Service Scheduled</option>
                  <option value="Payment Pending">Payment Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </>
            )}

            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Tab 1: Referrals Table */}
        {activeTab === 'REFERRALS' && (
          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800">No referrals found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'No leads match the selected criteria. Try adjusting your search.'
                    : 'Submit your first referral lead to start earning ₹100 per completed AC job.'}
                </p>
                <button
                  onClick={onOpenSubmitLead}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Submit AC Lead
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Referral ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service & Locality</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Reward</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {leads.map(lead => (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">
                        {lead.referralId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{lead.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">+91 {lead.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 font-medium truncate">{lead.acServiceType}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {lead.acUnitsCount} unit(s) &middot; {lead.customerLocation}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusTextClass(lead.status)}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {lead.status === 'Paid' ? (
                          <span className="text-teal-700 font-bold">₹100 Paid</span>
                        ) : lead.rewardEligible ? (
                          <span className="text-emerald-700 font-bold">₹100 Due</span>
                        ) : lead.status === 'Rejected' ? (
                          <span className="text-slate-400">₹0</span>
                        ) : (
                          <span className="text-slate-500">₹100 (Pending)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-sky-700 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Payout Receipts */}
        {activeTab === 'PAYOUTS' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Audited manual bank and UPI transfers recorded by Coolvengers Super Admin</span>
              <span className="font-mono text-emerald-700 font-bold tabular-nums">
                Lifetime Received: ₹{paidRewards}
              </span>
            </div>

            {payouts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No payouts recorded yet. Once referrals are verified completed, Super Admin will process your transfer and attach the bank UTR.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payouts.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-sky-700">{p.payoutId}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{p.paymentDate}</span>
                      </div>
                      <span className="text-base font-mono font-extrabold text-emerald-700 tabular-nums">
                        ₹{p.totalAmount}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>Mode:</span>
                        <span className="text-slate-800">{p.payoutMethod}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Bank UTR / Ref:</span>
                        <span className="text-amber-700 font-bold select-all">{p.transactionRef}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Referrals:</span>
                        <span className="text-slate-800">{p.referralIds.join(', ')}</span>
                      </div>
                    </div>

                    {p.adminNotes && (
                      <p className="text-[11px] text-slate-600 italic">
                        "{p.adminNotes}" &middot; <span className="text-slate-500">{p.adminName}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
