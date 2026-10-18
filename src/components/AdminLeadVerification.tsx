import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Search,
  Download,
  Eye,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { ReferralLead, UserRole, LeadStatus } from '../types/index.js';
import { api } from '../services/api.js';

interface Props {
  currentUserRole: UserRole;
  onSelectLead: (lead: ReferralLead) => void;
  onLeadUpdated: () => void;
}

export const AdminLeadVerification: React.FC<Props> = ({
  currentUserRole,
  onSelectLead,
  onLeadUpdated,
}) => {
  const [leads, setLeads] = useState<ReferralLead[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected lead for verification / status update modal
  const [activeLead, setActiveLead] = useState<ReferralLead | null>(null);
  const [targetStatus, setTargetStatus] = useState<LeadStatus>('Contacted');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.getLeads({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchQuery || undefined,
        startDate: dateFilter || undefined,
      });
      setLeads(res.leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, searchQuery, dateFilter]);

  const handleOpenActionModal = (lead: ReferralLead, defaultNextStatus?: LeadStatus) => {
    setActiveLead(lead);
    setTechnicianNotes(lead.technicianNotes || '');
    setScheduledDate(lead.scheduledDate ? lead.scheduledDate.split('T')[0] : '');
    setRejectionReason(lead.rejectionReason || '');
    setModalError(null);

    if (defaultNextStatus) {
      setTargetStatus(defaultNextStatus);
    } else {
      if (lead.status === 'New Lead') setTargetStatus('Contacted');
      else if (lead.status === 'Contacted') setTargetStatus('Service Scheduled');
      else if (lead.status === 'Service Scheduled') setTargetStatus('Service Completed');
      else setTargetStatus(lead.status);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    setModalError(null);

    if (targetStatus === 'Rejected' && !rejectionReason.trim()) {
      setModalError('Please provide a reason for rejecting this referral lead.');
      return;
    }

    if (targetStatus === 'Service Completed' && !technicianNotes.trim()) {
      setModalError('Please enter technician service completion report notes for verification.');
      return;
    }

    try {
      setSavingStatus(true);
      await api.updateLeadStatus(activeLead.id, {
        status: targetStatus,
        technicianNotes: technicianNotes.trim() || undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        rejectionReason: rejectionReason.trim() || undefined,
      });

      setActiveLead(null);
      fetchLeads();
      onLeadUpdated();
    } catch (err: any) {
      setModalError(err.message || 'Failed to update lead status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await api.exportCsv('referrals');
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
      {/* Title & Controls */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700 mb-1 font-bold">
            <span>SERVICE OPERATIONS</span>
            <span>&middot;</span>
            <span className="text-slate-500">Milestone Progression</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Lead Verification & Technician Dispatch
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Contact customers, assign technicians, and verify completed service to unlock the ₹100 ambassador reward.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            {exporting ? 'Exporting...' : 'Export Referrals CSV'}
          </button>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, mobile, ref ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 w-64"
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
            <option value="Payment Pending">Payment Pending (Verified)</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-900 font-mono">{leads.length}</strong> referral leads
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
              <th className="py-3 px-4">Referral ID</th>
              <th className="py-3 px-4">Ambassador</th>
              <th className="py-3 px-4">Customer Info</th>
              <th className="py-3 px-4">AC Service & Units</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Reward Eligibility</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                  {lead.referralId}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{lead.ambassadorName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{lead.ambassadorId}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{lead.customerName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">+91 {lead.customerPhone}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs">{lead.customerLocation}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-slate-800 font-medium">{lead.acServiceType}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{lead.acUnitsCount} unit(s)</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={getStatusTextClass(lead.status)}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {lead.rewardEligible ? (
                    <span className="text-[11px] font-bold text-emerald-700">
                      ✓ ₹100 Eligible
                    </span>
                  ) : lead.status === 'Rejected' ? (
                    <span className="text-[11px] text-slate-400">Not Eligible</span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium">
                      Needs Verification
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="p-1 rounded text-slate-400 hover:text-sky-700 cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {lead.status !== 'Paid' && lead.status !== 'Rejected' && (
                      <button
                        onClick={() => handleOpenActionModal(lead)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          lead.status === 'Service Scheduled'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-sky-800 border border-slate-300'
                        }`}
                      >
                        {lead.status === 'Service Scheduled'
                          ? 'Verify Service Done'
                          : 'Update Progress'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verification & Progression Modal */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lead Service Progression</h3>
                <p className="text-xs text-slate-500 font-mono">{activeLead.referralId} &middot; {activeLead.customerName}</p>
              </div>
              <button
                onClick={() => setActiveLead(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Status Progression <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetStatus}
                  onChange={e => setTargetStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="Contacted">Contacted (Customer phone call completed)</option>
                  <option value="Service Scheduled">Service Scheduled (Technician visit booked)</option>
                  <option value="Service Completed">Service Completed & Verified (Awards ₹100 Reward!)</option>
                  <option value="Rejected">Rejected (Invalid phone, cancelled, duplicate)</option>
                </select>
              </div>

              {targetStatus === 'Service Completed' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Super Admin Service Verification
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    By confirming Service Completed, you officially verify that the AC job was inspected and finished satisfactorily. The system will unlock the <strong>₹100 reward</strong> for Ambassador <strong>{activeLead.ambassadorName}</strong> and queue it for Super Admin manual payout.
                  </p>
                </div>
              )}

              {targetStatus === 'Service Scheduled' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Scheduled Service Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              {targetStatus !== 'Rejected' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Technician Report / Service Notes {targetStatus === 'Service Completed' && <span className="text-rose-500">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Jet pump wash performed, copper flare tightened, cooling temperature measured at 18°C."
                    value={technicianNotes}
                    onChange={e => setTechnicianNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              {targetStatus === 'Rejected' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Out of service area, customer already serviced by local shop, or duplicate submission."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingStatus ? 'Updating...' : 'Save & Update Progression'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
