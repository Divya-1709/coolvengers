import { Router, Request, Response } from 'express';
import { Database } from '../db.js';
import { authenticate, requireRole } from './auth.js';
import { LeadStatus, ReferralLead, User } from '../types.js';

export const leadsRouter = Router();

// Submit a new referral lead (Ambassadors only - Admins verify services and process payouts)
leadsRouter.post('/', authenticate, requireRole('AMBASSADOR'), async (req: Request, res: Response) => {
  const user = (req as any).user as User;

  const { customerName, customerPhone, customerLocation, acServiceType, acUnitsCount, customerNotes } = req.body;

  if (!customerName || !customerPhone || !customerLocation || !acServiceType) {
    return res.status(400).json({ error: 'Customer Name, Mobile Number, Location, and AC Service are required.' });
  }

  // Clean phone number (strip spaces/dashes)
  const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  try {
    const result = await Database.withLock((db) => {
      // Duplicate prevention:
      // Check if this mobile number already has an active or pending referral within the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const existingLead = db.leads.find(l => {
        const leadPhone = l.customerPhone.replace(/\D/g, '').slice(-10);
        return leadPhone === cleanPhone &&
          l.createdAt >= thirtyDaysAgo &&
          l.status !== 'Rejected';
      });

      if (existingLead) {
        throw new Error(
          `Duplicate lead prevented! Mobile number ${cleanPhone} was already referred recently (Referral ID: ${existingLead.referralId}, Status: ${existingLead.status}). Repeat submissions are protected against duplicate rewards.`
        );
      }

      // Generate unique referral ID: CV-REF-XXXXX
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const referralId = `CV-REF-${randomSuffix}`;

      const newLead: ReferralLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        referralId,
        ambassadorId: user.ambassadorId,
        ambassadorName: user.name,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerLocation: customerLocation.trim(),
        acServiceType: acServiceType.trim(),
        acUnitsCount: Math.max(1, Number(acUnitsCount) || 1),
        customerNotes: customerNotes?.trim() || '',
        status: 'New Lead',
        rewardAmount: 100,
        rewardEligible: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.leads.unshift(newLead);

      // Audit log
      db.auditLogs.push({
        id: `audit_${Date.now()}`,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'SUBMIT_REFERRAL_LEAD',
        entityType: 'REFERRAL',
        entityId: referralId,
        details: `Referral submitted for ${newLead.customerName} (${newLead.acServiceType}) by ${user.name}`,
        timestamp: new Date().toISOString(),
      });

      return newLead;
    });

    res.status(201).json({
      message: 'Referral submitted successfully!',
      lead: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit referral' });
  }
});

// List leads with role-based filtering, search, date range, and status filter
leadsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { status, ambassadorId, search, startDate, endDate } = req.query;
  const db = await Database.get();

  let leads = [...db.leads];

  // RBAC isolation: Ambassadors can ONLY see their own referrals
  if (user.role === 'AMBASSADOR') {
    leads = leads.filter(l => l.ambassadorId === user.ambassadorId);
  } else if (ambassadorId) {
    leads = leads.filter(l => l.ambassadorId === ambassadorId);
  }

  // Filter by status
  if (status && status !== 'ALL') {
    leads = leads.filter(l => l.status === status);
  }

  // Filter by date range
  if (startDate) {
    leads = leads.filter(l => l.createdAt >= String(startDate));
  }
  if (endDate) {
    const end = new Date(String(endDate));
    end.setHours(23, 59, 59, 999);
    leads = leads.filter(l => l.createdAt <= end.toISOString());
  }

  // Search by customer name, phone, referral ID, or ambassador name
  if (search) {
    const term = String(search).toLowerCase();
    leads = leads.filter(l =>
      l.customerName.toLowerCase().includes(term) ||
      l.customerPhone.includes(term) ||
      l.referralId.toLowerCase().includes(term) ||
      l.ambassadorName.toLowerCase().includes(term) ||
      l.customerLocation.toLowerCase().includes(term) ||
      l.acServiceType.toLowerCase().includes(term)
    );
  }

  res.json({ leads });
});

// Get single lead details
leadsRouter.get('/:id', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const db = await Database.get();
  const lead = db.leads.find(l => l.id === req.params.id || l.referralId === req.params.id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  // Security check: Ambassadors can only inspect their own leads
  if (user.role === 'AMBASSADOR' && lead.ambassadorId !== user.ambassadorId) {
    return res.status(403).json({ error: 'Access denied to this referral record' });
  }

  res.json({ lead });
});

// Update Lead Status & Service Verification (Super Admin only - all work carried out by Super Admin)
leadsRouter.put('/:id/status', authenticate, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { status, scheduledDate, technicianNotes, rejectionReason } = req.body;

  const validStatuses: LeadStatus[] = [
    'New Lead',
    'Contacted',
    'Service Scheduled',
    'Service Completed',
    'Payment Pending',
    'Paid',
    'Rejected',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid lead status provided' });
  }

  try {
    const result = await Database.withLock((db) => {
      const lead = db.leads.find(l => l.id === req.params.id || l.referralId === req.params.id);
      if (!lead) {
        throw new Error('Referral lead not found');
      }

      // If already paid, prevent status regression or duplicate manipulation
      if (lead.status === 'Paid') {
        throw new Error('This referral has already been paid and settled. Status cannot be modified.');
      }

      const previousStatus = lead.status;

      // Update technician/service metadata if provided
      if (technicianNotes !== undefined) lead.technicianNotes = technicianNotes;
      if (scheduledDate !== undefined) lead.scheduledDate = scheduledDate;
      if (rejectionReason !== undefined) lead.rejectionReason = rejectionReason;

      // CORE REQUIREMENT:
      // "Award ₹100 per eligible successful referral only after an authorized staff member verifies that the service is completed."
      // When status is set to 'Service Completed', we verify and award eligibility, moving it to 'Payment Pending'.
      if (status === 'Service Completed') {
        lead.rewardEligible = true;
        lead.rewardAmount = 100;
        lead.verifiedByStaffId = user.id;
        lead.verifiedByStaffName = user.name;
        lead.verifiedAt = new Date().toISOString();
        // Automatically transition into Payment Pending so Super Admin can disburse payout
        lead.status = 'Payment Pending';

        // Notify Ambassador of successful referral!
        const ambassadorUser = db.users.find(u => u.ambassadorId === lead.ambassadorId);
        if (ambassadorUser) {
          db.notifications.push({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: ambassadorUser.id,
            title: '🎉 Referral Completed & ₹100 Queued!',
            message: `Awesome! Referral ${lead.referralId} for ${lead.customerName} has been verified completed by ${user.name}. ₹100 reward has been queued for your next payout!`,
            type: 'REWARD_EARNED',
            referralId: lead.referralId,
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        db.auditLogs.push({
          id: `audit_${Date.now()}`,
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: 'VERIFY_SERVICE_COMPLETED',
          entityType: 'REFERRAL',
          entityId: lead.referralId,
          details: `Staff member ${user.name} verified AC service completion for ${lead.customerName}. ₹100 reward unlocked; status -> Payment Pending.`,
          timestamp: new Date().toISOString(),
        });
      } else {
        lead.status = status;

        if (status === 'Rejected') {
          lead.rewardEligible = false;
        }

        db.auditLogs.push({
          id: `audit_${Date.now()}`,
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: 'UPDATE_LEAD_STATUS',
          entityType: 'REFERRAL',
          entityId: lead.referralId,
          details: `Status transitioned from '${previousStatus}' to '${status}' by ${user.name}. Notes: ${technicianNotes || rejectionReason || 'None'}`,
          timestamp: new Date().toISOString(),
        });
      }

      lead.updatedAt = new Date().toISOString();
      return lead;
    });

    res.json({
      message: `Lead status updated to ${result.status}`,
      lead: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update lead status' });
  }
});
