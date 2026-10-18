import React, { useState } from 'react';
import { X, CreditCard, QrCode, AlertCircle, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { api } from '../services/api.js';
import { PayoutMethodType, User } from '../types/index.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: (updatedUser: User) => void;
}

export const PayoutSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const existingPayout = currentUser.payoutDetails;

  const [method, setMethod] = useState<PayoutMethodType>(existingPayout?.method || 'UPI');
  const [upiId, setUpiId] = useState(existingPayout?.upiId || '');

  const [accountHolderName, setAccountHolderName] = useState(
    existingPayout?.bankDetails?.accountHolderName || currentUser.name || ''
  );
  const [accountNumber, setAccountNumber] = useState(
    existingPayout?.bankDetails?.accountNumber || ''
  );
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    existingPayout?.bankDetails?.accountNumber || ''
  );
  const [ifscCode, setIfscCode] = useState(
    existingPayout?.bankDetails?.ifscCode || ''
  );
  const [bankName, setBankName] = useState(
    existingPayout?.bankDetails?.bankName || ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Super Admins do not configure referral payout methods
  if (currentUser.role === 'SUPER_ADMIN') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-4 my-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Admin Authorization Restriction</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Super Admin accounts do not receive referral rewards and cannot configure payout destinations. Payout destinations are configured exclusively by registered Coolvengers Ambassadors.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (method === 'UPI') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi || !cleanUpi.includes('@')) {
        setError('Please enter a valid UPI VPA ID (e.g. name@oksbi, mobile@paytm).');
        return;
      }
    } else {
      if (!accountHolderName.trim()) {
        setError('Account holder name is required.');
        return;
      }
      if (!accountNumber.trim() || accountNumber.length < 8) {
        setError('Please enter a valid bank account number.');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setError('Account number and confirm account number do not match.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length !== 11) {
        setError('Please enter a valid 11-character Indian IFSC code (e.g. HDFC0000123).');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await api.updatePayoutDetails({
        method,
        upiId: method === 'UPI' ? upiId.trim() : undefined,
        bankDetails:
          method === 'BANK_TRANSFER'
            ? {
                accountHolderName: accountHolderName.trim(),
                accountNumber: accountNumber.trim(),
                ifscCode: ifscCode.trim().toUpperCase(),
                bankName: bankName.trim() || 'Indian Scheduled Bank',
              }
            : undefined,
      });

      setSuccessMsg('Preferred payout details saved successfully!');
      onSuccess(res.user);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update payout details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Preferred Payout Destination</h3>
              <p className="text-xs text-slate-500">Receive manual payments for verified referrals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Payout Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  method === 'UPI'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Instant UPI VPA</div>
                  <div className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('BANK_TRANSFER')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  method === 'BANK_TRANSFER'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Bank Transfer</div>
                  <div className="text-[10px] text-slate-500">IMPS / NEFT directly to account</div>
                </div>
              </button>
            </div>
          </div>

          {method === 'UPI' ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI VPA ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <QrCode className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul.sharma@okhdfcbank or 9876543210@paytm"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  The Super Admin will copy this UPI ID to disburse ₹100 per verified referral
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Holder Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={accountHolderName}
                  onChange={e => setAccountHolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="5010029182910"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter Account Number"
                    value={confirmAccountNumber}
                    onChange={e => setConfirmAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="HDFC0000412"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono uppercase focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name & Branch (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, Indiranagar"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-200/80 flex items-center gap-2 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              Disbursements are manually verified and processed by the Super Admin. No auto-debit or card permissions are ever requested.
            </span>
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
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Payout Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
