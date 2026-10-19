import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Clock,
  Sparkles,
  CheckCircle2,
  Wrench,
  Search,
  RefreshCw,
  Download,
  Copy,
  Check,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Building,
  QrCode,
  Eye,
  Filter,
} from 'lucide-react';
import {
  ReferralLead,
  AmbassadorSummary,
  LeadStatus,
  PayoutRecord,
} from '../types/index.js';
import { api } from '../services/api.js';
import { ManualPayoutModal } from './ManualPayoutModal.js';

interface Props {
  onSelectLead: (lead: ReferralLead) => void;
  onNavigateTab: (
    tab: 'DASHBOARD' | 'PAYOUTS' | 'VERIFICATION' | 'AUDIT_LEDGER' | 'AMBASSADORS' | 'SYSTEM_LOGS'
  ) => void;
  onRefresh: () => void;
}

type DashboardSection = 'ALL' | 'NEW' | 'PENDING' | 'YET_TO_PAY';

export const AdminDashboard: React.FC<Props> = ({
  onSelectLead,
  onNavigateTab,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<ReferralLead[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<{
    metrics: {
      totalAmbassadors: number;
      payableReferralsCount: number;
      totalPendingAmount: number;
      totalPaidAmount: number;
      totalPayoutTransactions: number;
    };
    ambassadors: AmbassadorSummary[];
    payableLeads: ReferralLead[];
  } | null>(null);

  // Filter & Search
  const [activeSection, setActiveSection] = useState<DashboardSection>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Manual Payout Modal
  const [selectedAmbassadorForPayout, setSelectedAmbassadorForPayout] =
    useState<AmbassadorSummary | null>(null);

  // Quick Status Update Modal
  const [updatingLead, setUpdatingLead] = useState<ReferralLead | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>('Contacted');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Export CSV
  const [exporting, setExporting] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [leadsRes, summaryRes] = await Promise.all([
        api.getLeads(),
        api.getPayoutSummary(),
      ]);
      setLeads(leadsRes.leads || []);
      setPayoutSummary(summaryRes);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportCsv = async (type: 'referrals' | 'payouts') => {
    try {
      setExporting(true);
      await api.exportCsv(type);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const openStatusModal = (lead: ReferralLead, targetStatus?: LeadStatus) => {
    setUpdatingLead(lead);
    setTechnicianNotes(lead.technicianNotes || '');
    setScheduledDate(lead.scheduledDate ? lead.scheduledDate.split('T')[0] : '');
    setRejectionReason(lead.rejectionReason || '');
    setStatusError(null);

    if (targetStatus) {
      setNewStatus(targetStatus);
    } else if (lead.status === 'New Lead') {
      setNewStatus('Contacted');
    } else if (lead.status === 'Contacted') {
      setNewStatus('Service Scheduled');
    } else if (lead.status === 'Service Scheduled') {
      setNewStatus('Service Completed');
    } else {
      setNewStatus(lead.status);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingLead) return;
    setStatusError(null);

    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      setStatusError('Please provide a reason for rejecting this lead.');
      return;
    }

    if (newStatus === 'Service Completed' && !technicianNotes.trim()) {
      setStatusError('Please enter technician service completion notes.');
      return;
    }

    try {
      setSavingStatus(true);
      await api.updateLeadStatus(updatingLead.id, {
        status: newStatus,
        technicianNotes: technicianNotes.trim() || undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        rejectionReason: rejectionReason.trim() || undefined,
      });

      setUpdatingLead(null);
      await loadDashboardData();
      onRefresh();
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update lead status');
    } finally {
      setSavingStatus(false);
    }
  };

  // Categorize leads
  const newLeads = leads.filter(l => l.status === 'New Lead');
  const pendingLeads = leads.filter(
    l => l.status === 'Contacted' || l.status === 'Service Scheduled'
  );
  const yetToPayLeads = leads.filter(
    l => l.status === 'Payment Pending' || (l.status === 'Service Completed' && !l.payoutId)
  );
  const paidLeads = leads.filter(l => l.status === 'Paid');

  // Filtered lists based on search query
  const matchesSearch = (lead: ReferralLead) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.customerName.toLowerCase().includes(q) ||
      lead.customerPhone.includes(q) ||
      lead.referralId.toLowerCase().includes(q) ||
      lead.ambassadorName.toLowerCase().includes(q) ||
      lead.customerLocation.toLowerCase().includes(q) ||
      lead.acServiceType.toLowerCase().includes(q)
    );
  };

  const filteredNewLeads = newLeads.filter(matchesSearch);
  const filteredPendingLeads = pendingLeads.filter(matchesSearch);
  const filteredYetToPayLeads = yetToPayLeads.filter(matchesSearch);

  // Ambassadors who have money due
  const ambassadorsWithDue = (payoutSummary?.ambassadors || []).filter(
    a => a.amountDue > 0
  );

  const totalAmountDue = payoutSummary?.metrics.totalPendingAmount || yetToPayLeads.length * 100;

  return (
    <div className="space-y-6">
      {/* 1. Super Admin Command Header */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700 mb-1 font-bold">
            <span>SUPER ADMIN COMMAND CENTER</span>
            <span>&middot;</span>
            <span className="text-slate-500 font-medium">Operations & Payouts</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin Operations Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Live overview of incoming customer leads, ongoing technician visits, and audited ambassador reward disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, phone, ambassador..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => handleExportCsv('referrals')}
            disabled={exporting}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: New Referrals */}
        <div
          onClick={() => setActiveSection(activeSection === 'NEW' ? 'ALL' : 'NEW')}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeSection === 'NEW'
              ? 'border-sky-500 ring-2 ring-sky-500/20'
              : 'border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              New Referrals
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-sky-600 font-mono">
              {newLeads.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
              Needs Contact
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Fresh incoming leads submitted by Ambassadors
          </p>
        </div>

        {/* Card 2: Pending Referrals */}
        <div
          onClick={() => setActiveSection(activeSection === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeSection === 'PENDING'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Referrals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600 font-mono">
              {pendingLeads.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              In Progress
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Customer contacted & technician visits scheduled
          </p>
        </div>

        {/* Card 3: Yet to Pay Details */}
        <div
          onClick={() => setActiveSection(activeSection === 'YET_TO_PAY' ? 'ALL' : 'YET_TO_PAY')}
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeSection === 'YET_TO_PAY'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Yet to Pay Details
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 font-mono">
              ₹{totalAmountDue}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {yetToPayLeads.length} Referrals
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Service verified · ₹100 unlocked per referral
          </p>
        </div>

        {/* Card 4: Settled Referrals */}
        <div
          onClick={() => onNavigateTab('AUDIT_LEDGER')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Settled Referrals
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-800 font-mono">
              ₹{payoutSummary?.metrics.totalPaidAmount || 0}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {paidLeads.length} Paid
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Audited manual UPI/bank transfers completed
          </p>
        </div>
      </div>

      {/* 3. Section Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSection('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          All Dashboard Sections
        </button>

        <button
          onClick={() => setActiveSection('NEW')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'NEW'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          New Referrals ({newLeads.length})
        </button>

        <button
          onClick={() => setActiveSection('PENDING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'PENDING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Pending Referrals ({pendingLeads.length})
        </button>

        <button
          onClick={() => setActiveSection('YET_TO_PAY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'YET_TO_PAY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
          Yet to Pay Details ({yetToPayLeads.length} · ₹{totalAmountDue})
        </button>
      </div>

      {/* 4. Section: NEW REFERRALS */}
      {(activeSection === 'ALL' || activeSection === 'NEW') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New Referrals ({filteredNewLeads.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Recent ambassador submissions awaiting customer phone call and scheduling
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('VERIFICATION')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              All Verification Leads &rarr;
            </button>
          </div>

          {filteredNewLeads.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
              No new referral leads waiting right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNewLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                        {lead.referralId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {lead.customerName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="hover:text-sky-600 font-mono font-medium underline"
                        >
                          +91 {lead.customerPhone}
                        </a>
                        <button
                          onClick={() => copyToClipboard(lead.customerPhone, `phone_${lead.id}`)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedField === `phone_${lead.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.customerLocation}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Service:</span>
                        <span className="font-semibold text-slate-800">{lead.acServiceType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Units:</span>
                        <span className="font-semibold text-slate-800">{lead.acUnitsCount} AC Unit(s)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Ambassador:</span>
                        <span className="font-medium text-sky-700">{lead.ambassadorName}</span>
                      </div>
                    </div>

                    {lead.customerNotes && (
                      <p className="text-[11px] text-slate-600 italic bg-amber-50/60 border border-amber-200/60 p-2 rounded-lg">
                        &ldquo;{lead.customerNotes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openStatusModal(lead, 'Contacted')}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Mark Contacted
                    </button>
                    <button
                      onClick={() => openStatusModal(lead, 'Service Scheduled')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. Section: PENDING REFERRALS (In-Progress) */}
      {(activeSection === 'ALL' || activeSection === 'PENDING') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pending Referrals ({filteredPendingLeads.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Customer contacted or technician scheduled · Complete service to unlock ₹100 reward
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('VERIFICATION')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              Open Service Pipeline &rarr;
            </button>
          </div>

          {filteredPendingLeads.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
              No pending jobs in progress right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPendingLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        {lead.referralId}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          lead.status === 'Service Scheduled'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {lead.customerName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+91 {lead.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.customerLocation}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">AC Requirement:</span>
                        <span className="font-semibold text-slate-800">{lead.acServiceType}</span>
                      </div>
                      {lead.scheduledDate && (
                        <div className="flex items-center justify-between text-amber-700">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Visit Date:
                          </span>
                          <span className="font-bold">
                            {new Date(lead.scheduledDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Referred by:</span>
                        <span className="font-medium text-sky-700">{lead.ambassadorName}</span>
                      </div>
                    </div>

                    {lead.technicianNotes && (
                      <p className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg">
                        <strong className="text-slate-700">Tech Notes:</strong> {lead.technicianNotes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openStatusModal(lead, 'Service Completed')}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      ✓ Mark Completed
                    </button>
                    <button
                      onClick={() => openStatusModal(lead)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. Section: YET TO PAY DETAILS (Disbursements Due) */}
      {(activeSection === 'ALL' || activeSection === 'YET_TO_PAY') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Yet to Pay Details (Disbursements Due &middot; ₹{totalAmountDue})
                </h2>
                <p className="text-xs text-slate-500">
                  Completed service jobs verified by Super Admin &middot; Ambassador payout details and manual transfer actions
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('PAYOUTS')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Full Payout Ledger &rarr;
            </button>
          </div>

          {/* Sub-view: Ambassador Payout Summaries (Ready for Transfer) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Ambassadors Due for Payout ({ambassadorsWithDue.length})</span>
            </h3>

            {ambassadorsWithDue.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                All completed referrals have been settled! No pending payouts at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ambassadorsWithDue.map(amb => {
                  const hasUpi = amb.payoutDetails?.method === 'UPI' && amb.payoutDetails.upiId;
                  const hasBank =
                    amb.payoutDetails?.method === 'BANK_TRANSFER' &&
                    amb.payoutDetails.bankDetails?.accountNumber;

                  return (
                    <div
                      key={amb.ambassadorId}
                      className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Ambassador Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {amb.ambassadorName}
                            </h4>
                            <div className="text-[11px] font-mono text-slate-500">
                              {amb.ambassadorId} &middot; {amb.phone}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-emerald-600 font-mono">
                              ₹{amb.amountDue}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {amb.pendingCount} referral{amb.pendingCount > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Payout Destination Details Box */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span>Payout Destination:</span>
                            {hasUpi ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                UPI Direct
                              </span>
                            ) : hasBank ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                Bank IMPS
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Not Setup
                              </span>
                            )}
                          </div>

                          {hasUpi ? (
                            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-1.5 font-mono text-slate-800 font-bold truncate">
                                <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{amb.payoutDetails?.upiId}</span>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    amb.payoutDetails!.upiId!,
                                    `upi_${amb.ambassadorId}`
                                  )
                                }
                                className="text-slate-400 hover:text-slate-800 ml-2 cursor-pointer shrink-0"
                                title="Copy UPI ID"
                              >
                                {copiedField === `upi_${amb.ambassadorId}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : hasBank ? (
                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] space-y-1">
                              <div className="flex items-center justify-between font-mono">
                                <span className="text-slate-500">A/C:</span>
                                <span className="font-bold text-slate-800">
                                  {amb.payoutDetails?.bankDetails?.accountNumber}
                                </span>
                              </div>
                              <div className="flex items-center justify-between font-mono">
                                <span className="text-slate-500">IFSC:</span>
                                <span className="font-bold text-slate-800">
                                  {amb.payoutDetails?.bankDetails?.ifscCode}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Bank:</span>
                                <span className="text-slate-800 font-medium">
                                  {amb.payoutDetails?.bankDetails?.bankName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Name:</span>
                                <span className="text-slate-800 font-medium">
                                  {amb.payoutDetails?.bankDetails?.accountHolderName}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-amber-700 italic">
                              Ambassador has not yet configured UPI ID or Bank Account. Contact them or send payment alert.
                            </p>
                          )}
                        </div>

                        {/* List of Verified Referrals for this Ambassador */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Verified Referrals Ready:
                          </span>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {amb.pendingLeads.map(l => (
                              <div
                                key={l.id}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 text-[11px] border border-slate-100"
                              >
                                <div className="truncate mr-2">
                                  <span className="font-bold text-slate-800">{l.customerName}</span>
                                  <span className="text-slate-500 font-mono ml-1">({l.referralId})</span>
                                </div>
                                <span className="font-mono font-bold text-emerald-700 shrink-0">
                                  ₹100
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Disburse & Record Payout */}
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedAmbassadorForPayout(amb)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay ₹{amb.amountDue} & Record UTR
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sub-view: Individual Payable Referrals Table */}
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                All Unpaid Verified Referrals ({filteredYetToPayLeads.length})
              </h3>
              <span className="text-xs text-slate-500">
                Reward: ₹100 per completed referral
              </span>
            </div>

            {filteredYetToPayLeads.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No payable referrals found matching your query.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Referral ID</th>
                      <th className="py-2.5 px-3 font-semibold">Customer</th>
                      <th className="py-2.5 px-3 font-semibold">Service</th>
                      <th className="py-2.5 px-3 font-semibold">Ambassador</th>
                      <th className="py-2.5 px-3 font-semibold">Reward</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredYetToPayLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-sky-700">
                          {lead.referralId}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{lead.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            +91 {lead.customerPhone} &middot; {lead.customerLocation}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{lead.acServiceType}</div>
                          <div className="text-[11px] text-slate-500">{lead.acUnitsCount} unit(s)</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{lead.ambassadorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{lead.ambassadorId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-emerald-600">
                          ₹{lead.rewardAmount || 100}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Payment Pending
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. Manual Payout Modal (Integrated into Dashboard) */}
      <ManualPayoutModal
        isOpen={!!selectedAmbassadorForPayout}
        onClose={() => setSelectedAmbassadorForPayout(null)}
        ambassador={selectedAmbassadorForPayout}
        onSuccess={async () => {
          setSelectedAmbassadorForPayout(null);
          await loadDashboardData();
          onRefresh();
        }}
      />

      {/* 8. Quick Status Update Modal */}
      {updatingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-700">
                  {updatingLead.referralId}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Update Referral Status & Verification
                </h3>
              </div>
              <button
                onClick={() => setUpdatingLead(null)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              {statusError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  {statusError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{updatingLead.customerName}</div>
                <div className="text-slate-600">
                  +91 {updatingLead.customerPhone} &middot; {updatingLead.customerLocation}
                </div>
                <div className="text-slate-500">
                  Service: {updatingLead.acServiceType} ({updatingLead.acUnitsCount} Units) &middot; Referred by {updatingLead.ambassadorName}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Service Scheduled">Service Scheduled</option>
                  <option value="Service Completed">Service Completed (Unlocks ₹100 Payout)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {newStatus === 'Service Scheduled' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheduled Technician Visit Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              )}

              {(newStatus === 'Service Completed' || newStatus === 'Service Scheduled') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Technician Service Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Jet wash completed on 1.5T Daikin split AC. Cooling verified at 16°C."
                    value={technicianNotes}
                    onChange={e => setTechnicianNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              )}

              {newStatus === 'Rejected' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rejection Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Customer cancelled / Duplicate submission"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingStatus ? 'Saving...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
