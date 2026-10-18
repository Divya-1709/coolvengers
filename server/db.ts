import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import {
  User,
  ReferralLead,
  PayoutRecord,
  Notification,
  AuditLog,
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'coolvengers_db.json');

export interface DatabaseSchema {
  users: User[];
  leads: ReferralLead[];
  payouts: PayoutRecord[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

// In-memory state cache
let dbData: DatabaseSchema | null = null;
let isWriting = false;

// Neon SQL client instance
let sqlClient: NeonQueryFunction<false, false> | null = null;

function getNeonClient(): NeonQueryFunction<false, false> | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '' || dbUrl.includes('YOUR_NEON_DATABASE_URL')) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(dbUrl.trim());
  }
  return sqlClient;
}

// Seed initial data
const initialUsers: User[] = [
  {
    id: 'user_admin_1',
    ambassadorId: 'CV-ADMIN-01',
    name: 'Vikramaditya (Super Admin)',
    email: 'admin@coolvengers.com',
    phone: '+91 98450 11223',
    role: 'SUPER_ADMIN',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'user_amb_1',
    ambassadorId: 'CV-AMB-1001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 43210',
    role: 'AMBASSADOR',
    payoutDetails: {
      method: 'UPI',
      upiId: 'rahul.sharma@okhdfcbank',
      updatedAt: '2026-09-01T11:00:00Z',
    },
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user_amb_2',
    ambassadorId: 'CV-AMB-1002',
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    phone: '+91 91234 56780',
    role: 'AMBASSADOR',
    payoutDetails: {
      method: 'BANK_TRANSFER',
      bankDetails: {
        accountHolderName: 'Priya Patel',
        accountNumber: '50100492819283',
        ifscCode: 'HDFC0000412',
        bankName: 'HDFC Bank, Indiranagar',
      },
      updatedAt: '2026-09-10T14:30:00Z',
    },
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'user_amb_3',
    ambassadorId: 'CV-AMB-1003',
    name: 'Karthik Raja',
    email: 'karthik.raja@outlook.com',
    phone: '+91 94432 10987',
    role: 'AMBASSADOR',
    payoutDetails: {
      method: 'UPI',
      upiId: 'karthikraja@icici',
      updatedAt: '2026-09-15T09:00:00Z',
    },
    createdAt: '2026-09-12T10:00:00Z',
  },
];

const initialPayouts: PayoutRecord[] = [
  {
    id: 'pay_hist_1',
    payoutId: 'CV-PAY-10091',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    ambassadorPhone: '+91 98765 43210',
    payoutMethod: 'UPI',
    payoutDetailsSnapshot: {
      upiId: 'rahul.sharma@okhdfcbank',
    },
    referralIds: ['CV-REF-1011', 'CV-REF-1012'],
    referralCount: 2,
    amountPerReferral: 100,
    totalAmount: 200,
    transactionRef: 'UTR-20261002-984210492',
    paymentDate: '2026-10-02',
    adminId: 'user_admin_1',
    adminName: 'Vikramaditya (Super Admin)',
    adminNotes: 'Batch payout for September completed leads via GPay Business UPI.',
    status: 'COMPLETED',
    createdAt: '2026-10-02T15:30:00Z',
  },
  {
    id: 'pay_hist_2',
    payoutId: 'CV-PAY-10092',
    ambassadorId: 'CV-AMB-1002',
    ambassadorName: 'Priya Patel',
    ambassadorPhone: '+91 91234 56780',
    payoutMethod: 'BANK_TRANSFER',
    payoutDetailsSnapshot: {
      bankDetails: {
        accountHolderName: 'Priya Patel',
        accountNumber: '50100492819283',
        ifscCode: 'HDFC0000412',
        bankName: 'HDFC Bank, Indiranagar',
      },
    },
    referralIds: ['CV-REF-1013'],
    referralCount: 1,
    amountPerReferral: 100,
    totalAmount: 100,
    transactionRef: 'IMPS-HDFC-9938218491',
    paymentDate: '2026-10-05',
    adminId: 'user_admin_1',
    adminName: 'Vikramaditya (Super Admin)',
    adminNotes: 'Corporate net-banking IMPS transfer.',
    status: 'COMPLETED',
    createdAt: '2026-10-05T16:00:00Z',
  },
];

const initialLeads: ReferralLead[] = [
  {
    id: 'lead_1',
    referralId: 'CV-REF-1011',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    customerName: 'Sanjay Deshmukh',
    customerPhone: '9845112233',
    customerLocation: 'Prestige Bella Vista, Porur, Chennai',
    acServiceType: 'AC Deep Cleaning (Jet Pump)',
    acUnitsCount: 2,
    customerNotes: 'Living room AC has foul smell and low airflow.',
    status: 'Paid',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-09-28T14:00:00Z',
    technicianNotes: 'Jet pump foam wash completed. Airflow restored to 450 CFM.',
    scheduledDate: '2026-09-28T11:00:00Z',
    payoutId: 'CV-PAY-10091',
    paidAt: '2026-10-02T15:30:00Z',
    createdAt: '2026-09-25T09:15:00Z',
    updatedAt: '2026-10-02T15:30:00Z',
  },
  {
    id: 'lead_2',
    referralId: 'CV-REF-1012',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    customerName: 'Meenakshi Sundaram',
    customerPhone: '9900223344',
    customerLocation: 'Sobha Serene, Porur, Chennai',
    acServiceType: 'AC Gas Refill & Leak Repair',
    acUnitsCount: 1,
    customerNotes: 'Daikin 1.5 Ton AC blowing warm air.',
    status: 'Paid',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-09-30T17:00:00Z',
    technicianNotes: 'Quarter flare nut leak tightened, nitrogen tested, R32 gas recharged.',
    scheduledDate: '2026-09-30T15:00:00Z',
    payoutId: 'CV-PAY-10091',
    paidAt: '2026-10-02T15:30:00Z',
    createdAt: '2026-09-27T12:00:00Z',
    updatedAt: '2026-10-02T15:30:00Z',
  },
  {
    id: 'lead_3',
    referralId: 'CV-REF-1020',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    customerName: 'Aditya Roy',
    customerPhone: '9731234567',
    customerLocation: 'Purva Swanlake, OMR, Chennai',
    acServiceType: 'AC Installation / Relocation',
    acUnitsCount: 2,
    customerNotes: 'Shifting to new flat; copper piping already pre-installed.',
    status: 'Payment Pending',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-10-14T16:00:00Z',
    technicianNotes: 'Installed both Daikin units, vacuumed to 500 microns, tested OK.',
    scheduledDate: '2026-10-14T10:00:00Z',
    createdAt: '2026-10-10T14:00:00Z',
    updatedAt: '2026-10-14T16:00:00Z',
  },
  {
    id: 'lead_4',
    referralId: 'CV-REF-1021',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    customerName: 'Kavitha Nambiar',
    customerPhone: '9448123456',
    customerLocation: 'Brigade Residences, WTC, Perungudi, Chennai',
    acServiceType: 'Annual Maintenance Contract (AMC)',
    acUnitsCount: 3,
    customerNotes: 'Looking for 1-year comprehensive AMC for 3 Panasonic ACs.',
    status: 'Payment Pending',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-10-15T11:00:00Z',
    technicianNotes: 'AMC contract signed and first preventive wet wash done.',
    scheduledDate: '2026-10-15T09:30:00Z',
    createdAt: '2026-10-11T16:20:00Z',
    updatedAt: '2026-10-15T11:00:00Z',
  },
  {
    id: 'lead_5',
    referralId: 'CV-REF-1022',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    customerName: 'Girish Kulkarni',
    customerPhone: '9845998877',
    customerLocation: 'Appaswamy Trellis, Vadapalani, Chennai',
    acServiceType: 'PCB Board Repair / Replacement',
    acUnitsCount: 1,
    customerNotes: 'AC turns off after 5 minutes with error code CH 05.',
    status: 'Service Scheduled',
    rewardAmount: 100,
    rewardEligible: false,
    scheduledDate: '2026-10-16T14:00:00Z',
    technicianNotes: 'Senior electronics technician allocated with spare inverter PCB.',
    createdAt: '2026-10-14T10:15:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'lead_6',
    referralId: 'CV-REF-1023',
    ambassadorId: 'CV-AMB-1001',
    ambassadorName: 'Rahul Sharma',
    customerName: 'Vandana Nair',
    customerPhone: '9123887766',
    customerLocation: 'Hiranandani Upscale, Egattur, OMR, Chennai',
    acServiceType: 'AC Deep Cleaning (Jet Pump)',
    acUnitsCount: 2,
    customerNotes: 'Need service this weekend.',
    status: 'Contacted',
    rewardAmount: 100,
    rewardEligible: false,
    technicianNotes: 'Spoke with client, requested Saturday slot 11 AM.',
    createdAt: '2026-10-15T18:00:00Z',
    updatedAt: '2026-10-15T19:30:00Z',
  },
  {
    id: 'lead_7',
    referralId: 'CV-REF-1013',
    ambassadorId: 'CV-AMB-1002',
    ambassadorName: 'Priya Patel',
    customerName: 'Naveen Jindal',
    customerPhone: '9880112244',
    customerLocation: 'Ceebros Boulevard, Thoraipakkam, Chennai',
    acServiceType: 'AC Deep Cleaning (Jet Pump)',
    acUnitsCount: 3,
    status: 'Paid',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-10-04T12:00:00Z',
    payoutId: 'CV-PAY-10092',
    paidAt: '2026-10-05T16:00:00Z',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-05T16:00:00Z',
  },
  {
    id: 'lead_8',
    referralId: 'CV-REF-1031',
    ambassadorId: 'CV-AMB-1002',
    ambassadorName: 'Priya Patel',
    customerName: 'Deepak Chopra',
    customerPhone: '9945001122',
    customerLocation: 'Godrej Palm Grove, Koyambedu, Chennai',
    acServiceType: 'AC Gas Refill & Leak Repair',
    acUnitsCount: 2,
    customerNotes: 'Copper pipe brazing and gas top-up.',
    status: 'Payment Pending',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-10-14T14:30:00Z',
    technicianNotes: 'Service verified completed. Customer rating 5/5.',
    createdAt: '2026-10-12T11:00:00Z',
    updatedAt: '2026-10-14T14:30:00Z',
  },
  {
    id: 'lead_9',
    referralId: 'CV-REF-1032',
    ambassadorId: 'CV-AMB-1002',
    ambassadorName: 'Priya Patel',
    customerName: 'Tanvi Agarwal',
    customerPhone: '9822334455',
    customerLocation: 'Dugar Goldstone, Velachery, Chennai',
    acServiceType: 'AC Not Cooling / General Diagnostics',
    acUnitsCount: 1,
    status: 'New Lead',
    rewardAmount: 100,
    rewardEligible: false,
    createdAt: '2026-10-15T21:00:00Z',
    updatedAt: '2026-10-15T21:00:00Z',
  },
  {
    id: 'lead_10',
    referralId: 'CV-REF-1033',
    ambassadorId: 'CV-AMB-1002',
    ambassadorName: 'Priya Patel',
    customerName: 'Sunil Gavaskar',
    customerPhone: '9870001122',
    customerLocation: 'VGP Shanthi Nagar, Pallikaranai, Chennai',
    acServiceType: 'AC Installation / Relocation',
    acUnitsCount: 1,
    status: 'Rejected',
    rewardAmount: 100,
    rewardEligible: false,
    rejectionReason: 'Customer already had service completed by local technician before visit.',
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-09T14:00:00Z',
  },
  {
    id: 'lead_11',
    referralId: 'CV-REF-1041',
    ambassadorId: 'CV-AMB-1003',
    ambassadorName: 'Karthik Raja',
    customerName: 'Aishwarya Rajesh',
    customerPhone: '9988776655',
    customerLocation: 'Kuberan Nagar 8th Street, Madipakkam, Chennai',
    acServiceType: 'AC Deep Cleaning (Jet Pump)',
    acUnitsCount: 3,
    status: 'Payment Pending',
    rewardAmount: 100,
    rewardEligible: true,
    verifiedByStaffId: 'user_admin_1',
    verifiedByStaffName: 'Vikramaditya (Super Admin)',
    verifiedAt: '2026-10-15T12:00:00Z',
    technicianNotes: '3 Master bedrooms indoor & outdoor jet clean completed.',
    createdAt: '2026-10-13T09:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
];

const initialNotifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_amb_1',
    title: 'Referral Completed & ₹100 Reward Queued!',
    message: 'Your referral CV-REF-1021 for Kavitha Nambiar was verified completed by Super Admin. ₹100 reward has been added to Payment Pending!',
    type: 'REWARD_EARNED',
    referralId: 'CV-REF-1021',
    isRead: false,
    createdAt: '2026-10-15T11:00:00Z',
  },
  {
    id: 'notif_2',
    userId: 'user_amb_1',
    title: 'Referral Completed & ₹100 Reward Queued!',
    message: 'Your referral CV-REF-1020 for Aditya Roy was verified completed by Super Admin. ₹100 reward has been added to Payment Pending!',
    type: 'REWARD_EARNED',
    referralId: 'CV-REF-1020',
    isRead: false,
    createdAt: '2026-10-14T16:00:00Z',
  },
  {
    id: 'notif_3',
    userId: 'user_amb_1',
    title: 'Payout Disbursed (₹200)',
    message: 'Super Admin processed your payout of ₹200 via UPI (UTR-20261002-984210492) for referrals CV-REF-1011 and CV-REF-1012.',
    type: 'PAYOUT_SENT',
    payoutId: 'CV-PAY-10091',
    isRead: true,
    createdAt: '2026-10-02T15:30:00Z',
  },
  {
    id: 'notif_4',
    userId: 'user_amb_2',
    title: 'Referral Completed & ₹100 Reward Queued!',
    message: 'Your referral CV-REF-1031 for Deepak Chopra was verified completed by Super Admin. ₹100 reward is pending disbursement.',
    type: 'REWARD_EARNED',
    referralId: 'CV-REF-1031',
    isRead: false,
    createdAt: '2026-10-14T14:30:00Z',
  },
  {
    id: 'notif_5',
    userId: 'user_amb_3',
    title: 'Referral Completed & ₹100 Reward Queued!',
    message: 'Your referral CV-REF-1041 for Aishwarya Rajesh was verified completed by Super Admin. ₹100 reward added to Payment Pending.',
    type: 'REWARD_EARNED',
    referralId: 'CV-REF-1041',
    isRead: false,
    createdAt: '2026-10-15T12:00:00Z',
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit_1',
    actorId: 'user_admin_1',
    actorName: 'Vikramaditya (Super Admin)',
    actorRole: 'SUPER_ADMIN',
    action: 'VERIFY_SERVICE_COMPLETED',
    entityType: 'REFERRAL',
    entityId: 'CV-REF-1021',
    details: 'Verified AC service completion. Awarded ₹100 reward, status set to Payment Pending.',
    timestamp: '2026-10-15T11:00:00Z',
  },
  {
    id: 'audit_2',
    actorId: 'user_admin_1',
    actorName: 'Vikramaditya (Super Admin)',
    actorRole: 'SUPER_ADMIN',
    action: 'MANUAL_PAYOUT_RECORDED',
    entityType: 'PAYOUT',
    entityId: 'CV-PAY-10091',
    details: 'Manual UPI payout ₹200 recorded with UTR-20261002-984210492 for Ambassador Rahul Sharma.',
    timestamp: '2026-10-02T15:30:00Z',
  },
];

// Helper functions to map DB rows to Application models
function mapUser(row: any): User {
  return {
    id: row.id,
    ambassadorId: row.ambassador_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    passwordHash: row.password_hash || undefined,
    payoutDetails: row.payout_details || undefined,
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
  };
}

function mapLead(row: any): ReferralLead {
  return {
    id: row.id,
    referralId: row.referral_id,
    ambassadorId: row.ambassador_id,
    ambassadorName: row.ambassador_name,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerLocation: row.customer_location,
    acServiceType: row.ac_service_type,
    acUnitsCount: Number(row.ac_units_count) || 1,
    customerNotes: row.customer_notes || undefined,
    status: row.status,
    rewardAmount: Number(row.reward_amount) || 100,
    rewardEligible: Boolean(row.reward_eligible),
    verifiedByStaffId: row.verified_by_staff_id || undefined,
    verifiedByStaffName: row.verified_by_staff_name || undefined,
    verifiedAt: row.verified_at ? (typeof row.verified_at === 'object' ? row.verified_at.toISOString() : String(row.verified_at)) : undefined,
    technicianNotes: row.technician_notes || undefined,
    scheduledDate: row.scheduled_date ? (typeof row.scheduled_date === 'object' ? row.scheduled_date.toISOString() : String(row.scheduled_date)) : undefined,
    payoutId: row.payout_id || undefined,
    paidAt: row.paid_at ? (typeof row.paid_at === 'object' ? row.paid_at.toISOString() : String(row.paid_at)) : undefined,
    rejectionReason: row.rejection_reason || undefined,
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: typeof row.updated_at === 'object' && row.updated_at ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function mapPayout(row: any): PayoutRecord {
  return {
    id: row.id,
    payoutId: row.payout_id,
    ambassadorId: row.ambassador_id,
    ambassadorName: row.ambassador_name,
    ambassadorPhone: row.ambassador_phone,
    payoutMethod: row.payout_method,
    payoutDetailsSnapshot: row.payout_details_snapshot || {},
    referralIds: Array.isArray(row.referral_ids) ? row.referral_ids : (typeof row.referral_ids === 'string' ? JSON.parse(row.referral_ids) : []),
    referralCount: Number(row.referral_count) || 0,
    amountPerReferral: Number(row.amount_per_referral) || 100,
    totalAmount: Number(row.total_amount) || 0,
    transactionRef: row.transaction_ref,
    paymentDate: row.payment_date,
    adminId: row.admin_id,
    adminName: row.admin_name,
    adminNotes: row.admin_notes || undefined,
    status: row.status,
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    referralId: row.referral_id || undefined,
    payoutId: row.payout_id || undefined,
    isRead: Boolean(row.is_read),
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
  };
}

function mapAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details,
    timestamp: typeof row.timestamp === 'object' && row.timestamp ? row.timestamp.toISOString() : String(row.timestamp),
  };
}

export class Database {
  private static async ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  // Initialize Neon tables if needed
  private static async initNeonTables(sql: NeonQueryFunction<false, false>) {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        ambassador_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password_hash TEXT,
        payout_details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(100) PRIMARY KEY,
        referral_id VARCHAR(50) UNIQUE NOT NULL,
        ambassador_id VARCHAR(50) NOT NULL,
        ambassador_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_location TEXT NOT NULL,
        ac_service_type VARCHAR(255) NOT NULL,
        ac_units_count INTEGER DEFAULT 1,
        customer_notes TEXT,
        status VARCHAR(50) NOT NULL,
        reward_amount NUMERIC DEFAULT 100,
        reward_eligible BOOLEAN DEFAULT false,
        verified_by_staff_id VARCHAR(100),
        verified_by_staff_name VARCHAR(255),
        verified_at TIMESTAMPTZ,
        technician_notes TEXT,
        scheduled_date TIMESTAMPTZ,
        payout_id VARCHAR(100),
        paid_at TIMESTAMPTZ,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payouts (
        id VARCHAR(100) PRIMARY KEY,
        payout_id VARCHAR(50) UNIQUE NOT NULL,
        ambassador_id VARCHAR(50) NOT NULL,
        ambassador_name VARCHAR(255) NOT NULL,
        ambassador_phone VARCHAR(50) NOT NULL,
        payout_method VARCHAR(50) NOT NULL,
        payout_details_snapshot JSONB,
        referral_ids JSONB NOT NULL,
        referral_count INTEGER NOT NULL,
        amount_per_referral NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        transaction_ref VARCHAR(255) NOT NULL,
        payment_date VARCHAR(50) NOT NULL,
        admin_id VARCHAR(100) NOT NULL,
        admin_name VARCHAR(255) NOT NULL,
        admin_notes TEXT,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        referral_id VARCHAR(50),
        payout_id VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        actor_id VARCHAR(100) NOT NULL,
        actor_name VARCHAR(255) NOT NULL,
        actor_role VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        details TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }

  // Seed Neon tables if empty
  private static async seedNeonIfEmpty(sql: NeonQueryFunction<false, false>) {
    const userCountRes = await sql`SELECT COUNT(*)::int as count FROM users;`;
    const count = userCountRes[0]?.count || 0;

    if (count === 0) {
      console.log('⚡ [Neon Postgres] Seeding initial data...');

      for (const u of initialUsers) {
        await sql`
          INSERT INTO users (id, ambassador_id, name, email, phone, role, password_hash, payout_details, created_at)
          VALUES (${u.id}, ${u.ambassadorId}, ${u.name}, ${u.email}, ${u.phone}, ${u.role}, ${u.passwordHash || null}, ${JSON.stringify(u.payoutDetails || null)}::jsonb, ${u.createdAt})
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const l of initialLeads) {
        await sql`
          INSERT INTO leads (
            id, referral_id, ambassador_id, ambassador_name, customer_name, customer_phone,
            customer_location, ac_service_type, ac_units_count, customer_notes, status,
            reward_amount, reward_eligible, verified_by_staff_id, verified_by_staff_name,
            verified_at, technician_notes, scheduled_date, payout_id, paid_at, rejection_reason,
            created_at, updated_at
          )
          VALUES (
            ${l.id}, ${l.referralId}, ${l.ambassadorId}, ${l.ambassadorName}, ${l.customerName}, ${l.customerPhone},
            ${l.customerLocation}, ${l.acServiceType}, ${l.acUnitsCount}, ${l.customerNotes || null}, ${l.status},
            ${l.rewardAmount}, ${l.rewardEligible}, ${l.verifiedByStaffId || null}, ${l.verifiedByStaffName || null},
            ${l.verifiedAt || null}, ${l.technicianNotes || null}, ${l.scheduledDate || null}, ${l.payoutId || null},
            ${l.paidAt || null}, ${l.rejectionReason || null}, ${l.createdAt}, ${l.updatedAt}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const p of initialPayouts) {
        await sql`
          INSERT INTO payouts (
            id, payout_id, ambassador_id, ambassador_name, ambassador_phone,
            payout_method, payout_details_snapshot, referral_ids, referral_count,
            amount_per_referral, total_amount, transaction_ref, payment_date,
            admin_id, admin_name, admin_notes, status, created_at
          )
          VALUES (
            ${p.id}, ${p.payoutId}, ${p.ambassadorId}, ${p.ambassadorName}, ${p.ambassadorPhone},
            ${p.payoutMethod}, ${JSON.stringify(p.payoutDetailsSnapshot)}::jsonb, ${JSON.stringify(p.referralIds)}::jsonb, ${p.referralCount},
            ${p.amountPerReferral}, ${p.totalAmount}, ${p.transactionRef}, ${p.paymentDate},
            ${p.adminId}, ${p.adminName}, ${p.adminNotes || null}, ${p.status}, ${p.createdAt}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const n of initialNotifications) {
        await sql`
          INSERT INTO notifications (id, user_id, title, message, type, referral_id, payout_id, is_read, created_at)
          VALUES (${n.id}, ${n.userId}, ${n.title}, ${n.message}, ${n.type}, ${n.referralId || null}, ${n.payoutId || null}, ${n.isRead}, ${n.createdAt})
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      for (const a of initialAuditLogs) {
        await sql`
          INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, details, timestamp)
          VALUES (${a.id}, ${a.actorId}, ${a.actorName}, ${a.actorRole}, ${a.action}, ${a.entityType}, ${a.entityId}, ${a.details}, ${a.timestamp})
          ON CONFLICT (id) DO NOTHING;
        `;
      }

      console.log('✅ [Neon Postgres] Initial seed completed successfully.');
    }
  }

  // Load from Neon PostgreSQL
  private static async loadFromNeon(sql: NeonQueryFunction<false, false>): Promise<DatabaseSchema> {
    const [rawUsers, rawLeads, rawPayouts, rawNotifications, rawAudit] = await Promise.all([
      sql`SELECT * FROM users ORDER BY created_at ASC;`,
      sql`SELECT * FROM leads ORDER BY created_at DESC;`,
      sql`SELECT * FROM payouts ORDER BY created_at DESC;`,
      sql`SELECT * FROM notifications ORDER BY created_at DESC;`,
      sql`SELECT * FROM audit_logs ORDER BY timestamp DESC;`,
    ]);

    return {
      users: rawUsers.map(mapUser).filter((u: any) => u.role !== 'STAFF'),
      leads: rawLeads.map(mapLead),
      payouts: rawPayouts.map(mapPayout),
      notifications: rawNotifications.map(mapNotification),
      auditLogs: rawAudit.map(mapAuditLog),
    };
  }

  // Save changes to Neon PostgreSQL
  private static async saveToNeon(sql: NeonQueryFunction<false, false>, data: DatabaseSchema) {
    // Upsert users
    for (const u of data.users) {
      await sql`
        INSERT INTO users (id, ambassador_id, name, email, phone, role, password_hash, payout_details, created_at)
        VALUES (${u.id}, ${u.ambassadorId}, ${u.name}, ${u.email}, ${u.phone}, ${u.role}, ${u.passwordHash || null}, ${JSON.stringify(u.payoutDetails || null)}::jsonb, ${u.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          payout_details = EXCLUDED.payout_details;
      `;
    }

    // Upsert leads
    for (const l of data.leads) {
      await sql`
        INSERT INTO leads (
          id, referral_id, ambassador_id, ambassador_name, customer_name, customer_phone,
          customer_location, ac_service_type, ac_units_count, customer_notes, status,
          reward_amount, reward_eligible, verified_by_staff_id, verified_by_staff_name,
          verified_at, technician_notes, scheduled_date, payout_id, paid_at, rejection_reason,
          created_at, updated_at
        )
        VALUES (
          ${l.id}, ${l.referralId}, ${l.ambassadorId}, ${l.ambassadorName}, ${l.customerName}, ${l.customerPhone},
          ${l.customerLocation}, ${l.acServiceType}, ${l.acUnitsCount}, ${l.customerNotes || null}, ${l.status},
          ${l.rewardAmount}, ${l.rewardEligible}, ${l.verifiedByStaffId || null}, ${l.verifiedByStaffName || null},
          ${l.verifiedAt || null}, ${l.technicianNotes || null}, ${l.scheduledDate || null}, ${l.payoutId || null},
          ${l.paidAt || null}, ${l.rejectionReason || null}, ${l.createdAt}, ${l.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          customer_location = EXCLUDED.customer_location,
          ac_service_type = EXCLUDED.ac_service_type,
          ac_units_count = EXCLUDED.ac_units_count,
          customer_notes = EXCLUDED.customer_notes,
          status = EXCLUDED.status,
          reward_amount = EXCLUDED.reward_amount,
          reward_eligible = EXCLUDED.reward_eligible,
          verified_by_staff_id = EXCLUDED.verified_by_staff_id,
          verified_by_staff_name = EXCLUDED.verified_by_staff_name,
          verified_at = EXCLUDED.verified_at,
          technician_notes = EXCLUDED.technician_notes,
          scheduled_date = EXCLUDED.scheduled_date,
          payout_id = EXCLUDED.payout_id,
          paid_at = EXCLUDED.paid_at,
          rejection_reason = EXCLUDED.rejection_reason,
          updated_at = EXCLUDED.updated_at;
      `;
    }

    // Upsert payouts
    for (const p of data.payouts) {
      await sql`
        INSERT INTO payouts (
          id, payout_id, ambassador_id, ambassador_name, ambassador_phone,
          payout_method, payout_details_snapshot, referral_ids, referral_count,
          amount_per_referral, total_amount, transaction_ref, payment_date,
          admin_id, admin_name, admin_notes, status, created_at
        )
        VALUES (
          ${p.id}, ${p.payoutId}, ${p.ambassadorId}, ${p.ambassadorName}, ${p.ambassadorPhone},
          ${p.payoutMethod}, ${JSON.stringify(p.payoutDetailsSnapshot)}::jsonb, ${JSON.stringify(p.referralIds)}::jsonb, ${p.referralCount},
          ${p.amountPerReferral}, ${p.totalAmount}, ${p.transactionRef}, ${p.paymentDate},
          ${p.adminId}, ${p.adminName}, ${p.adminNotes || null}, ${p.status}, ${p.createdAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          transaction_ref = EXCLUDED.transaction_ref,
          admin_notes = EXCLUDED.admin_notes;
      `;
    }

    // Upsert notifications
    for (const n of data.notifications) {
      await sql`
        INSERT INTO notifications (id, user_id, title, message, type, referral_id, payout_id, is_read, created_at)
        VALUES (${n.id}, ${n.userId}, ${n.title}, ${n.message}, ${n.type}, ${n.referralId || null}, ${n.payoutId || null}, ${n.isRead}, ${n.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          is_read = EXCLUDED.is_read;
      `;
    }

    // Upsert audit logs
    for (const a of data.auditLogs) {
      await sql`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, details, timestamp)
        VALUES (${a.id}, ${a.actorId}, ${a.actorName}, ${a.actorRole}, ${a.action}, ${a.entityType}, ${a.entityId}, ${a.details}, ${a.timestamp})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  static async init(): Promise<DatabaseSchema> {
    const neonSql = getNeonClient();

    if (neonSql) {
      try {
        await this.initNeonTables(neonSql);
        await this.seedNeonIfEmpty(neonSql);
        dbData = await this.loadFromNeon(neonSql);
        console.log(`✅ [Neon Postgres] Connected and loaded (${dbData.users.length} users, ${dbData.leads.length} leads).`);
        return dbData;
      } catch (err) {
        console.error('❌ [Neon Postgres] Connection/init error, falling back to local store:', err);
      }
    }

    // Fallback: Local JSON File store
    await this.ensureDir();
    if (dbData) return dbData;

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbData = JSON.parse(raw);
        if (dbData) {
          dbData.users = dbData.users.filter((u: any) => u.role !== 'STAFF');
        }
        return dbData!;
      } catch (e) {
        console.error('Error reading db file, falling back to seed:', e);
      }
    }

    dbData = {
      users: initialUsers,
      leads: initialLeads,
      payouts: initialPayouts,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
    };

    await this.save();
    return dbData;
  }

  static async save() {
    if (!dbData) return;
    isWriting = true;
    try {
      const neonSql = getNeonClient();
      if (neonSql) {
        try {
          await this.saveToNeon(neonSql, dbData);
        } catch (err) {
          console.error('❌ [Neon Postgres] Error saving to Neon:', err);
        }
      }

      // Also persist to local JSON file for backup / offline safety
      await this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
    } finally {
      isWriting = false;
    }
  }

  // Mutex lock wrapper for atomic operations
  private static lockPromise: Promise<void> = Promise.resolve();

  static async withLock<T>(fn: (db: DatabaseSchema) => Promise<T> | T): Promise<T> {
    const nextLock = this.lockPromise.then(async () => {
      const db = await this.init();
      const res = await fn(db);
      await this.save();
      return res;
    });

    this.lockPromise = nextLock.then(() => {}).catch(() => {});
    return nextLock;
  }

  static async get(): Promise<DatabaseSchema> {
    return this.init();
  }
}
