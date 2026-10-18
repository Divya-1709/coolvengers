import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, ShieldCheck, UserCheck, QrCode, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { User, PayoutMethodType } from '../types/index.js';
import { CoolvengersLogo } from './CoolvengersLogo.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'LOGIN',
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'REGISTER');

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'REGISTER');
      setError(null);
    }
  }, [isOpen, initialMode]);

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Login field
  const [loginEmail, setLoginEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (payoutMethod === 'UPI') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi) {
        setError('Please provide your UPI ID to receive ₹100 referral rewards.');
        return;
      }
      if (!cleanUpi.includes('@') || cleanUpi.length < 5) {
        setError('Please provide a valid UPI VPA ID (e.g. name@okhdfcbank, 9876543210@paytm).');
        return;
      }
    } else if (payoutMethod === 'BANK_TRANSFER') {
      if (!accountNumber.trim() || accountNumber.trim().length < 8) {
        setError('Please provide a valid bank account number (min 8 digits).');
        return;
      }
      if (!bankName.trim()) {
        setError('Please provide your Bank Name (e.g. HDFC Bank, SBI, ICICI).');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length !== 11) {
        setError('Please provide a valid 11-character Indian IFSC code (e.g. HDFC0000123).');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await api.registerAmbassador({
        name: name.trim(),
        email: email.trim(),
        phone: `+91 ${cleanPhone}`,
        payoutMethod,
        upiId: payoutMethod === 'UPI' ? upiId.trim() : undefined,
        bankDetails:
          payoutMethod === 'BANK_TRANSFER'
            ? {
                accountHolderName: accountHolderName.trim() || name.trim(),
                accountNumber: accountNumber.trim(),
                ifscCode: ifscCode.trim().toUpperCase(),
                bankName: bankName.trim(),
              }
            : undefined,
      });

      api.setUserId(res.user.id);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await api.login(loginEmail.trim());
      api.setUserId(res.user.id);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Try one of the test accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setError(null);
    try {
      setLoading(true);
      const res = await api.login(userEmail);
      api.setUserId(res.user.id);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <CoolvengersLogo size="sm" showWordmark={true} showSubtitle={false} animated={true} />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 p-1 shrink-0">
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isRegister
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register Ambassador
          </button>
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              !isRegister
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In (Admin / Ambassador)
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {isRegister ? (
          <form onSubmit={handleRegister} className="p-6 space-y-3.5 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Raina"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="suresh@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Payout Destination Section */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Payout Method for Rewards <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-bold border border-sky-200">
                  ₹100 / Verified Lead
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Provide your payout account to receive referral rewards upon verified AC job completion:
              </p>

              {/* Method Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('UPI')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    payoutMethod === 'UPI'
                      ? 'bg-sky-50 text-sky-900 border-sky-400 font-bold shadow-xs ring-1 ring-sky-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-sky-600" />
                  <span>UPI ID (Instant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('BANK_TRANSFER')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    payoutMethod === 'BANK_TRANSFER'
                      ? 'bg-sky-50 text-sky-900 border-sky-400 font-bold shadow-xs ring-1 ring-sky-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Bank Account</span>
                </button>
              </div>

              {payoutMethod === 'UPI' ? (
                <div className="space-y-2 p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Your UPI VPA ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <QrCode className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. suresh.raina@okhdfcbank or 9876543210@paytm"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value.trim().toLowerCase())}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* UPI Suffix Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400">Popular:</span>
                    {['@okhdfcbank', '@okaxis', '@okicici', '@paytm', '@ybl'].map(handle => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => {
                          const base = upiId.includes('@') ? upiId.split('@')[0] : upiId;
                          setUpiId((base || 'yourname') + handle);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition-colors cursor-pointer font-mono"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    Instant ₹100 direct transfer via Google Pay, PhonePe, Paytm, or BHIM.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Account Holder Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Raina"
                      value={accountHolderName || name}
                      onChange={e => setAccountHolderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Bank Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC Bank, SBI"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        IFSC Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        placeholder="e.g. HDFC0000123"
                        value={ifscCode}
                        onChange={e => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Bank Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50100234567890"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    Audited manual NEFT/IMPS transfers processed with transaction UTR ledger.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              A unique Ambassador ID (e.g. CV-AMB-100X) is automatically generated upon enrollment.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Enroll as Coolvengers Ambassador'}
            </button>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address or Ambassador ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rahul.sharma@gmail.com or CV-AMB-1001"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Access Buttons - Super Admin and Ambassador */}
            <div className="border-t border-slate-100 pt-4">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick One-Click Sign In
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@coolvengers.com')}
                  className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Vikramaditya (Super Admin)</div>
                      <div className="text-[10px] text-slate-500">All Operations, Verifications & Payouts</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('rahul.sharma@gmail.com')}
                  className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Rahul Sharma (Ambassador)</div>
                      <div className="text-[10px] text-slate-500">ID: CV-AMB-1001 &middot; Active Referrals & Earnings</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
