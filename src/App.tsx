import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Wrench,
  Receipt,
  Users,
  FileText,
  Wind,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { User, ReferralLead } from './types/index.js';
import { api } from './services/api.js';
import { Header } from './components/Header.js';
import { HomePage } from './components/HomePage.js';
import { AmbassadorDashboard } from './components/AmbassadorDashboard.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { AdminPayoutManagement } from './components/AdminPayoutManagement.js';
import { AdminLeadVerification } from './components/AdminLeadVerification.js';
import { PayoutAuditHistory } from './components/PayoutAuditHistory.js';
import { AmbassadorDirectory } from './components/AmbassadorDirectory.js';
import { AuditTrailView } from './components/AuditTrailView.js';
import { LeadSubmissionModal } from './components/LeadSubmissionModal.js';
import { PayoutSetupModal } from './components/PayoutSetupModal.js';
import { LeadDetailsModal } from './components/LeadDetailsModal.js';
import { LoginModal } from './components/LoginModal.js';
import { CoolvengersLogo } from './components/CoolvengersLogo.js';

type ViewMode = 'HOME' | 'PORTAL';
type AdminTab = 'DASHBOARD' | 'PAYOUTS' | 'VERIFICATION' | 'AUDIT_LEDGER' | 'AMBASSADORS' | 'SYSTEM_LOGS';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Active view: 'HOME' or 'PORTAL'
  const [currentView, setCurrentView] = useState<ViewMode>('HOME');

  // Admin active tab
  const [adminTab, setAdminTab] = useState<AdminTab>('DASHBOARD');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPayoutSetup, setShowPayoutSetup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedLead, setSelectedLead] = useState<ReferralLead | null>(null);

  // Global refresh counter for synced updates
  const [refreshKey, setRefreshKey] = useState(0);

  const openLogin = () => {
    setLoginModalMode('LOGIN');
    setShowLoginModal(true);
  };

  const openRegister = () => {
    setLoginModalMode('REGISTER');
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    api.setUserId(null);
    setCurrentUser(null);
    setCurrentView('HOME');
  };

  const loadCurrentUser = async () => {
    try {
      const uid = api.getUserId();
      if (!uid) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await api.getCurrentUser();
      setCurrentUser(res.user);
    } catch (err) {
      console.warn('Failed to load user session:', err);
      api.setUserId(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, [refreshKey]);

  const handleUserChange = (newUser: User) => {
    api.setUserId(newUser.id);
    setCurrentUser(newUser);
    setCurrentView('PORTAL');
    if (newUser.role === 'SUPER_ADMIN') {
      setAdminTab('DASHBOARD');
    }
    setRefreshKey(prev => prev + 1);
  };

  if (loading && api.getUserId()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <Wind className="w-6 h-6 animate-spin text-sky-600" />
          <span className="text-sm font-semibold text-slate-800">
            Loading Coolvengers Aircons...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenLeadModal={() => setShowSubmitModal(true)}
        onOpenPayoutSetup={() => setShowPayoutSetup(true)}
        onOpenLoginModal={openLogin}
        onLogout={handleLogout}
      />

      {/* Super Admin Command Navigation Bar (shown when viewing portal as Super Admin) */}
      {currentView === 'PORTAL' && currentUser && currentUser.role === 'SUPER_ADMIN' && (
        <div className="bg-white border-b border-slate-200/90 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-sky-700">
                SUPER ADMIN COMMAND CENTER &middot; ALL OPERATIONS & PAYOUTS
              </span>
              <button
                onClick={() => setCurrentView('HOME')}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                &larr; Back to Website Home
              </button>
            </div>
            <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
              <button
                onClick={() => setAdminTab('DASHBOARD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'DASHBOARD'
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
                Operations Dashboard
              </button>

              <button
                onClick={() => setAdminTab('PAYOUTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'PAYOUTS'
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                Payout Management
              </button>

              <button
                onClick={() => setAdminTab('VERIFICATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'VERIFICATION'
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-sky-600" />
                Service Verification & Leads
              </button>

              <button
                onClick={() => setAdminTab('AUDIT_LEDGER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'AUDIT_LEDGER'
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                Payout Audit Ledger
              </button>

              <button
                onClick={() => setAdminTab('AMBASSADORS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'AMBASSADORS'
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Ambassador Roster
              </button>

              <button
                onClick={() => setAdminTab('SYSTEM_LOGS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'SYSTEM_LOGS'
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Security Logs
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'HOME' ? (
          <HomePage
            currentUser={currentUser}
            onOpenLogin={openLogin}
            onOpenRegister={openRegister}
            onGoToPortal={() => setCurrentView('PORTAL')}
            onOpenSubmitLead={() => setShowSubmitModal(true)}
            onLogout={handleLogout}
          />
        ) : (
          <>
            {/* View Breadcrumb / Switcher */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentView('HOME')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                &larr; Back to Coolvengers Home Page
              </button>
              <span className="text-xs text-slate-500 font-mono">
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin Mode' : 'Ambassador Club'}
              </span>
            </div>

            {/* Ambassador View */}
            {currentUser?.role === 'AMBASSADOR' && (
              <AmbassadorDashboard
                key={`amb_${refreshKey}`}
                currentUser={currentUser}
                onOpenSubmitLead={() => setShowSubmitModal(true)}
                onOpenPayoutSetup={() => setShowPayoutSetup(true)}
                onSelectLead={lead => setSelectedLead(lead)}
              />
            )}

            {/* Super Admin View */}
            {currentUser && currentUser.role === 'SUPER_ADMIN' && (
              <>
                {adminTab === 'DASHBOARD' && (
                  <AdminDashboard
                    key={`dash_${refreshKey}`}
                    onSelectLead={lead => setSelectedLead(lead)}
                    onNavigateTab={tab => setAdminTab(tab)}
                    onRefresh={() => setRefreshKey(prev => prev + 1)}
                  />
                )}

                {adminTab === 'PAYOUTS' && (
                  <AdminPayoutManagement
                    key={`payout_${refreshKey}`}
                    onPayoutCompleted={() => setRefreshKey(prev => prev + 1)}
                    onSelectLead={lead => setSelectedLead(lead)}
                  />
                )}

                {adminTab === 'VERIFICATION' && (
                  <AdminLeadVerification
                    key={`verif_${refreshKey}`}
                    currentUserRole={currentUser.role}
                    onSelectLead={lead => setSelectedLead(lead)}
                    onLeadUpdated={() => setRefreshKey(prev => prev + 1)}
                  />
                )}

                {adminTab === 'AUDIT_LEDGER' && (
                  <PayoutAuditHistory key={`hist_${refreshKey}`} />
                )}

                {adminTab === 'AMBASSADORS' && (
                  <AmbassadorDirectory key={`dir_${refreshKey}`} />
                )}

                {adminTab === 'SYSTEM_LOGS' && (
                  <AuditTrailView key={`audit_${refreshKey}`} />
                )}
              </>
            )}

            {/* Unauthenticated Portal View */}
            {!currentUser && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Authentication Required</h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Sign in to access your authorized workspace. Registered Ambassadors access personal referral earnings, while Super Admins access operational verifications and audited payouts.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={openLogin}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In (Admin / Ambassador)
                  </button>
                  <button
                    onClick={openRegister}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
                  >
                    Register as Ambassador (Earn ₹100)
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Single Unified Official Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white pt-10 pb-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Logo */}
            <div className="space-y-3">
              <CoolvengersLogo size="md" animated={false} />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Leading AC service provider in Chennai specializing in installation, maintenance, and repair for split &amp; window air conditioners.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Working Hours: 10:00 AM &ndash; 6:00 PM (Mon-Sat)
              </div>
            </div>

            {/* Col 2: Services */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Services
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-500">
                <li>
                  <a
                    href="#services"
                    onClick={() => setCurrentView('HOME')}
                    className="hover:text-sky-600 transition-colors"
                  >
                    AC Installation &amp; Relocation
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={() => setCurrentView('HOME')}
                    className="hover:text-sky-600 transition-colors"
                  >
                    AC Deep Cleaning &amp; Jet Pump Wash
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={() => setCurrentView('HOME')}
                    className="hover:text-sky-600 transition-colors"
                  >
                    Gas Refilling &amp; Leakage Arrest
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={() => setCurrentView('HOME')}
                    className="hover:text-sky-600 transition-colors"
                  >
                    Diagnostics &amp; PCB Repair
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={() => setCurrentView('HOME')}
                    className="hover:text-sky-600 transition-colors"
                  >
                    Duct Cleaning &amp; Air Quality
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={() => setCurrentView('HOME')}
                    className="hover:text-sky-600 transition-colors"
                  >
                    Annual Maintenance (AMC)
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Ambassador Club */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Ambassador Club
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Refer customers who need AC services in Chennai. Earn ₹100 direct cash reward upon verified service completion.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCurrentView('PORTAL');
                    if (!currentUser) openLogin();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Ambassador Login &rarr;
                </button>
                <button
                  onClick={openRegister}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                >
                  Register (Earn ₹100)
                </button>
              </div>
            </div>

            {/* Col 4: Chennai Contact */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Chennai Office &amp; Workshop
              </span>
              <div className="space-y-2 text-[11px] text-slate-500">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>Plot No. 14, 2nd Main Road, Madipakkam, Chennai &ndash; 600091</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <a
                    href="tel:+916380873802"
                    className="font-mono font-medium text-slate-700 hover:text-sky-600 transition-colors"
                  >
                    +91 63808 73802 / 91767 73802
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <a
                    href="mailto:gokul@coolvengers.in"
                    className="font-mono hover:text-sky-600 transition-colors"
                  >
                    gokul@coolvengers.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} Coolvengers Aircons. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Madipakkam &middot; Velachery &middot; OMR &middot; Chennai</span>
              <span>&bull;</span>
              <span>Manual Audited Payouts &bull; ₹100 Reward</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LeadSubmissionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      {currentUser && currentUser.role === 'AMBASSADOR' && (
        <PayoutSetupModal
          isOpen={showPayoutSetup}
          onClose={() => setShowPayoutSetup(false)}
          currentUser={currentUser}
          onSuccess={updated => {
            setCurrentUser(updated);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      <LeadDetailsModal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        currentUserRole={currentUser?.role}
        onVerifyService={() => {
          setSelectedLead(null);
          setCurrentView('PORTAL');
          setAdminTab('VERIFICATION');
          setRefreshKey(prev => prev + 1);
        }}
      />

      <LoginModal
        isOpen={showLoginModal}
        initialMode={loginModalMode}
        onClose={() => setShowLoginModal(false)}
        onSuccess={newUser => {
          handleUserChange(newUser);
        }}
      />
    </div>
  );
}
