import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wind,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Sparkles,
  ArrowRight,
  Droplets,
  Gauge,
  Cpu,
  Fan,
  ChevronRight,
  LogIn,
  Award,
  Users,
  Send,
  Star,
  Zap,
  TrendingUp,
  PlusCircle,
  Check,
  ChevronDown,
  HelpCircle,
  ThermometerSnowflake,
  ShieldAlert,
} from 'lucide-react';
import { User } from '../types/index.js';
import { CoolvengersLogo } from './CoolvengersLogo.js';

interface Props {
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoToPortal: () => void;
  onOpenSubmitLead: () => void;
  onLogout: () => void;
}

export const HomePage: React.FC<Props> = ({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onGoToPortal,
  onOpenSubmitLead,
  onLogout,
}) => {
  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingService, setBookingService] = useState('AC Deep Cleaning (Jet Pump)');
  const [bookingArea, setBookingArea] = useState('Madipakkam');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Interactive AC Chill & Power Calculator
  const [selectedTonnage, setSelectedTonnage] = useState<'1.0' | '1.5' | '2.0'>('1.5');
  const [outdoorTemp, setOutdoorTemp] = useState<number>(38); // Chennai summer heat
  const [targetTemp, setTargetTemp] = useState<number>(22);

  // Interactive Referral Simulator
  const [referralCount, setReferralCount] = useState<number>(5);

  // Active Service Tab in Explorer
  const [activeServiceTab, setActiveServiceTab] = useState<number>(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroImage = '/src/assets/images/coolvengers_home_hero_1792133261520.jpg';
  const technicianImage = '/src/assets/images/coolvengers_technician_work_1792133261366.jpg';

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim()) return;
    setBookingSubmitted(true);
  };

  const services = [
    {
      id: 'cleaning',
      title: 'Deep Cleaning & Jet Pump Wash',
      tagline: 'Restore 100% ice-cold airflow & eradicate harmful bacteria',
      price: '₹499',
      duration: '45 mins',
      rating: '4.9 ★ (1,420+)',
      icon: <Droplets className="w-6 h-6 text-sky-600" />,
      image: '/service_deep_cleaning.jpg',
      badge: 'High-Pressure Hydro Jet Wash',
      caption: 'Deep evaporator fin wash & mold purge with zero wall splatter.',
      features: [
        'High-pressure jet pump wash on cooling coils',
        'Anti-bacterial active foam sanitization',
        'Drain pipe unclogging & tray mold purge',
        'Blower fan deep cleaning for maximum CFM',
        'Outdoor unit fin wash and dust extraction',
      ],
      idealFor: 'Low cooling, foul smell, or AC serviced >6 months ago',
    },
    {
      id: 'gas',
      title: 'Gas Refilling & Leakage Arrest',
      tagline: 'Guaranteed leak detection with optimal PSI calibration',
      price: '₹1,499',
      duration: '60 mins',
      rating: '4.9 ★ (890+)',
      icon: <Gauge className="w-6 h-6 text-sky-600" />,
      image: '/service_gas_refill.jpg',
      badge: 'Digital Pressure Calibration',
      caption: '100% virgin refrigerant refilled with 30-day cooling warranty.',
      features: [
        'Nitrogen pressure testing for micro-pinhole leaks',
        'Precision copper pipe brazing & valve replacement',
        'Genuine 100% pure R32, R410A, or R22 refrigerant',
        'Digital manifold pressure gauge calibration',
        '30-Day cooling warranty on refilled gas',
      ],
      idealFor: 'AC blowing normal/warm air, ice forming on indoor pipes',
    },
    {
      id: 'installation',
      title: 'AC Installation & Relocation',
      tagline: 'Vibration-free heavy-duty bracket mounting & pipe flaring',
      price: '₹1,199',
      duration: '90 mins',
      rating: '5.0 ★ (650+)',
      icon: <Wrench className="w-6 h-6 text-sky-600" />,
      image: '/service_installation.jpg',
      badge: 'Precision Spirit-Level Mounting',
      caption: 'Heavy-duty wall brackets with leak-free copper flare & vacuuming.',
      features: [
        'Split & Inverter AC level bracket mounting',
        'Precision copper pipe flaring & vacuuming',
        'Core cutting for neat wall passthrough',
        'Safe uninstallation with refrigerant lock-in',
        'Outdoor unit vibration dampener pads included',
      ],
      idealFor: 'New AC purchase, home shifting, or office relocations',
    },
    {
      id: 'pcb',
      title: 'Diagnostics & Inverter PCB Repair',
      tagline: 'Microcontroller & sensor repairs by circuit board specialists',
      price: '₹299',
      duration: '30 mins inspection',
      rating: '4.8 ★ (410+)',
      icon: <Cpu className="w-6 h-6 text-sky-600" />,
      image: '/service_pcb_repair.jpg',
      badge: 'Circuit Board & Multimeter Specialist',
      caption: 'Inverter motherboard diagnostics, sensor testing & micro-soldering.',
      features: [
        'Full error-code diagnostics on all brands',
        'Inverter PCB motherboard repair & soldering',
        'Compressor starting capacitor & relay check',
        'Thermistor & ambient temperature sensor repair',
        'Display panel & remote sensor replacement',
      ],
      idealFor: 'AC not turning on, error codes (E1, E6, F3), MCB tripping',
    },
    {
      id: 'amc',
      title: 'Annual Maintenance Contract (AMC)',
      tagline: 'Year-round zero-breakdown peace of mind with 3 free services',
      price: '₹2,199 / yr',
      duration: 'Comprehensive',
      rating: '5.0 ★ (310+)',
      icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
      image: '/service_amc.jpg',
      badge: 'Year-Round Zero Breakdown',
      caption: '3 comprehensive jet wash services + unlimited free breakdown visits.',
      features: [
        '3 Scheduled comprehensive jet pump cleanings per year',
        'Unlimited free breakdown & repair visits',
        'Priority 30-minute technician dispatch',
        '10% discount on all replacement spare parts',
        'Dedicated senior HVAC technician assigned',
      ],
      idealFor: 'Homes, villas, and commercial offices seeking zero downtime',
    },
  ];

  const localities = [
    'Madipakkam',
    'Velachery',
    'Pallikaranai',
    'Medavakkam',
    'Adambakkam',
    'Nanganallur',
    'Perungudi',
    'Thoraipakkam',
    'OMR & ECR',
    'Guindy',
    'Tambaram',
    'Chromepet',
    'Kottivakkam',
    'Sholinganallur',
  ];

  const liveTickers = [
    '🔔 Arun K. in Madipakkam booked Jet Pump Deep Cleaning · 3m ago',
    '💰 Priya S. earned ₹100 referral reward for 2-ton AC job · 8m ago',
    '⚡ Karthik R. in Velachery booked Gas Leakage Arrest · 14m ago',
    '🎉 Ambassador Gokul reached Gold Tier (₹2,500 total earned) · 22m ago',
    '❄️ 100% Genuine R32 gas refilled in Thoraipakkam · 31m ago',
    '🛡️ Sangeetha M. subscribed to Coolvengers Annual AMC · 45m ago',
  ];

  const testimonials = [
    {
      name: 'Karthikeyan Natarajan',
      area: 'Madipakkam, Chennai',
      rating: 5,
      date: 'Verified Customer · 2 days ago',
      comment:
        'Called Coolvengers for severe water leakage and jet pump wash on my Daikin 1.5T split AC. The technician arrived within 35 minutes, diagnosed a blocked drain pipe, and cleaned the cooling coils thoroughly. Cooling is back to 16°C like brand new!',
    },
    {
      name: 'Sangeetha Ramanathan',
      area: 'Velachery, Chennai',
      rating: 5,
      date: 'Verified Customer · 4 days ago',
      comment:
        'Very polite and professional technicians. Transparent with gas refilling rates, showed me the digital manifold gauge before and after filling R410A. Plus their Ambassador program paid my friend ₹100 for referring me. Outstanding service!',
    },
    {
      name: 'Arun Sundaram',
      area: 'Thoraipakkam (OMR), Chennai',
      rating: 5,
      date: 'Verified Customer · 1 week ago',
      comment:
        'Prompt installation of two new inverter split ACs with neat copper trunking. Zero mess left behind, reasonable pricing, and skilled technicians with proper safety gear. Coolvengers is by far the most reliable AC company in Chennai.',
    },
  ];

  const faqs = [
    {
      q: 'How fast can a Coolvengers technician reach my home in Chennai?',
      a: 'We operate localized hub teams in Madipakkam, Velachery, OMR, and Guindy. For emergency breakdowns and bookings during our operational hours (10:00 AM – 6:00 PM), a certified technician typically arrives within 30 to 45 minutes.',
    },
    {
      q: 'How does the Ambassador "Refer & Earn ₹100" program work?',
      a: 'Anyone can sign up as a Coolvengers Ambassador. Whenever you submit a referral with an AC service requirement (installation, jet wash, gas refill, or repair), our team attends to the customer. As soon as our Super Admin verifies the completed service, ₹100 is credited directly to your UPI ID (GPay/PhonePe/Paytm) or Bank account via manual audited transfer.',
    },
    {
      q: 'Do you provide a warranty on AC repair and gas refilling?',
      a: 'Yes! We provide a 30-day service guarantee on all jet pump cleanings and gas refilling, and a 90-day warranty on all electrical/electronic replacement spare parts like capacitors, sensors, and repaired PCB boards.',
    },
    {
      q: 'Which air conditioner brands do you service?',
      a: 'We service all major brands including Daikin, Voltas, Blue Star, LG, Mitsubishi, Carrier, Panasonic, Hitachi, Samsung, Godrej, Onida, and Lloyd, covering both inverter and non-inverter split and window units.',
    },
    {
      q: 'Are your technicians certified and background verified?',
      a: 'Yes, every Coolvengers technician is a certified HVAC professional with a minimum of 4+ years of field experience and verified background credentials. They wear proper company uniforms and carry specialized diagnostic equipment.',
    },
  ];

  // Calculated Chill Factor
  const tempDiff = Math.max(0, outdoorTemp - targetTemp);
  const estimatedCoolingTime = Math.round(tempDiff * (selectedTonnage === '2.0' ? 0.8 : selectedTonnage === '1.5' ? 1.0 : 1.3));
  const estimatedPowerSaving = Math.round(tempDiff * 2.8 + (selectedTonnage === '1.5' ? 18 : 12));

  // Ambassador Milestone Tier Calculation
  const getMilestoneTier = (count: number) => {
    if (count >= 25) return { name: 'Diamond Ambassador', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', perk: 'VIP Priority + ₹500 Bonus' };
    if (count >= 10) return { name: 'Gold Ambassador', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', perk: 'Priority Disbursement' };
    if (count >= 5) return { name: 'Silver Ambassador', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', perk: 'Certified Referrer Badge' };
    return { name: 'Bronze Ambassador', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', perk: 'Standard ₹100/AC' };
  };

  const currentTier = getMilestoneTier(referralCount);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Live Verified Activity Ticker (Animated Marquee) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-900 via-slate-900 to-sky-900 text-sky-100 py-2.5 px-4 rounded-xl shadow-xs border border-sky-800/40">
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[11px] font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Chennai Dispatch
          </div>
          <div className="relative w-full overflow-hidden whitespace-nowrap">
            <motion.div
              className="inline-flex gap-8 text-xs font-medium text-slate-300"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[...liveTickers, ...liveTickers].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  <span>{item}</span>
                  <span className="text-sky-500">&bull;</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section with Airflow Streams & Animated Elements */}
      <section className="relative rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        {/* Animated Cool Breeze Stream Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-cyan-200/40 blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* SVG Animated Airflow Waves */}
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 600">
            <motion.path
              d="M0,150 C300,100 600,200 1200,120"
              fill="none"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="2.5"
              strokeDasharray="12 12"
              animate={{ strokeDashoffset: [0, -200] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M0,280 C350,220 750,340 1200,250"
              fill="none"
              stroke="rgba(2, 132, 199, 0.2)"
              strokeWidth="2"
              strokeDasharray="8 8"
              animate={{ strokeDashoffset: [0, -160] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M0,420 C400,380 800,480 1200,410"
              fill="none"
              stroke="rgba(14, 165, 233, 0.18)"
              strokeWidth="3"
              strokeDasharray="16 16"
              animate={{ strokeDashoffset: [0, -240] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[540px]">
          {/* Left Column: Value Proposition & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between z-10"
          >
            <div>
              {/* Badge with Real Logo Mark */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-900 text-xs font-semibold mb-5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                <span>Chennai&apos;s Rated #1 AC Air Conditioning Specialists</span>
                <span className="text-slate-400">&middot;</span>
                <span className="text-sky-700 font-bold">Madipakkam</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Superior Cooling Comfort for Every Home &amp; Office in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                  Chennai
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Specializing in prompt doorstep installation, high-pressure jet pump coil washing, precision nitrogen gas leak detection, and advanced inverter PCB repairs. Certified technicians at your doorstep in under 45 minutes.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3.5">
                {currentUser?.role === 'SUPER_ADMIN' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onGoToPortal}
                      className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      Open Super Admin Console
                      <ChevronRight className="w-4 h-4 text-sky-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onLogout}
                      className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200"
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="#book-service"
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      Book Doorstep AC Service
                      <ArrowRight className="w-4 h-4" />
                    </motion.a>

                    {currentUser ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onGoToPortal}
                          className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          Open Ambassador Portal
                          <ChevronRight className="w-4 h-4 text-sky-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onLogout}
                          className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200"
                        >
                          Sign Out
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onOpenLogin}
                          className="px-5 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <LogIn className="w-4 h-4 text-amber-700" />
                          Sign In
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onOpenRegister}
                          className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-4 h-4 text-sky-400" />
                          Join Ambassador Club &middot; Earn ₹100
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Verified Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  100% Genuine Spares
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-sky-600" />
                  10:00 AM &ndash; 6:00 PM Daily
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  +91 63808 73802
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1.5 font-medium text-amber-600">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  4.9 / 5.0 Rating (2,400+ Reviews)
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Image with Floating Interactive Pill & Logo Badge */}
          <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-full overflow-hidden bg-slate-100">
            <img
              src={heroImage}
              alt="Coolvengers AC cooling comfort in a modern Chennai living room"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/10 to-transparent pointer-events-none" />

            {/* Floating Live Tech Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute top-6 right-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-lg max-w-[240px] text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">45-Min Express Dispatch</div>
                  <div className="text-[10px] text-slate-500">South Chennai Coverage</div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Guarantee Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-6 right-6 left-6 sm:left-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl max-w-sm text-left"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Award className="w-4 h-4 text-sky-600" />
                Coolvengers Quality Guarantee
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Madipakkam &amp; South Chennai&apos;s top-tier HVAC technicians. 30-day service warranty on all jet pump washes and gas top-ups.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Interactive AC Power & Chill Calculator (Animated Widget) */}
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 p-6 sm:p-10 shadow-xs">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-900 text-xs font-bold mb-3 border border-sky-200">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600" />
              INTERACTIVE CHENNAI CHILL CALCULATOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Calculate Your Room Cooling Speed &amp; Power Savings
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              See how a professionally cleaned &amp; gas-calibrated AC performs against Chennai&apos;s intense 38&deg;C+ heat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Interactive Sliders */}
            <div className="md:col-span-7 space-y-6">
              {/* AC Tonnage Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select AC Tonnage Capacity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1.0', '1.5', '2.0'] as const).map(ton => (
                    <button
                      key={ton}
                      type="button"
                      onClick={() => setSelectedTonnage(ton)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedTonnage === ton
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ton} Ton Unit
                    </button>
                  ))}
                </div>
              </div>

              {/* Outdoor Temperature Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Chennai Outdoor Heat</span>
                  <span className="text-amber-600 font-mono text-sm">{outdoorTemp}&deg;C</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="44"
                  value={outdoorTemp}
                  onChange={e => setOutdoorTemp(Number(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>32&deg;C (Mild)</span>
                  <span>38&deg;C (Normal Summer)</span>
                  <span>44&deg;C (Peak May Heat)</span>
                </div>
              </div>

              {/* Target Indoor Temperature */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Desired Indoor Comfort Temp</span>
                  <span className="text-sky-600 font-mono text-sm">{targetTemp}&deg;C</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="26"
                  value={targetTemp}
                  onChange={e => setTargetTemp(Number(e.target.value))}
                  className="w-full h-2 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>16&deg;C (Super Chilled)</span>
                  <span>22&deg;C (Comfort)</span>
                  <span>26&deg;C (Energy Saver)</span>
                </div>
              </div>
            </div>

            {/* Output Display with Animated Gauges */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 rounded-2xl space-y-5 shadow-inner">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                Coolvengers Optimized Metrics
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                  <div className="text-[11px] text-slate-300">Room Pull-Down Speed</div>
                  <div className="text-2xl font-black text-sky-300 font-mono mt-0.5 flex items-baseline gap-1">
                    {estimatedCoolingTime} <span className="text-xs font-normal text-slate-300">minutes to {targetTemp}&deg;C</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                  <div className="text-[11px] text-slate-300">Estimated Power Savings</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5 flex items-baseline gap-1">
                    ~{estimatedPowerSaving}% <span className="text-xs font-normal text-slate-300">lower electricity bill</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Via unclogged condenser fins &amp; optimal gas PSI
                  </div>
                </div>
              </div>

              {currentUser?.role === 'SUPER_ADMIN' ? (
                <button
                  onClick={onGoToPortal}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Manage Service Verification
                </button>
              ) : (
                <a
                  href="#book-service"
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Schedule Jet Cleaning (₹499)
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ambassador "Refer & Earn ₹100" Interactive Simulator Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-sky-50/50 p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              COOLVENGERS AMBASSADOR CLUB &middot; REFER &amp; EARN ₹100
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Earn ₹100 for Every AC Service Referral in Chennai
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Do your friends, neighbors, or colleagues need AC service, deep jet cleaning, gas refill, or repair? Share their contact details. Once our Super Admin verifies the completed AC service, <strong>₹100 is credited directly into your UPI ID or Bank account</strong> via verified audited manual payout.
            </p>

            {/* Interactive Referral Earnings Slider */}
            <div className="pt-2 pb-2 space-y-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Simulate Referral Count:</span>
                <span className="text-sky-700 font-mono text-sm">{referralCount} AC units</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={referralCount}
                onChange={e => setReferralCount(Number(e.target.value))}
                className="w-full h-2.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1 AC (₹100)</span>
                <span>10 ACs (₹1,000)</span>
                <span>25 ACs (₹2,500)</span>
                <span>50 ACs (₹5,000)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {currentUser?.role === 'AMBASSADOR' ? (
                <button
                  onClick={onOpenSubmitLead}
                  className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit AC Lead Now (₹100)
                </button>
              ) : currentUser?.role === 'SUPER_ADMIN' ? (
                <button
                  onClick={onGoToPortal}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-sky-400" />
                  Open Super Admin Console
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={onOpenRegister}
                    className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Register as Ambassador (Earn ₹100)
                  </button>
                  <button
                    onClick={onOpenLogin}
                    className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-600" />
                    Sign In
                  </button>
                </div>
              )}

              <div className="text-xs text-slate-600">
                Zero fees &middot; Instant unique ID &middot; Audited payouts
              </div>
            </div>
          </div>

          {/* Right Card: Earnings Meter & Milestone Tier */}
          <div className="lg:col-span-5 bg-white border border-amber-200 rounded-2xl p-6 shadow-md space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Projected Ambassador Payout
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">
                ₹{(referralCount * 100).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">direct cash to UPI/Bank</span>
            </div>

            {/* Current Tier Badge */}
            <div className={`p-3 rounded-xl border ${currentTier.bg} flex items-center justify-between`}>
              <div>
                <div className={`text-xs font-bold ${currentTier.color}`}>{currentTier.name}</div>
                <div className="text-[11px] text-slate-600">{currentTier.perk}</div>
              </div>
              <Award className={`w-5 h-5 ${currentTier.color}`} />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Super Admin reviews and validates completed service</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment recorded with real Bank/UPI UTR transaction reference</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Digital receipt &amp; ledger proof generated immediately</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Service Explorer with Animated Tabs */}
      <section id="services" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            OUR COMPREHENSIVE AC SERVICES
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Professional AC Care Tailored for Chennai Climate
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From precision jet cleaning to emergency refrigerant leak arrest, explore our full spectrum of HVAC solutions.
          </p>
        </div>

        {/* Service Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {services.map((srv, idx) => (
            <button
              key={srv.id}
              onClick={() => setActiveServiceTab(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeServiceTab === idx
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {srv.title.split('&')[0].trim()}
            </button>
          ))}
        </div>

        {/* Active Service Tab Feature Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeServiceTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-2xs">
                    {services[activeServiceTab].icon}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {services[activeServiceTab].title}
                    </h3>
                    <div className="text-xs font-medium text-sky-600">
                      {services[activeServiceTab].tagline}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Price: {services[activeServiceTab].price}
                  </span>
                  <span className="text-slate-500">
                    Est. Duration: {services[activeServiceTab].duration}
                  </span>
                  <span className="text-amber-600 font-semibold">
                    {services[activeServiceTab].rating}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Best For: </span>
                  {services[activeServiceTab].idealFor}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Service Scope &amp; Checklist:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {services[activeServiceTab].features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  {currentUser?.role === 'SUPER_ADMIN' ? (
                    <button
                      onClick={onGoToPortal}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      Verify in Admin Console
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <a
                      href="#book-service"
                      onClick={() => setBookingService(services[activeServiceTab].title)}
                      className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      Book This Service
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}

                  {currentUser?.role === 'AMBASSADOR' && (
                    <button
                      onClick={onOpenSubmitLead}
                      className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Refer Client for This (Earn ₹100)
                    </button>
                  )}
                </div>
              </div>

              {/* Right Image / Visual */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 h-[280px] sm:h-[340px] shadow-xs group">
                <img
                  src={services[activeServiceTab].image}
                  alt={services[activeServiceTab].title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="text-xs font-bold tracking-wider uppercase text-sky-300 drop-shadow-xs">
                      {services[activeServiceTab].badge}
                    </div>
                    <div className="text-sm font-semibold mt-1 text-slate-100 leading-snug">
                      {services[activeServiceTab].caption}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 6. Why Choose Coolvengers Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Why Chennai Trusts Coolvengers</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Precision engineering, honest billing, and genuine factory components.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: '30-45 Min Response',
              desc: 'Dedicated neighborhood dispatch units in Madipakkam & South Chennai.',
              icon: <Clock className="w-5 h-5 text-sky-600" />,
            },
            {
              title: '100% Genuine Spares',
              desc: 'Factory-tested capacitors, sensors, copper coils, and virgin refrigerants.',
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
            },
            {
              title: 'Transparent Pricing',
              desc: 'Standardized rate card upfront before work starts. Zero surprise fees.',
              icon: <Award className="w-5 h-5 text-amber-600" />,
            },
            {
              title: 'Referral Rewards',
              desc: '₹100 direct cash payout on every successful referral via our Ambassador Club.',
              icon: <Users className="w-5 h-5 text-indigo-600" />,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. Doorstep AC Booking Form (Customers & Ambassadors only) */}
      {currentUser?.role !== 'SUPER_ADMIN' && (
        <section id="book-service" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              DOORSTEP AC BOOKING
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Schedule Your AC Visit in 30 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Book a certified Coolvengers technician for inspection, cleaning, gas refill, or repair. Our coordinator will call you to confirm your slot.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-sky-600" />
                Service Center Headquarters:
              </div>
              <p className="text-[11px] text-slate-600 pl-6">
                Plot No. 14, 2nd Main Road, Madipakkam, Chennai &ndash; 600091, Tamil Nadu
              </p>
              <div className="flex items-center gap-2 font-bold text-slate-900 pt-1">
                <Phone className="w-4 h-4 text-emerald-600" />
                Direct Hotline:
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-900 pl-6">
                +91 63808 73802 &middot; 10:00 AM &ndash; 6:00 PM
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
            {bookingSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">AC Booking Confirmed!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{bookingName}</strong>. Our service technician team in {bookingArea} has received your request for <strong>{bookingService}</strong>. We will call you shortly on <strong>+91 {bookingPhone}</strong> to confirm your arrival window.
                </p>
                <button
                  onClick={() => {
                    setBookingSubmitted(false);
                    setBookingName('');
                    setBookingPhone('');
                    setBookingNotes('');
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors cursor-pointer"
                >
                  Book Another AC
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={e => setBookingName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">+91</span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={bookingPhone}
                        onChange={e => setBookingPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Required AC Service *
                    </label>
                    <select
                      value={bookingService}
                      onChange={e => setBookingService(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.title}>
                          {s.title} ({s.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chennai Locality *
                    </label>
                    <select
                      value={bookingArea}
                      onChange={e => setBookingArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      {localities.map(loc => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    AC Brand &amp; Issue Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    placeholder="e.g. Daikin 1.5 Ton Split, water dripping from indoor unit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  Confirm AC Doorstep Visit
                </button>
              </form>
            )}
          </div>
        </div>
        </section>
      )}

      {/* 8. Customer Testimonials */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900">What Chennai Customers Say</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real reviews from homeowners in Madipakkam, Velachery, and OMR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-slate-500">{t.area}</div>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">{t.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-2xl font-black text-slate-900">Got Questions? We&apos;ve Got Answers</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
