import React, { useState, useEffect } from 'react';
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
  Calendar,
  MessageCircle,
  Camera,
  Layers,
  Settings,
  Flame,
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

type ServiceCategory = 'all' | 'installation' | 'maintenance' | 'repair';

interface ServiceItem {
  id: string;
  category: 'installation' | 'maintenance' | 'repair';
  title: string;
  tagline: string;
  price: string;
  duration: string;
  rating: string;
  badge: string;
  caption: string;
  image: string;
  iconType: 'wrench' | 'droplet' | 'gauge' | 'cpu' | 'shield' | 'fan';
  features: string[];
  idealFor: string;
  popular?: boolean;
}

export const HomePage: React.FC<Props> = ({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onGoToPortal,
  onOpenSubmitLead,
  onLogout,
}) => {
  // Service Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingService, setBookingService] = useState('Split AC Installation (Popular)');
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

  // Work Gallery Filter State
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'installation' | 'jetwash' | 'repair'>('all');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroImage = '/src/assets/images/coolvengers_home_hero_1792133261520.jpg';
  const technicianImage = '/src/assets/images/coolvengers_technician_work_1792133261366.jpg';

  // Listen to custom navigation events from Header (e.g. Explore dropdown)
  useEffect(() => {
    const handleSelectCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: ServiceCategory }>;
      if (customEvent.detail?.category) {
        setSelectedCategory(customEvent.detail.category);
        const srvEl = document.getElementById('services');
        if (srvEl) {
          srvEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('select-service-category', handleSelectCategory);
    return () => window.removeEventListener('select-service-category', handleSelectCategory);
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim()) return;
    setBookingSubmitted(true);
  };

  // Comprehensive Services Catalog structured across the 3 core categories from coolvengers.in
  const allServices: ServiceItem[] = [
    // --- 1. AC Installation Category ---
    {
      id: 'split-installation',
      category: 'installation',
      title: 'Split AC Installation',
      popular: true,
      tagline: 'Professional installation of split AC units with precision bracket mounting & vacuuming',
      price: '₹1,199',
      duration: '60-90 mins',
      rating: '5.0 ★ (650+)',
      badge: 'Popular Service',
      caption: 'Precision spirit-level wall mounting, vacuuming, and leak-proof flare joints.',
      image: '/svc_split_install.jpg',
      iconType: 'wrench',
      features: [
        'Specialized in all split & inverter air conditioners',
        'Laser spirit-level indoor and outdoor bracket mounting',
        'Precision copper pipe flaring & nitrogen vacuuming',
        'Neat wall core cutting & dust-free sleeve pass-through',
        'Tested cooling drop and ampere draw verification',
        'Satisfaction guaranteed with 30-day workmanship warranty',
      ],
      idealFor: 'New AC purchases, home shifting, split unit replacements',
    },
    {
      id: 'window-installation',
      category: 'installation',
      popular: true,
      title: 'Window AC Installation',
      tagline: 'Seamless installation of window ACs with heavy-duty framing & air-seal protection',
      price: '₹799',
      duration: '45-60 mins',
      rating: '4.9 ★ (420+)',
      badge: 'Popular Service',
      caption: 'Heavy-duty vibration dampening with weather-tight perimeter sealing.',
      image: '/svc_window_install.jpg',
      iconType: 'wrench',
      features: [
        'Experienced in all window units (0.75 Ton to 2.0 Ton)',
        'Safety-first reinforced bracket mounting and leveling',
        'Weatherproof silicone sealing to eliminate hot draft & rainwater leaks',
        'Proper downward angle tilt for smooth condensate water drainage',
        'Vibration-dampener rubber pads included for whisper-quiet running',
        'Quality assurance & tested 100% cooling performance',
      ],
      idealFor: 'Apartments & rooms with dedicated window AC masonry slots',
    },
    {
      id: 'setup-consultation',
      category: 'installation',
      title: 'AC Setup Consultation',
      tagline: 'Expert consulting for optimal AC setup, heat-load room tonnage, and airflow route',
      price: 'Free / Complimentary',
      duration: '30 mins',
      rating: '5.0 ★ (280+)',
      badge: 'Energy-Efficient Architecture',
      caption: 'Room heat-load calculation and piping route optimization to slash power bills.',
      image: '/svc_consultation.jpg',
      iconType: 'fan',
      features: [
        'Personalized recommendations tailored to room layout & sunlight exposure',
        'Accurate BTU & tonnage calculation (prevents overworking compressor)',
        'Energy-efficient 5-star inverter vs non-inverter options comparison',
        'Minimal piping route planning to maximize COP cooling efficiency',
        'Free initial consultation for residential homes & commercial spaces',
        'Expert guidance on electrical wiring and voltage stabilizer sizing',
      ],
      idealFor: 'New home buyers, interior designers, commercial offices, villa owners',
    },
    {
      id: 'installation-maintenance',
      category: 'installation',
      title: 'AC Installation Maintenance',
      tagline: 'Comprehensive post-installation inspection, alignment checks & compressor health',
      price: '₹399',
      duration: '30 mins',
      rating: '4.9 ★ (190+)',
      badge: 'Preventive Maintenance Plan',
      caption: 'Nut-bolt tightness, bracket integrity, and initial gas stability check.',
      image: '/service_installation_maintenance.jpg',
      iconType: 'shield',
      features: [
        'Preventive maintenance plans protecting factory warranties',
        'Outdoor unit bracket load & vibration inspection',
        'Flare nut torque tightness check and micro-leak sniff test',
        'Condensate drain pipe slope and free-flow test',
        'Compressor starting voltage & running ampere benchmark check',
        'Affordable pricing with detailed service check certificate',
      ],
      idealFor: 'ACs installed within the last 1 to 6 months',
    },

    // --- 2. AC Maintenance Category ---
    {
      id: 'regular-servicing',
      category: 'maintenance',
      title: 'Regular AC Servicing',
      tagline: 'Scheduled AC servicing for maximum cooling efficiency and lower electricity consumption',
      price: '₹349',
      duration: '40 mins',
      rating: '4.9 ★ (1,150+)',
      badge: '18-Point Health Checklist',
      caption: 'Dust removal, electrical inspection, and air filter sanitization.',
      image: '/svc_regular_service.jpg',
      iconType: 'droplet',
      features: [
        'Comprehensive 18-point checks covering electrical & refrigeration cycle',
        'Extends AC compressor and blower motor operational lifespan',
        'Air filter dry and wet chemical sanitization',
        'Indoor cooling coil dry brushing & antibacterial spray',
        'Condensate water drain pan flush and clearing',
        'Satisfaction guaranteed with noticeably cooler room output',
      ],
      idealFor: 'Seasonal tune-up, minor dust accumulation, maintaining efficiency',
    },
    {
      id: 'gas-refill',
      category: 'maintenance',
      title: 'Gas Refill & Leakage Arrest',
      popular: true,
      tagline: 'Professional gas refilling services with certified technicians & leak detection',
      price: '₹1,499',
      duration: '60 mins',
      rating: '4.9 ★ (890+)',
      badge: 'Digital Pressure Calibration',
      caption: '100% virgin sealed gas recharge calibrated with digital manifold gauges.',
      image: '/svc_gas_refill.jpg',
      iconType: 'gauge',
      features: [
        'Certified HVAC technicians with nitrogen pressure testing kits',
        'Quick turnaround with pinpoint ultrasonic/soap bubble leak detection',
        'High-temperature oxygen-acetylene copper pipe brazing & valve replacement',
        '100% genuine sealed virgin R32, R410A, or R22 refrigerant',
        'Digital manifold pressure gauge calibration to exact factory PSI',
        '30-Day cooling warranty on all refilled refrigerant',
      ],
      idealFor: 'AC blowing normal/warm air, ice forming on indoor copper coils',
    },
    {
      id: 'deep-cleaning',
      category: 'maintenance',
      title: 'Deep Cleaning (Multi-Stage)',
      tagline: 'Thorough cleaning for AC units eliminating trapped dust, allergens, and odors',
      price: '₹449',
      duration: '50 mins',
      rating: '4.9 ★ (1,420+)',
      badge: 'Anti-Bacterial Active Foam',
      caption: 'Deep evaporator fin wash & mold purge with zero wall splatter.',
      image: '/svc_deep_cleaning.jpg',
      iconType: 'droplet',
      features: [
        'Eliminates dust, pollen, pet dander, and respiratory allergens',
        'Restores healthy indoor air quality with anti-bacterial active foam',
        'Deep evaporator fin wash & mold purge with protective service cover',
        'Blower fan wheel deep scrub for maximum cubic-feet-per-minute (CFM)',
        'Outdoor unit coil wash and dust extraction',
        'Affordable rates with proven reduction in room cooling time',
      ],
      idealFor: 'Homes with kids/seniors, foul smell, or AC serviced >6 months ago',
    },
    {
      id: 'jet-wash',
      category: 'maintenance',
      title: 'Jet Wash (Hydro Jet Pump Wash)',
      popular: true,
      tagline: 'High-pressure cleaning for ACs removing stubborn dirt from deep coils',
      price: '₹499',
      duration: '45-60 mins',
      rating: '5.0 ★ (2,100+)',
      badge: '120-Bar Hydro Jet Cleaning',
      caption: 'High-pressure hydro cleaning with zero wall splatter service jacket.',
      image: '/svc_jet_wash.jpg',
      iconType: 'droplet',
      features: [
        'Removes stubborn encrusted dirt, mud, and lint from deep coil fins',
        'Improves cooling efficiency by up to 35% within 10 minutes of operation',
        'Safe for all AC types with custom waterproof drain jacket',
        'Unclogs choked internal drain trays & discharge pipes completely',
        'Outdoor condenser unit power wash for rapid heat dissipation',
        'Delivers crisp, hospital-grade fresh mountain-chilled breeze',
      ],
      idealFor: 'Low cooling, slow room pull-down, heavy dust buildup, high power bills',
    },

    // --- 3. AC Repair Category ---
    {
      id: 'pcb-repair',
      category: 'repair',
      popular: true,
      title: 'Diagnostics & Inverter PCB Repair',
      tagline: 'Swift repairs for your AC units by circuit board specialists and HVAC engineers',
      price: '₹299 inspection',
      duration: '30-45 mins',
      rating: '4.8 ★ (410+)',
      badge: 'Micro-Soldering Specialist',
      caption: 'Inverter motherboard diagnostics, sensor testing & micro-soldering.',
      image: '/svc_pcb_repair.jpg',
      iconType: 'cpu',
      features: [
        'Clear explanations and cost-effective solutions for all PCB issues',
        'Full error-code diagnostics on Daikin, Voltas, LG, Blue Star, Carrier, Lloyd, etc.',
        'Inverter PCB motherboard repair, IGBT module & capacitor micro-soldering',
        'Warranty on all replaced electronics and microchips (90-day coverage)',
        'Extends unit lifespan without having to replace entire outdoor machine',
        'Satisfaction guaranteed by certified electronic HVAC technicians',
      ],
      idealFor: 'AC not turning on, error codes (E1, E6, F3, CH05), MCB tripping',
    },
    {
      id: 'swift-repairs',
      category: 'repair',
      title: 'Swift AC Breakdown Repair',
      tagline: 'Emergency doorstep troubleshooting of compressors, fan motors, sensors & leaks',
      price: 'Upfront Quote',
      duration: 'Under 45 mins',
      rating: '4.9 ★ (730+)',
      badge: 'Same-Day Doorstep Fix',
      caption: 'Rapid component replacement with factory-genuine parts in technician kits.',
      image: '/svc_breakdown_repair.jpg',
      iconType: 'wrench',
      features: [
        '100% genuine factory starting capacitors, relays, and thermistors in stock',
        'Indoor blower motor and outdoor fan motor bearing replacement',
        'Indoor water dripping resolution with pipe realignment and unblocking',
        'Magnetic contactor and 4-way reversing valve repair',
        'Clear upfront transparent estimates before technician turns a screwdriver',
        'Professional care with 30-day follow-up guarantee on all work done',
      ],
      idealFor: 'Rattling noises, sudden cooling cutoff, burning smell, water leaking inside',
    },
  ];

  // Filtered services list based on category tab
  const filteredServices = selectedCategory === 'all'
    ? allServices
    : allServices.filter(s => s.category === selectedCategory);

  const activeService = filteredServices[selectedServiceIndex] || filteredServices[0] || allServices[0];

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
    '🔔 Arun K. in Madipakkam booked Jet Wash High-Pressure Cleaning · 3m ago',
    '💰 Priya S. earned ₹100 referral reward for 2-ton Split AC job · 8m ago',
    '⚡ Karthik R. in Velachery booked Gas Leakage Arrest & R32 Top-up · 14m ago',
    '🎉 Ambassador Gokul reached Gold Tier (₹2,500 total earned) · 22m ago',
    '❄️ 100% Genuine R410A gas refilled in Thoraipakkam · 31m ago',
    '🛡️ Sangeetha M. booked Split AC Installation in Pallikaranai · 45m ago',
  ];

  // Exact reviews from coolvengers.in with their avatar paths
  const testimonials = [
    {
      name: 'Murali',
      avatar: '/testimonials/murali.png',
      location: 'Madipakkam, Chennai',
      rating: 5,
      comment: 'The service from Coolvengers was quick and professional, highly recommend!',
    },
    {
      name: 'Anjali',
      avatar: '/testimonials/anjali.png',
      location: 'Velachery, Chennai',
      rating: 5,
      comment: 'Expert technicians who fixed my AC in no time, great service!',
    },
    {
      name: 'Srithar',
      avatar: '/testimonials/srithar.png',
      location: 'Pallikaranai, Chennai',
      rating: 5,
      comment: 'Very satisfied with their installation service, highly skilled team.',
    },
    {
      name: 'Pooja',
      avatar: '/testimonials/pooja.png',
      location: 'Perungudi, Chennai',
      rating: 5,
      comment: 'Prompt response and excellent maintenance service, truly reliable!',
    },
    {
      name: 'Krishna',
      avatar: '/testimonials/krishna.png',
      location: 'Thoraipakkam (OMR), Chennai',
      rating: 5,
      comment: 'Their deep cleaning service made a huge difference, thank you!',
    },
    {
      name: 'Ramya Sri',
      avatar: '/testimonials/ramya_sri.png',
      location: 'Medavakkam, Chennai',
      rating: 5,
      comment: 'Fast and efficient repair service when I needed it most, thank you!',
    },
  ];

  // Gallery items for work showcase
  const galleryItems = [
    {
      title: 'Split AC Wall Bracket Mounting',
      category: 'installation',
      image: '/service_installation.jpg',
      desc: 'Precision spirit-level bracket alignment on 1.5 Ton Inverter AC with vibration dampers in Madipakkam.',
    },
    {
      title: 'High-Pressure Hydro Jet Cleaning',
      category: 'jetwash',
      image: '/service_deep_cleaning.jpg',
      desc: '120-bar hydro cleaning removing heavy dust from evaporator cooling coils with zero wall splatter.',
    },
    {
      title: 'Digital Gas Pressure Calibration',
      category: 'repair',
      image: '/service_gas_refill.jpg',
      desc: 'Precision refrigerant top-up with virgin R32 gas and nitrogen leak test in Velachery.',
    },
    {
      title: 'Inverter PCB Motherboard Repair',
      category: 'repair',
      image: '/service_pcb_repair.jpg',
      desc: 'Component-level micro-soldering and capacitor testing for Daikin inverter unit in OMR.',
    },
    {
      title: 'Outdoor Condenser Power Wash',
      category: 'jetwash',
      image: '/svc_condenser_wash.jpg',
      desc: 'Flushing stubborn Chennai coastal silt from outdoor condenser fins to restore rapid heat dissipation.',
    },
    {
      title: 'Commercial Multi-Split Installation',
      category: 'installation',
      image: '/svc_consultation.jpg',
      desc: 'Clean concealed copper piping installation for open-plan workspace in Guindy.',
    },
  ];

  const filteredGallery = galleryFilter === 'all'
    ? galleryItems
    : galleryItems.filter(g => g.category === galleryFilter);

  const faqs = [
    {
      q: 'How fast can a Coolvengers technician reach my home in Chennai?',
      a: 'We operate localized hub dispatch units in Madipakkam, Velachery, OMR, and Guindy. For emergency breakdowns and bookings during our operational hours (10:00 AM – 6:00 PM), a certified technician typically arrives at your doorstep within 30 to 45 minutes.',
    },
    {
      q: 'How does the Ambassador "Refer & Earn ₹100" program work?',
      a: 'Anyone in Chennai can sign up as a Coolvengers Ambassador. Whenever you submit an AC service referral (installation, jet wash, gas refill, or repair) for your friends, neighbors, or society members, our team attends to the customer. As soon as our Super Admin verifies the completed service, ₹100 is credited directly to your UPI ID (GPay/PhonePe/Paytm) or Bank account via verified manual audited transfer.',
    },
    {
      q: 'Do you provide a warranty on AC repair and gas refilling?',
      a: 'Yes! We provide a 30-day service guarantee on all jet pump cleanings and gas refilling, and a 90-day warranty on all electrical/electronic replacement spare parts like capacitors, sensors, and repaired PCB boards.',
    },
    {
      q: 'Which air conditioner brands do you service?',
      a: 'We service all major brands in India including Daikin, Voltas, Blue Star, LG, Mitsubishi, Carrier, Panasonic, Hitachi, Samsung, Godrej, Onida, and Lloyd, covering both inverter and non-inverter split and window units.',
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

  const getServiceIcon = (iconType: ServiceItem['iconType']) => {
    switch (iconType) {
      case 'wrench': return <Wrench className="w-5 h-5 text-sky-600" />;
      case 'droplet': return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'gauge': return <Gauge className="w-5 h-5 text-sky-600" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-sky-600" />;
      case 'shield': return <ShieldCheck className="w-5 h-5 text-sky-600" />;
      case 'fan': return <Fan className="w-5 h-5 text-sky-600" />;
      default: return <Wrench className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Live Verified Activity Ticker (Animated Marquee) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-sky-100 py-2.5 px-4 rounded-xl shadow-xs border border-sky-800/40">
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

      {/* 2. Hero Section: Welcome to Coolvengers - Your Comfort, Our Expertise */}
      <section id="home" className="relative rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm scroll-mt-24">
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
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[560px]">
          {/* Left Column: Headline, Subheadline & Primary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between z-10"
          >
            <div>
              {/* Top Tagline Badge from coolvengers.in */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-900 text-xs font-semibold mb-4 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                <span className="font-bold text-sky-700">WELCOME TO COOLVENGERS</span>
                <span className="text-slate-400">&middot;</span>
                <span className="text-slate-600">Your Comfort, Our Expertise</span>
              </div>

              {/* Live Headline from coolvengers.in */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Expert AC Services for Your Comfort in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500">
                  Chennai
                </span>
              </h1>

              {/* Exact Subheadline from coolvengers.in */}
              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                We are your trusted AC service provider in Chennai, dedicated to delivering exceptional installation, maintenance, and repair services for all types of air conditioners.
              </p>

              {/* Special Live Refer & Earn Offer Banner matching coolvengers.in */}
              <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">Refer &amp; Earn ₹100: </span>
                    <span className="text-slate-600">Refer your friends or neighbors for AC service &amp; get ₹100 cash!</span>
                  </div>
                </div>
                <button
                  onClick={currentUser ? onOpenSubmitLead : onOpenRegister}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Refer Now
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#contact"
                  className="px-6 py-3.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-sky-400" />
                  Book Doorstep AC Service
                  <ArrowRight className="w-4 h-4" />
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#services"
                  className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 border border-slate-200 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-sky-600" />
                  Explore Services
                </motion.a>

                <button
                  onClick={() => {
                    if (currentUser) {
                      onGoToPortal();
                    } else {
                      onOpenRegister();
                    }
                  }}
                  className="px-5 py-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Ambassador Club (Earn ₹100)
                </button>
              </div>

              {/* 4 Stats Cards from coolvengers.in */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-sky-700 font-mono">4+</div>
                  <div className="text-[11px] font-medium text-slate-600 mt-0.5">Years Experience</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-sky-700 font-mono">850+</div>
                  <div className="text-[11px] font-medium text-slate-600 mt-0.5">Happy Customers</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-sky-700 font-mono">10+</div>
                  <div className="text-[11px] font-medium text-slate-600 mt-0.5">Services Offered</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-sky-700 font-mono">15+</div>
                  <div className="text-[11px] font-medium text-slate-600 mt-0.5">Expert Technicians</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual with Real Work Badge */}
          <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-full overflow-hidden bg-slate-100">
            <img
              src={heroImage}
              alt="Coolvengers AC cooling comfort in Chennai"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000"
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
                  <div className="text-xs font-bold text-slate-900">30-45 Min Response</div>
                  <div className="text-[10px] text-slate-500">Madipakkam &amp; Chennai Hubs</div>
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
                100% Genuine spare parts, factory virgin refrigerant gas, and 30-day service warranty on all cleanings &amp; gas refills.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (The 3-Step Process from coolvengers.in) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Settings className="w-3.5 h-3.5 text-sky-600" />
            HOW IT WORKS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Seamless AC Care in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Getting your AC installed, serviced, or repaired in Chennai has never been easier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-sky-300 transition-all text-left"
          >
            <div className="text-4xl font-black text-sky-100 font-mono absolute top-4 right-5 select-none">
              01
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-4 text-sky-600 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. Schedule a Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contact us via call, WhatsApp, or submit your booking online. Pick your required service (Installation, Jet Wash, Gas Refill, Repair) and convenient time slot.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-sky-300 transition-all text-left"
          >
            <div className="text-4xl font-black text-sky-100 font-mono absolute top-4 right-5 select-none">
              02
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-4 text-sky-600 group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Expert Installation &amp; Repair</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our verified technicians arrive at your doorstep in under 45 minutes equipped with high-pressure jet pumps, digital manifold gauges, and genuine spare parts.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-sky-300 transition-all text-left"
          >
            <div className="text-4xl font-black text-sky-100 font-mono absolute top-4 right-5 select-none">
              03
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-4 text-sky-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. Enjoy Comfort</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Relax in ice-cold breeze while we ensure your AC operates at peak cooling efficiency with full transparent billing and 30-day service warranty.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. About Us Section (#about) */}
      <section id="about" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-sm scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
              <Award className="w-3.5 h-3.5 text-sky-600" />
              ABOUT COOLVENGERS AIRCONS
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Chennai&apos;s Trusted Air Conditioning Care Specialists
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Coolvengers was founded with a singular mission: to provide fast, reliable, transparent, and expert AC care across Chennai. In a city where temperatures regularly exceed 38&deg;C, an efficient air conditioner is not a luxury &mdash; it is essential comfort.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              With <strong>4+ years of hands-on technical expertise</strong>, our fleet of <strong>15+ certified technicians</strong> handles everything from precision split and window AC mounting to 120-bar hydro jet wash coil washing, digital refrigerant gas calibration, and complex inverter PCB diagnostics. We are proud to serve over <strong>850+ satisfied residential and commercial clients</strong> across Madipakkam, Velachery, OMR, Guindy, Tambaram, and throughout Chennai.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Certified HVAC Team</div>
                  <div className="text-slate-500 text-[11px]">4+ years field experience</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">100% Genuine Spares</div>
                  <div className="text-slate-500 text-[11px]">Factory sealed refrigerants</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Upfront Honest Pricing</div>
                  <div className="text-slate-500 text-[11px]">Zero hidden charges</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">30-Day Guarantee</div>
                  <div className="text-slate-500 text-[11px]">Cooling warranty on all jobs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <img
              src={technicianImage}
              alt="Coolvengers AC technician servicing cooling unit in Chennai"
              className="w-full h-full object-cover object-center max-h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Madipakkam Headquarters &middot; Chennai Hub
                </div>
                <div className="text-sm font-semibold text-slate-100 mt-1">
                  15+ Verified Technicians Ready to Dispatch in Under 45 Minutes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Explore Our Services with 3 Live Categories (#services) */}
      <section id="services" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            EXPLORE OUR SERVICES
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Specialized AC Solutions for Chennai Climate
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Browse our full catalog across AC Installation, AC Maintenance, and AC Repair.
          </p>
        </div>

        {/* Category Tabs: All, AC Installation, AC Maintenance, AC Repair */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedServiceIndex(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Services ({allServices.length})
          </button>
          <button
            onClick={() => {
              setSelectedCategory('installation');
              setSelectedServiceIndex(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'installation'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            AC Installation (4)
          </button>
          <button
            onClick={() => {
              setSelectedCategory('maintenance');
              setSelectedServiceIndex(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'maintenance'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            AC Maintenance (4)
          </button>
          <button
            onClick={() => {
              setSelectedCategory('repair');
              setSelectedServiceIndex(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'repair'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            AC Repair (2)
          </button>
        </div>

        {/* Sub-tabs for filtered items */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filteredServices.map((srv, idx) => (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedServiceIndex === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getServiceIcon(srv.iconType)}
              <span>{srv.title.split('(')[0].trim()}</span>
              {srv.popular && (
                <span className="text-[10px] bg-amber-500/20 text-amber-700 font-extrabold px-1 rounded">
                  ★
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Service Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-2xs shrink-0">
                    {getServiceIcon(activeService.iconType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        {activeService.title}
                      </h3>
                      {activeService.popular && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-sky-600 mt-0.5">
                      {activeService.tagline}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Price: {activeService.price}
                  </span>
                  <span className="text-slate-500">
                    Duration: {activeService.duration}
                  </span>
                  <span className="text-amber-600 font-semibold">
                    {activeService.rating}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Ideal For: </span>
                  {activeService.idealFor}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Features &amp; Checklist:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {activeService.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <a
                    href="#contact"
                    onClick={() => setBookingService(activeService.title)}
                    className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Book This Service
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      if (currentUser) {
                        onOpenSubmitLead();
                      } else {
                        onOpenRegister();
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Refer Client (Earn ₹100)
                  </button>
                </div>
              </div>

              {/* Right Image / Visual */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 h-[280px] sm:h-[340px] shadow-xs group">
                <img
                  src={activeService.image}
                  alt={activeService.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="text-xs font-bold tracking-wider uppercase text-sky-300 drop-shadow-xs">
                      {activeService.badge}
                    </div>
                    <div className="text-sm font-semibold mt-1 text-slate-100 leading-snug">
                      {activeService.caption}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 6. Why Choose Coolvengers Aircons? Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Award className="w-3.5 h-3.5 text-sky-600" />
            WHY CHOOSE US
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Choose Coolvengers Aircons?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Expertise, reliability, and commitment to customer satisfaction set us apart from the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: '4+ Years Field Experience',
              desc: 'Thousands of successfully completed split and window AC jobs across Chennai with 5-star ratings.',
              icon: <Clock className="w-5 h-5 text-sky-600" />,
            },
            {
              title: '15+ Expert Technicians',
              desc: 'Background-verified, certified HVAC professionals equipped with specialized tools & diagnostic meters.',
              icon: <Users className="w-5 h-5 text-indigo-600" />,
            },
            {
              title: '100% Genuine Spare Parts',
              desc: 'Sealed virgin refrigerants (R32/R410A) and factory-tested capacitors, copper tubes & PCB electronics.',
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
            },
            {
              title: '30-45 Min Express Response',
              desc: 'Dedicated neighborhood dispatch teams across Madipakkam, Velachery, OMR, Guindy, and South Chennai.',
              icon: <Zap className="w-5 h-5 text-amber-600" />,
            },
            {
              title: 'Transparent Pricing & Warranty',
              desc: 'Clear upfront quotes before any work begins, backed by a solid 30-day cooling and repair guarantee.',
              icon: <Award className="w-5 h-5 text-blue-600" />,
            },
            {
              title: 'Refer & Earn ₹100 Program',
              desc: 'Earn direct cash rewards into your UPI or Bank account for every verified AC service referral.',
              icon: <Sparkles className="w-5 h-5 text-purple-600" />,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. Work Gallery Showcase (#gallery) */}
      <section id="gallery" className="space-y-6 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Camera className="w-3.5 h-3.5 text-sky-600" />
            WORK GALLERY
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our Work in Action Across Chennai
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real field photos of our technicians executing AC installations, deep jet cleanings, and repairs.
          </p>
        </div>

        {/* Gallery category buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setGalleryFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              galleryFilter === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Work
          </button>
          <button
            onClick={() => setGalleryFilter('installation')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              galleryFilter === 'installation'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Installation
          </button>
          <button
            onClick={() => setGalleryFilter('jetwash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              galleryFilter === 'jetwash'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hydro Jet Wash
          </button>
          <button
            onClick={() => setGalleryFilter('repair')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              galleryFilter === 'repair'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Gas &amp; PCB Repair
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. Customer Testimonials & Reviews (#reviews) */}
      <section id="reviews" className="space-y-6 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            CUSTOMER REVIEWS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            What Chennai Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Dedicated to quality service and excellence in every air conditioning project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow text-left"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div>
                    <div className="text-base font-bold text-slate-800">{t.name}</div>
                    <div className="text-[11px] text-slate-400">{t.location}</div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal italic">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Verified Customer
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9. Interactive AC Chill & Power Calculator */}
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
                Coolvengers Metrics
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

              <a
                href="#contact"
                className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                Schedule Jet Cleaning (₹499)
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Ambassador "Refer & Earn ₹100" Section & Simulator */}
      <section className="relative rounded-3xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-sky-50/50 p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-left">
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
          <div className="lg:col-span-5 bg-white border border-amber-200 rounded-2xl p-6 shadow-md space-y-4 text-left">
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

      {/* 11. Doorstep AC Booking & Direct Contact (#contact / #book-service) */}
      <section id="contact" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              CONTACT US &middot; DOORSTEP AC BOOKING
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Get in Touch or Book a Visit in 30 Seconds
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Book a certified Coolvengers technician for installation, jet wash cleaning, gas refilling, or breakdown repairs. Our Chennai dispatch coordinator will call to confirm your appointment.
            </p>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Service Center Headquarters:</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Plot No. 14, 2nd Main Road, Madipakkam, Chennai &ndash; 600091, Tamil Nadu
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Direct Contact Numbers:</div>
                  <div className="text-[11px] font-mono font-bold text-slate-800 mt-0.5 flex flex-wrap gap-2">
                    <a href="tel:+916380873802" className="hover:text-sky-600 transition-colors">
                      +91 63808 73802
                    </a>
                    <span>/</span>
                    <a href="tel:+919176773802" className="hover:text-sky-600 transition-colors">
                      +91 91767 73802
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Email Address:</div>
                  <a href="mailto:gokul@coolvengers.in" className="text-[11px] font-mono text-slate-600 hover:text-sky-600 transition-colors mt-0.5 block">
                    gokul@coolvengers.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Operational Hours:</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Monday &ndash; Sunday: 10:00 AM &ndash; 6:00 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://wa.me/916380873802?text=Hi%20Coolvengers,%20I%20would%20like%20to%20inquire%20about%20AC%20services."
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <a
                href="tel:+916380873802"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                Call Hotline
              </a>
            </div>
          </div>

          {/* Doorstep Booking Form */}
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
                <h3 className="text-xl font-black text-slate-900">AC Doorstep Booking Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong>{bookingName}</strong>. Our Chennai hub dispatcher will call you at <strong>{bookingPhone}</strong> within 15 minutes to confirm the technician visit.
                </p>
                <button
                  onClick={() => {
                    setBookingSubmitted(false);
                    setBookingName('');
                    setBookingPhone('');
                    setBookingNotes('');
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors cursor-pointer mt-2"
                >
                  Book Another AC Service
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Doorstep Service Request Form
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Full Name *
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
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingPhone}
                      onChange={e => setBookingPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                    />
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
                      {allServices.map(s => (
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
                    placeholder="e.g. Daikin 1.5 Ton Split, water dripping or low cooling"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  Confirm AC Doorstep Visit
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 12. Interactive FAQ Accordion */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-2xl font-black text-slate-900">Got Questions? We&apos;ve Got Answers</h2>
          </div>

          <div className="space-y-3 text-left">
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

      {/* 13. Floating Quick Contact Action Buttons (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end">
        {/* Floating Call Button */}
        <a
          href="tel:+916380873802"
          className="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          title="Call Coolvengers Hotline"
        >
          <Phone className="w-5 h-5 text-sky-400" />
        </a>

        {/* Floating Email Button */}
        <a
          href="mailto:gokul@coolvengers.in"
          className="w-11 h-11 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          title="Email Coolvengers"
        >
          <Mail className="w-5 h-5 text-white" />
        </a>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/916380873802?text=Hi%20Coolvengers,%20I%20would%20like%20to%20inquire%20about%20AC%20services."
          target="_blank"
          rel="noreferrer"
          className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-110 relative group"
          title="Chat with Coolvengers on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-15 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Chat on WhatsApp
          </span>
        </a>
      </div>
    </div>
  );
};
