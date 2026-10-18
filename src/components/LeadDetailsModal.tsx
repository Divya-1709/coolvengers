import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  FileText,
} from 'lucide-react';
import { ReferralLead, UserRole } from '../types/index.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lead: ReferralLead | null;
  currentUserRole?: UserRole;
  onVerifyService?: (lead: ReferralLead) => void;
}

export const LeadDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lead,
  currentUserRole,
  onVerifyService,
}) => {
  if (!isOpen || !lead) return null;

  const getStatusTextClass = (status: ReferralLead['status']) => {
    switch (status) {
      case 'New Lead':
        return 'text-sky-700 font-bold';
      case 'Contacted':
        return 'text-indigo-700 font-bold';
      case 'Service Scheduled':
        return 'text-amber-700 font-bold';
      case 'Service Completed':
      case 'Payment Pending':
        return 'text-emerald-700 font-extrabold';
      case 'Paid':
        return 'text-teal-700 font-extrabold';
      case 'Rejected':
        return 'text-rose-700 font-bold';
      default:
        return 'text-slate-700 font-semibold';
    }
  };

  // Determine milestone timeline steps
  const milestones = [
    {
      title: 'Lead Submitted',
      desc: `Submitted by Ambassador ${lead.ambassadorName} (${lead.ambassadorId})`,
      time: lead.createdAt,
      done: true,
      active: lead.status === 'New Lead',
    },
    {
      title: 'Contacted Customer',
      desc: 'Coolvengers staff contacted customer to assess AC problem & address',
      time: lead.status !== 'New Lead' ? lead.updatedAt : undefined,
      done: lead.status !== 'New Lead',
      active: lead.status === 'Contacted',
    },
    {
      title: 'Technician Visit Scheduled',
      desc: lead.scheduledDate
        ? `Service booked for ${new Date(lead.scheduledDate).toLocaleDateString()}`
        : 'Appointment scheduling in progress',
      time: lead.scheduledDate,
      done:
        lead.status === 'Service Scheduled' ||
        lead.status === 'Service Completed' ||
        lead.status === 'Payment Pending' ||
        lead.status === 'Paid',
      active: lead.status === 'Service Scheduled',
    },
    {
      title: 'Service Completed & Verified',
      desc: lead.rewardEligible
        ? `Verified completed. ₹100 reward unlocked!`
        : 'Pending technician on-site completion and admin inspection',
      time: lead.verifiedAt,
      done:
        lead.status === 'Service Completed' ||
        lead.status === 'Payment Pending' ||
        lead.status === 'Paid',
      active: lead.status === 'Service Completed' || lead.status === 'Payment Pending',
    },
    {
      title: 'Ambassador Payout Disbursed',
      desc: lead.paidAt
        ? `Settled via manual transfer. Payout Ref: ${lead.payoutId || 'Manual'}`
        : 'Disbursement queued in Super Admin payout ledger',
      time: lead.paidAt,
      done: lead.status === 'Paid',
      active: lead.status === 'Paid',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header (fixed at top) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 font-mono">{lead.referralId}</span>
                <span className={`text-xs ${getStatusTextClass(lead.status)}`}>
                  &bull; {lead.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Referred by <strong className="text-slate-800">{lead.ambassadorName}</strong> ({lead.ambassadorId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Customer & Service Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Customer Details</span>
              <div className="flex items-center gap-2 text-slate-900">
                <User className="w-4 h-4 text-sky-600" />
                <span className="font-semibold text-sm">{lead.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-sky-600" />
                <span className="font-mono">+91 {lead.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>{lead.customerLocation}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-3 sm:pt-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Service Scope</span>
              <p className="font-bold text-sky-800 text-sm">{lead.acServiceType}</p>
              <p className="text-slate-700">
                Units Count: <strong className="text-slate-900 font-mono">{lead.acUnitsCount} unit(s)</strong>
              </p>
              {lead.customerNotes && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                  "{lead.customerNotes}"
                </div>
              )}
            </div>
          </div>

          {/* Reward Eligibility Callout */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                ₹
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Referral Reward: <span className="font-mono text-sky-700">₹{lead.rewardAmount}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {lead.rewardEligible
                    ? 'Eligible for payout. Awarded upon service completion.'
                    : 'Reward unlocks immediately once Super Admin verifies completed job.'}
                </div>
              </div>
            </div>

            <div>
              {lead.status === 'Paid' ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  Paid & Settled
                </span>
              ) : lead.rewardEligible ? (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                  Payout Pending
                </span>
              ) : (
                <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                  Awaiting Service
                </span>
              )}
            </div>
          </div>

          {/* Rejection notice if any */}
          {lead.status === 'Rejected' && lead.rejectionReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-800">
              <span className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertCircle className="w-4 h-4" />
                Referral Rejected:
              </span>
              <p className="text-[11px]">{lead.rejectionReason}</p>
            </div>
          )}

          {/* Technician Verification Notes if available */}
          {lead.technicianNotes && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-600" />
                Technician / Admin Service Notes:
              </span>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {lead.technicianNotes}
              </p>
            </div>
          )}

          {/* Milestone Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Lifecycle Milestone Progression
            </h4>
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5">
                    {m.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-100" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${m.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {m.title}
                      </span>
                      {m.time && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(m.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${m.done ? 'text-slate-600' : 'text-slate-400'}`}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 truncate mr-2">
            {currentUserRole === 'SUPER_ADMIN'
              ? 'Super Admin operations console'
              : `Status: ${lead.status}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            {currentUserRole === 'SUPER_ADMIN' && lead.status !== 'Paid' && lead.status !== 'Rejected' && (
              <button
                onClick={() => onVerifyService?.(lead)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                Manage Status / Verify Service
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
