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
let neonInitialized = false;

// Dirty-tracking: only write records that actually changed
const dirtyUsers = new Set<string>();
const dirtyLeads = new Set<string>();
const dirtyPayouts = new Set<string>();
const dirtyNotifications = new Set<string>();
const dirtyAuditLogs = new Set<string>();

export function markDirty(table: keyof DatabaseSchema, id: string) {
  switch (table) {
    case 'users': dirtyUsers.add(id); break;
    case 'leads': dirtyLeads.add(id); break;
    case 'payouts': dirtyPayouts.add(id); break;
    case 'notifications': dirtyNotifications.add(id); break;
    case 'auditLogs': dirtyAuditLogs.add(id); break;
  }
}

function clearDirty() {
  dirtyUsers.clear();
  dirtyLeads.clear();
  dirtyPayouts.clear();
  dirtyNotifications.clear();
  dirtyAuditLogs.clear();
}

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

import { hashPassword } from './routes/auth.js';

// Clean initial seed data with Super Admin account only
const initialUsers: User[] = [
  {
    id: 'user_admin_1',
    ambassadorId: 'CV-ADMIN-01',
    name: 'Vikramaditya (Super Admin)',
    email: 'admin@coolvengers.com',
    phone: '+91 98450 11223',
    role: 'SUPER_ADMIN',
    passwordHash: '77353fcc5c8d143c360504c943f1a0cb:13e75478bfcfcbb5b88cfb4c72a2bfc0dcbf08e32d5f7e4d676daeb801187b13decc8812d71fc8c7ebda68351bfb9827605eb0e156d24a025637053e70862fc0',
    createdAt: '2026-08-01T10:00:00Z',
  },
];

const initialPayouts: PayoutRecord[] = [];

const initialLeads: ReferralLead[] = [];

const initialNotifications: Notification[] = [];
const initialAuditLogs: AuditLog[] = [];

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

    // Migration: ensure all users have a password hash
    const usersWithoutPassword = await sql`SELECT id, email, role FROM users WHERE password_hash IS NULL;`;
    if (usersWithoutPassword.length > 0) {
      console.log(`🔐 [Neon Postgres] Setting passwords for ${usersWithoutPassword.length} user(s) without password...`);
      for (const u of usersWithoutPassword) {
        // Check if this user matches our initial seed data
        const seedUser = initialUsers.find(su => su.id === u.id);
        const pwHash = seedUser?.passwordHash || hashPassword('changeme123');
        await sql`UPDATE users SET password_hash = ${pwHash} WHERE id = ${u.id};`;
        console.log(`  ✅ Password set for ${u.email} (${u.role})`);
      }
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

  // Save changes to Neon PostgreSQL — only dirty records
  private static async saveToNeon(sql: NeonQueryFunction<false, false>, data: DatabaseSchema) {
    const promises: Promise<any>[] = [];

    // Upsert only dirty users
    for (const u of data.users) {
      if (!dirtyUsers.has(u.id)) continue;
      promises.push(sql`
        INSERT INTO users (id, ambassador_id, name, email, phone, role, password_hash, payout_details, created_at)
        VALUES (${u.id}, ${u.ambassadorId}, ${u.name}, ${u.email}, ${u.phone}, ${u.role}, ${u.passwordHash || null}, ${JSON.stringify(u.payoutDetails || null)}::jsonb, ${u.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          payout_details = EXCLUDED.payout_details;
      `);
    }

    // Upsert only dirty leads
    for (const l of data.leads) {
      if (!dirtyLeads.has(l.id)) continue;
      promises.push(sql`
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
      `);
    }

    // Upsert only dirty payouts
    for (const p of data.payouts) {
      if (!dirtyPayouts.has(p.id)) continue;
      promises.push(sql`
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
      `);
    }

    // Upsert only dirty notifications
    for (const n of data.notifications) {
      if (!dirtyNotifications.has(n.id)) continue;
      promises.push(sql`
        INSERT INTO notifications (id, user_id, title, message, type, referral_id, payout_id, is_read, created_at)
        VALUES (${n.id}, ${n.userId}, ${n.title}, ${n.message}, ${n.type}, ${n.referralId || null}, ${n.payoutId || null}, ${n.isRead}, ${n.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          is_read = EXCLUDED.is_read;
      `);
    }

    // Upsert only dirty audit logs
    for (const a of data.auditLogs) {
      if (!dirtyAuditLogs.has(a.id)) continue;
      promises.push(sql`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, details, timestamp)
        VALUES (${a.id}, ${a.actorId}, ${a.actorName}, ${a.actorRole}, ${a.action}, ${a.entityType}, ${a.entityId}, ${a.details}, ${a.timestamp})
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Run all dirty upserts in parallel
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  static async init(): Promise<DatabaseSchema> {
    // Return cached data if already loaded
    if (dbData && neonInitialized) return dbData;

    const neonSql = getNeonClient();

    if (neonSql) {
      try {
        if (!neonInitialized) {
          await this.initNeonTables(neonSql);
          await this.seedNeonIfEmpty(neonSql);
        }
        dbData = await this.loadFromNeon(neonSql);
        neonInitialized = true;
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
    const hasDirty = dirtyUsers.size > 0 || dirtyLeads.size > 0 || dirtyPayouts.size > 0 || dirtyNotifications.size > 0 || dirtyAuditLogs.size > 0;

    isWriting = true;
    try {
      const neonSql = getNeonClient();
      if (neonSql && hasDirty) {
        try {
          await this.saveToNeon(neonSql, dbData);
        } catch (err) {
          console.error('❌ [Neon Postgres] Error saving to Neon:', err);
        }
      }

      // Also persist to local JSON file for backup / offline safety
      await this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
      clearDirty();
    } finally {
      isWriting = false;
    }
  }

  // Mutex lock wrapper for atomic operations
  private static lockPromise: Promise<void> = Promise.resolve();

  static async withLock<T>(fn: (db: DatabaseSchema) => Promise<T> | T): Promise<T> {
    const nextLock = this.lockPromise.then(async () => {
      const db = await this.init();

      // Snapshot serialized entries before mutation for automatic dirty detection
      const prevUsers = new Map<string, string>(db.users.map(u => [u.id, JSON.stringify(u)]));
      const prevLeads = new Map<string, string>(db.leads.map(l => [l.id, JSON.stringify(l)]));
      const prevPayouts = new Map<string, string>(db.payouts.map(p => [p.id, JSON.stringify(p)]));
      const prevNotifications = new Map<string, string>(db.notifications.map(n => [n.id, JSON.stringify(n)]));
      const prevAuditLogs = new Map<string, string>(db.auditLogs.map(a => [a.id, JSON.stringify(a)]));

      const res = await fn(db);

      // Detect any added or updated records
      for (const u of db.users) {
        if (prevUsers.get(u.id) !== JSON.stringify(u)) dirtyUsers.add(u.id);
      }
      for (const l of db.leads) {
        if (prevLeads.get(l.id) !== JSON.stringify(l)) dirtyLeads.add(l.id);
      }
      for (const p of db.payouts) {
        if (prevPayouts.get(p.id) !== JSON.stringify(p)) dirtyPayouts.add(p.id);
      }
      for (const n of db.notifications) {
        if (prevNotifications.get(n.id) !== JSON.stringify(n)) dirtyNotifications.add(n.id);
      }
      for (const a of db.auditLogs) {
        if (prevAuditLogs.get(a.id) !== JSON.stringify(a)) dirtyAuditLogs.add(a.id);
      }

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
