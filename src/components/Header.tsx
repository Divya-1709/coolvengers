import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, PlusCircle, Check, LogIn, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';
import { NotificationDropdown } from './NotificationDropdown.js';
import { CoolvengersLogo } from './CoolvengersLogo.js';

interface Props {
  currentView: 'HOME' | 'PORTAL';
  onNavigate: (view: 'HOME' | 'PORTAL') => void;
  currentUser: User | null;
  onUserChange: (user: User) => void;
  onOpenLeadModal: () => void;
  onOpenPayoutSetup: () => void;
  onOpenLoginModal: () => void;
  onLogout?: () => void;
}

type NavItem = 'home' | 'services' | 'portal' | 'book-service';

export const Header: React.FC<Props> = ({
  currentView,
  onNavigate,
  currentUser,
  onUserChange,
  onOpenLeadModal,
  onOpenPayoutSetup,
  onOpenLoginModal,
  onLogout,
}) => {
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItem>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#services') return 'services';
      if (window.location.hash === '#book-service') return 'book-service';
    }
    return currentView === 'PORTAL' ? 'portal' : 'home';
  });

  const isClickingRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getDemoUsers().then(res => setDemoUsers(res.users)).catch(console.error);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync active nav item with current view and scroll position on HOME
  useEffect(() => {
    if (currentView === 'PORTAL') {
      setActiveNav('portal');
      return;
    }

    const handleScroll = () => {
      if (isClickingRef.current) return;
      if (currentView !== 'HOME') return;

      const scrollPos = window.scrollY + 140;
      const servicesEl = document.getElementById('services');
      const bookServiceEl = document.getElementById('book-service');

      const bookServiceTop = bookServiceEl ? bookServiceEl.offsetTop : Infinity;
      const servicesTop = servicesEl ? servicesEl.offsetTop : Infinity;

      if (scrollPos >= bookServiceTop - 60) {
        setActiveNav('book-service');
      } else if (scrollPos >= servicesTop - 60) {
        setActiveNav('services');
      } else {
        setActiveNav('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const performScroll = (target: 'home' | 'services' | 'book-service') => {
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        try {
          history.replaceState(null, '', window.location.pathname);
        } catch {}
      }
    } else if (target === 'services') {
      const el = document.getElementById('services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        try {
          history.replaceState(null, '', '#services');
        } catch {}
      }
    } else if (target === 'book-service') {
      const el = document.getElementById('book-service');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        try {
          history.replaceState(null, '', '#book-service');
        } catch {}
      }
    }
  };

  const handleNavClick = (target: NavItem) => {
    setActiveNav(target);
    setShowMobileMenu(false);
    isClickingRef.current = true;
    setTimeout(() => {
      isClickingRef.current = false;
    }, 850);

    if (target === 'portal') {
      onNavigate('PORTAL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'HOME') {
      onNavigate('HOME');
      setTimeout(() => {
        performScroll(target);
      }, 80);
    } else {
      performScroll(target);
    }
  };

  const getNavClass = (item: NavItem) => {
    const isActive = activeNav === item;
    return `transition-all duration-200 whitespace-nowrap cursor-pointer py-1 text-xs font-semibold border-b-2 ${
      isActive
        ? 'text-sky-600 font-bold border-sky-600'
        : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
    }`;
  };

  const getRoleText = (role: User['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'AMBASSADOR':
      default:
        return 'Ambassador';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark with Coolvengers Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 shrink-0 text-left cursor-pointer group focus:outline-hidden"
          >
            <CoolvengersLogo size="md" animated={true} />
          </button>

          {/* Zone 2: Navigation Links with Active Blue Color Indicator */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => handleNavClick('home')}
              className={getNavClass('home')}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('services')}
              className={getNavClass('services')}
            >
              Services
            </button>

            <button
              onClick={() => handleNavClick('portal')}
              className={`flex items-center gap-1.5 ${getNavClass('portal')}`}
            >
              <span>{currentUser?.role === 'SUPER_ADMIN' ? 'Admin Console' : 'Ambassador Club'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold border transition-colors ${
                  activeNav === 'portal'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : currentUser?.role === 'SUPER_ADMIN'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}
              >
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Earn ₹100'}
              </span>
            </button>

            {currentUser?.role !== 'SUPER_ADMIN' && (
              <button
                onClick={() => handleNavClick('book-service')}
                className={getNavClass('book-service')}
              >
                Book Service
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & User Switcher / Login */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Direct Login Button when requested */}
            {!currentUser ? (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </button>
            ) : (
              <>
                {currentView === 'PORTAL' && currentUser.role === 'AMBASSADOR' && (
                  <button
                    onClick={onOpenLeadModal}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Submit Lead
                  </button>
                )}

                {/* View Switcher button if on HOME */}
                {currentView === 'HOME' && (
                  <button
                    onClick={() => handleNavClick('portal')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {currentUser.role === 'SUPER_ADMIN' ? 'Admin Console' : 'Ambassador Portal'}
                  </button>
                )}

                {/* Notification Bell */}
                <NotificationDropdown />

                {/* User Profile Selector */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors text-left cursor-pointer"
                    aria-expanded={showUserMenu}
                  >
                    <div className="w-7 h-7 rounded-md bg-white border border-slate-300 flex items-center justify-center text-sky-700 font-bold text-xs shadow-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {currentUser.ambassadorId} &middot; {getRoleText(currentUser.role)}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                        <div className="mt-1 text-[11px] text-slate-600">
                          ID: <span className="font-mono text-sky-600 font-semibold">{currentUser.ambassadorId}</span> &middot; {getRoleText(currentUser.role)}
                        </div>

                        {currentUser.role === 'AMBASSADOR' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Payout method:</span>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onOpenPayoutSetup();
                              }}
                              className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] underline cursor-pointer"
                            >
                              {currentUser.payoutDetails?.method
                                ? `${currentUser.payoutDetails.method} Active`
                                : 'Configure'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Switch Account (Demo Selector) */}
                      <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch User Account
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {demoUsers.map(u => {
                          const isActive = currentUser.id === u.id;
                          return (
                            <button
                              key={u.id}
                              onClick={() => {
                                api.setUserId(u.id);
                                onUserChange(u);
                                setShowUserMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-sky-50 text-sky-900 font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="truncate">
                                <div className="truncate font-medium">{u.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {u.ambassadorId} &middot; {getRoleText(u.role)}
                                </div>
                              </div>
                              {isActive && <Check className="w-4 h-4 text-sky-600 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-2 border-t border-slate-100 mt-1 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenLoginModal();
                          }}
                          className="flex-1 text-center py-1.5 text-xs text-sky-600 hover:bg-slate-50 rounded font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Switch / Sign In
                        </button>
                        {onLogout && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onLogout();
                            }}
                            className="py-1.5 px-3 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded font-semibold transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                          >
                            Sign Out
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Mobile Hamburger Navigation Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {showMobileMenu ? <X className="w-5 h-5 text-sky-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden py-3 px-2 border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-lg space-y-1"
          >
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                activeNav === 'home'
                  ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Home</span>
              {activeNav === 'home' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
            </button>

            <button
              onClick={() => handleNavClick('services')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                activeNav === 'services'
                  ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Services</span>
              {activeNav === 'services' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
            </button>

            <button
              onClick={() => handleNavClick('portal')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                activeNav === 'portal'
                  ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{currentUser?.role === 'SUPER_ADMIN' ? 'Admin Console' : 'Ambassador Club'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    currentUser?.role === 'SUPER_ADMIN'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Earn ₹100'}
                </span>
              </div>
              {activeNav === 'portal' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
            </button>

            {currentUser?.role !== 'SUPER_ADMIN' && (
              <button
                onClick={() => handleNavClick('book-service')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  activeNav === 'book-service'
                    ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Book Service</span>
                {activeNav === 'book-service' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
