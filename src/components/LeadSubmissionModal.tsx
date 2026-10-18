import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Sparkles, Building2, Phone, User, Wrench, Copy, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { ReferralLead, User as AppUser } from '../types/index.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  onSuccess: (lead: ReferralLead) => void;
}

const AC_SERVICES = [
  'AC Deep Cleaning (Jet Pump)',
  'AC Installation / Relocation',
  'AC Gas Refill & Leak Repair',
  'AC Not Cooling / General Diagnostics',
  'PCB Board Repair / Replacement',
  'Annual Maintenance Contract (AMC)',
];

const POPULAR_LOCALITIES = [
  'Madipakkam',
  'Velachery',
  'Pallikaranai',
  'Medavakkam',
  'Thoraipakkam (OMR)',
  'Sholinganallur',
  'Perungudi',
  'Tambaram',
  'Chromepet',
  'Adambakkam',
  'Nanganallur',
  'Guindy',
];

export const LeadSubmissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [acServiceType, setAcServiceType] = useState(AC_SERVICES[0]);
  const [acUnitsCount, setAcUnitsCount] = useState<number>(1);
  const [customerNotes, setCustomerNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLead, setCreatedLead] = useState<ReferralLead | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Enforce role separation: Super Admins verify jobs and disburse payouts, they do not submit ambassador referrals
  if (currentUser?.role === 'SUPER_ADMIN') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-4 my-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Admin Authorization Restriction</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Super Admin accounts manage technician verifications and manual payouts. Submitting referral leads is reserved strictly for registered Coolvengers Ambassadors to prevent self-referral and audit conflicts.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Return to Admin Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit customer mobile number.');
      return;
    }

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!customerLocation.trim()) {
      setError('Customer location / area is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitLead({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerLocation: customerLocation.trim(),
        acServiceType,
        acUnitsCount: Number(acUnitsCount) || 1,
        customerNotes: customerNotes.trim() || undefined,
      });

      setCreatedLead(res.lead);
      onSuccess(res.lead);
    } catch (err: any) {
      setError(err.message || 'Failed to submit referral lead.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (createdLead) {
      navigator.clipboard.writeText(createdLead.referralId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setCreatedLead(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerLocation('');
    setCustomerNotes('');
    setAcUnitsCount(1);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Submit AC Referral Lead</h3>
              <p className="text-xs text-slate-500">Earn ₹100 upon verified AC service completion</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {createdLead ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">Referral Registered Successfully!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Your lead for <strong className="text-slate-900">{createdLead.customerName}</strong> has been logged in the system.
              </p>
            </div>

            {/* Unique Referral ID card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between max-w-sm mx-auto">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Unique Referral ID</span>
                <p className="text-xl font-mono font-bold text-sky-700 tracking-wider">
                  {createdLead.referralId}
                </p>
              </div>
              <button
                onClick={handleCopyId}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-sky-600" />
                {copied ? 'Copied!' : 'Copy ID'}
              </button>
            </div>

            {/* Next Steps Guide */}
            <div className="text-left p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs space-y-2 text-slate-700">
              <span className="font-bold text-sky-900 block">What happens next?</span>
              <div className="space-y-1.5 text-[11px] leading-relaxed">
                <p>1. Our team contacts customer within 30 minutes to schedule visit.</p>
                <p>2. Coolvengers certified technician completes the AC service.</p>
                <p>3. Super Admin verifies completion &rarr; <strong>₹100 reward unlocked</strong> for manual payout.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Done / Submit Another Lead
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Duplicates prevented automatically
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Location / Area in Chennai <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-500">Chennai &amp; suburbs</span>
              </div>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 14, 2nd Main Road, Madipakkam, Chennai"
                  value={customerLocation}
                  onChange={e => setCustomerLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              {/* Quick locality pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400">Quick picks:</span>
                {POPULAR_LOCALITIES.slice(0, 6).map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setCustomerLocation(loc)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required AC Service <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Wrench className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={acServiceType}
                    onChange={e => setAcServiceType(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    {AC_SERVICES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Units Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={acUnitsCount}
                  onChange={e => setAcUnitsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Requirement Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Split AC in master bedroom not cooling, water dripping from indoor unit. Preferred time: Weekend morning."
                value={customerNotes}
                onChange={e => setCustomerNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-700">Commission after service verification:</span>
              <span className="text-sky-800 font-bold font-mono text-sm">₹100 reward</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Register Referral'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
