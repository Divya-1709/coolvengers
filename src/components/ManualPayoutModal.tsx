import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  Copy,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ReferralLead, AmbassadorSummary, PayoutRecord } from '../types/index.js';
import { api } from '../services/api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ambassador: AmbassadorSummary | null;
  onSuccess: (payout: PayoutRecord) => void;
}

export const ManualPayoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ambassador,
  onSuccess,
}) => {
  if (!isOpen || !ambassador) return null;

  const [selectedReferralIds, setSelectedReferralIds] = useState<string[]>(
    ambassador.pendingLeads.map(l => l.referralId)
  );

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER'>(
    ambassador.payoutDetails?.method || 'UPI'
  );
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [adminNotes, setAdminNotes] = useState('');
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Keep selected ids synchronized when modal opens
  useEffect(() => {
    setSelectedReferralIds(ambassador.pendingLeads.map(l => l.referralId));
    setPaymentMethod(ambassador.payoutDetails?.method || 'UPI');
    setError(null);
    setTransferConfirmed(false);
    setTransactionRef('');
  }, [ambassador]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleReferral = (refId: string) => {
    if (selectedReferralIds.includes(refId)) {
      setSelectedReferralIds(selectedReferralIds.filter(id => id !== refId));
    } else {
      setSelectedReferralIds([...selectedReferralIds, refId]);
    }
  };

  const selectAll = () => {
    setSelectedReferralIds(ambassador.pendingLeads.map(l => l.referralId));
  };

  const selectNone = () => {
    setSelectedReferralIds([]);
  };

  const calculatedAmount = selectedReferralIds.length * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedReferralIds.length === 0) {
      setError('Please select at least one referral lead to disburse.');
      return;
    }

    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      setError('Please enter a valid Transaction Reference or Bank UTR Number.');
      return;
    }

    if (!transferConfirmed) {
      setError('You must confirm that the manual transfer has been executed before saving.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.recordManualPayout({
        ambassadorId: ambassador.ambassadorId,
        referralIds: selectedReferralIds,
        paymentMethod,
        transactionRef: transactionRef.trim(),
        paymentDate,
        amount: calculatedAmount,
        adminNotes: adminNotes.trim(),
        transferConfirmed: true,
      });

      onSuccess(res.payout);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record manual payout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Record Manual Payout</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {ambassador.ambassadorId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Disburse verified referral earnings for <strong>{ambassador.ambassadorName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Section 1: Ambassador Payout Account Destination (Copy-Paste for Banking App) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                {ambassador.payoutDetails?.method === 'UPI' ? (
                  <QrCode className="w-4 h-4 text-sky-600" />
                ) : (
                  <Building className="w-4 h-4 text-sky-600" />
                )}
                Beneficiary Transfer Destination
              </span>
              <span className="text-[11px] text-slate-500">
                Mode: <strong>{ambassador.payoutDetails?.method || 'Not Set'}</strong>
              </span>
            </div>

            {ambassador.payoutDetails?.method === 'UPI' ? (
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Ambassador UPI ID (VPA)</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{ambassador.payoutDetails.upiId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(ambassador.payoutDetails?.upiId || '', 'upi')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-600" />
                  {copiedField === 'upi' ? 'Copied!' : 'Copy UPI'}
                </button>
              </div>
            ) : ambassador.payoutDetails?.method === 'BANK_TRANSFER' && ambassador.payoutDetails.bankDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Account Holder</span>
                    <p className="font-semibold text-slate-900 truncate">
                      {ambassador.payoutDetails.bankDetails.accountHolderName}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Account Number</span>
                    <p className="font-mono font-bold text-slate-900">
                      {ambassador.payoutDetails.bankDetails.accountNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ambassador.payoutDetails?.bankDetails?.accountNumber || '', 'acc')}
                    className="p-1 hover:text-sky-600 cursor-pointer"
                    title="Copy Account Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">IFSC Code</span>
                    <p className="font-mono font-bold text-slate-900">
                      {ambassador.payoutDetails.bankDetails.ifscCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ambassador.payoutDetails?.bankDetails?.ifscCode || '', 'ifsc')}
                    className="p-1 hover:text-sky-600 cursor-pointer"
                    title="Copy IFSC Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase">Bank Name</span>
                  <p className="text-slate-800 truncate">{ambassador.payoutDetails.bankDetails.bankName}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Ambassador has not yet configured their UPI or Bank Account details. You can contact them at{' '}
                  <strong className="font-mono">{ambassador.phone}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Referral Leads Selection (Prevents Duplication) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Select Verified Referrals to Include in this Payout:
              </span>
              <div className="space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                >
                  Select All ({ambassador.pendingLeads.length})
                </button>
                <span>&middot;</span>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
              {ambassador.pendingLeads.map(lead => {
                const isSelected = selectedReferralIds.includes(lead.referralId);
                return (
                  <div
                    key={lead.id}
                    onClick={() => toggleReferral(lead.referralId)}
                    className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <span className="font-mono font-bold text-sky-700 mr-2">{lead.referralId}</span>
                        <span className="text-slate-800 font-medium">{lead.customerName}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({lead.acServiceType})</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">₹100</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Transfer Calculation Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Selected Referrals:</span>
              <div className="font-bold text-slate-900 text-sm">
                {selectedReferralIds.length} job(s) &times; ₹100
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">Total Payable Amount:</span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 tabular-nums">
                ₹{calculatedAmount}
              </div>
            </div>
          </div>

          {/* Section 4: Manual Transfer Audit Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank UTR / UPI Transaction Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 429182910481 or UPI/4291829"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Must be the authentic reference from your bank app
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Execution Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Super Admin Audit Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via HDFC Corporate net banking by Vikramaditya"
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          {/* Section 5: Mandatory Checkbox Confirmation */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-amber-900">
              <input
                type="checkbox"
                required
                checked={transferConfirmed}
                onChange={e => setTransferConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-amber-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="leading-relaxed">
                I hereby confirm that I have manually executed the transfer of <strong>₹{calculatedAmount}</strong> to{' '}
                <strong>{ambassador.ambassadorName}</strong> via external banking/UPI and verified the UTR.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedReferralIds.length === 0 || !transferConfirmed}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? 'Recording...' : `Record Manual Payout (₹${calculatedAmount})`}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
