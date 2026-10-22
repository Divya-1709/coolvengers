import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, PlusCircle, Check, LogIn, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

type NavItem = 'home' | 'explore' | 'about' | 'services' | 'reviews' | 'gallery' | 'contact' | 'portal';

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
  const [showExploreDropdown, setShowExploreDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItem>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#about') return 'about';
      if (hash === '#services' || hash === '#installation' || hash === '#maintenance' || hash === '#repair') return 'services';
      if (hash === '#reviews') return 'reviews';
      if (hash === '#gallery') return 'gallery';
      if (hash === '#contact' || hash === '#book-service') return 'contact';
    }
    return currentView === 'PORTAL' ? 'portal' : 'home';
  });

  const isClickingRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getDemoUsers().then(res => setDemoUsers(res.users)).catch(console.error);
  }, []);

  // Scroll-aware header shrink effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setShowExploreDropdown(false);
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

      const scrollPos = window.scrollY + 160;
      const contactEl = document.getElementById('contact') || document.getElementById('book-service');
      const reviewsEl = document.getElementById('reviews');
      const galleryEl = document.getElementById('gallery');
      const servicesEl = document.getElementById('services');
      const aboutEl = document.getElementById('about');

      if (contactEl && scrollPos >= contactEl.offsetTop - 80) {
        setActiveNav('contact');
      } else if (reviewsEl && scrollPos >= reviewsEl.offsetTop - 80) {
        setActiveNav('reviews');
      } else if (galleryEl && scrollPos >= galleryEl.offsetTop - 80) {
        setActiveNav('gallery');
      } else if (servicesEl && scrollPos >= servicesEl.offsetTop - 80) {
        setActiveNav('services');
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop - 80) {
        setActiveNav('about');
      } else {
        setActiveNav('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const performScroll = (target: NavItem | string) => {
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        try {
          history.replaceState(null, '', window.location.pathname);
        } catch {}
      }
      return;
    }

    const elementId =
      target === 'contact' ? 'contact' :
      target === 'about' ? 'about' :
      target === 'reviews' ? 'reviews' :
      target === 'gallery' ? 'gallery' :
      target === 'services' ? 'services' :
      target.replace('#', '');

    const el = document.getElementById(elementId) || (elementId === 'contact' ? document.getElementById('book-service') : null);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      try {
        history.replaceState(null, '', `#${elementId}`);
      } catch {}
    }
  };

  const handleNavClick = (target: NavItem | string, serviceCategory?: string) => {
    setShowExploreDropdown(false);
    setShowMobileMenu(false);

    if (target === 'portal') {
      setActiveNav('portal');
      onNavigate('PORTAL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const navKey: NavItem =
      target === 'about' ? 'about' :
      target === 'reviews' ? 'reviews' :
      target === 'gallery' ? 'gallery' :
      target === 'contact' ? 'contact' :
      target === 'services' || target === 'installation' || target === 'maintenance' || target === 'repair' ? 'services' :
      'home';

    setActiveNav(navKey);
    isClickingRef.current = true;
    setTimeout(() => {
      isClickingRef.current = false;
    }, 850);

    if (serviceCategory) {
      window.dispatchEvent(new CustomEvent('select-service-category', { detail: { category: serviceCategory } }));
    }

    if (currentView !== 'HOME') {
      onNavigate('HOME');
      setTimeout(() => {
        performScroll(target);
      }, 100);
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
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 border-slate-200 shadow-md'
          : 'bg-white/95 border-slate-200/90 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between gap-3 sm:gap-6 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
          {/* Zone 1: Brand Wordmark with Coolvengers Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 shrink-0 text-left cursor-pointer group focus:outline-hidden"
          >
            <CoolvengersLogo size="md" animated={true} />
          </button>

          {/* Zone 2: Navigation Links matching coolvengers.in */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <button
              onClick={() => handleNavClick('home')}
              className={getNavClass('home')}
            >
              Home
            </button>

            {/* Explore Dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setShowExploreDropdown(!showExploreDropdown)}
                className={`flex items-center gap-1 ${getNavClass('services')}`}
              >
                <span>Explore</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExploreDropdown ? 'rotate-180 text-sky-600' : ''}`} />
              </button>

              {showExploreDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                  <button
                    onClick={() => handleNavClick('services', 'installation')}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>AC Installation</span>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-100/70 px-1.5 py-0.5 rounded">Split & Window</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('services', 'maintenance')}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>AC Maintenance</span>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-100/70 px-1.5 py-0.5 rounded">Jet Wash & Gas</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('services', 'repair')}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>AC Repair</span>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-100/70 px-1.5 py-0.5 rounded">PCB & Leakage</span>
                  </button>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('about')}
              className={getNavClass('about')}
            >
              About Us
            </button>

            <button
              onClick={() => handleNavClick('reviews')}
              className={getNavClass('reviews')}
            >
              Reviews
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={getNavClass('gallery')}
            >
              Gallery
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
                onClick={() => handleNavClick('contact')}
                className="px-3.5 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs ml-1"
              >
                Contact Us
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
        <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-lg overflow-hidden"
          >
            <div ref={mobileMenuRef} className="py-3 px-2 space-y-1">
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

            {/* Explore Section in Mobile */}
            <div className="py-1 px-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Explore Services
              </div>
              <div className="grid grid-cols-1 gap-1 pl-2">
                <button
                  onClick={() => handleNavClick('services', 'installation')}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between"
                >
                  <span>AC Installation</span>
                  <span className="text-[10px] text-sky-600 font-mono">Split / Window</span>
                </button>
                <button
                  onClick={() => handleNavClick('services', 'maintenance')}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between"
                >
                  <span>AC Maintenance</span>
                  <span className="text-[10px] text-sky-600 font-mono">Jet Wash / Gas</span>
                </button>
                <button
                  onClick={() => handleNavClick('services', 'repair')}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between"
                >
                  <span>AC Repair</span>
                  <span className="text-[10px] text-sky-600 font-mono">PCB / Leakage</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                activeNav === 'about'
                  ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>About Us</span>
              {activeNav === 'about' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
            </button>

            <button
              onClick={() => handleNavClick('reviews')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                activeNav === 'reviews'
                  ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Reviews</span>
              {activeNav === 'reviews' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                activeNav === 'gallery'
                  ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Work Gallery</span>
              {activeNav === 'gallery' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
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
                onClick={() => handleNavClick('contact')}
                className="w-full text-center py-2.5 px-3 rounded-lg bg-sky-900 text-white font-bold text-sm shadow-xs cursor-pointer mt-1"
              >
                Contact Us / Book Visit
              </button>
            )}
          </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </header>
  );
};
