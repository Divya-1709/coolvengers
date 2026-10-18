import { Router, Request, Response } from 'express';
import { Database } from '../db.js';
import { authenticate, requireRole } from './auth.js';
import { PayoutRecord, User } from '../types.js';

export const payoutsRouter = Router();

// Summary of payable referrals grouped by ambassador (Super Admin only)
payoutsRouter.get('/summary', authenticate, requireRole('SUPER_ADMIN'), async (_req: Request, res: Response) => {
  const db = await Database.get();

  const payableLeads = db.leads.filter(l => l.status === 'Payment Pending' && l.rewardEligible && !l.payoutId);
  const paidLeads = db.leads.filter(l => l.status === 'Paid');

  // Group payable leads by ambassador
  const ambassadorMap: { [ambassadorId: string]: {
    ambassadorId: string;
    ambassadorName: string;
    phone: string;
    payoutDetails?: any;
    pendingCount: number;
    amountDue: number;
    pendingLeads: typeof payableLeads;
    lifetimePaidCount: number;
    lifetimePaidAmount: number;
  }} = {};

  // Initialize with all registered ambassadors
  for (const amb of db.users.filter(u => u.role === 'AMBASSADOR')) {
    ambassadorMap[amb.ambassadorId] = {
      ambassadorId: amb.ambassadorId,
      ambassadorName: amb.name,
      phone: amb.phone,
      payoutDetails: amb.payoutDetails,
      pendingCount: 0,
      amountDue: 0,
      pendingLeads: [],
      lifetimePaidCount: 0,
      lifetimePaidAmount: 0,
    };
  }

  // Populate pending leads
  for (const lead of payableLeads) {
    if (!ambassadorMap[lead.ambassadorId]) {
      ambassadorMap[lead.ambassadorId] = {
        ambassadorId: lead.ambassadorId,
        ambassadorName: lead.ambassadorName,
        phone: 'N/A',
        pendingCount: 0,
        amountDue: 0,
        pendingLeads: [],
        lifetimePaidCount: 0,
        lifetimePaidAmount: 0,
      };
    }
    ambassadorMap[lead.ambassadorId].pendingCount += 1;
    ambassadorMap[lead.ambassadorId].amountDue += lead.rewardAmount || 100;
    ambassadorMap[lead.ambassadorId].pendingLeads.push(lead);
  }

  // Populate lifetime paid metrics
  for (const lead of paidLeads) {
    if (ambassadorMap[lead.ambassadorId]) {
      ambassadorMap[lead.ambassadorId].lifetimePaidCount += 1;
      ambassadorMap[lead.ambassadorId].lifetimePaidAmount += lead.rewardAmount || 100;
    }
  }

  const ambassadorsList = Object.values(ambassadorMap);

  const totalPendingAmount = payableLeads.reduce((acc, l) => acc + (l.rewardAmount || 100), 0);
  const totalPaidAmount = db.payouts.reduce((acc, p) => acc + p.totalAmount, 0);

  res.json({
    metrics: {
      totalAmbassadors: db.users.filter(u => u.role === 'AMBASSADOR').length,
      payableReferralsCount: payableLeads.length,
      totalPendingAmount,
      totalPaidAmount,
      totalPayoutTransactions: db.payouts.length,
    },
    ambassadors: ambassadorsList,
    payableLeads,
  });
});

// Payout history (Super Admin sees all, Ambassador sees only their own)
payoutsRouter.get('/history', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { search, ambassadorId, startDate, endDate, method } = req.query;
  const db = await Database.get();

  let records = [...db.payouts];

  if (user.role === 'AMBASSADOR') {
    records = records.filter(p => p.ambassadorId === user.ambassadorId);
  } else if (ambassadorId) {
    records = records.filter(p => p.ambassadorId === ambassadorId);
  }

  if (method && method !== 'ALL') {
    records = records.filter(p => p.payoutMethod === method);
  }

  if (startDate) {
    records = records.filter(p => p.paymentDate >= String(startDate));
  }
  if (endDate) {
    records = records.filter(p => p.paymentDate <= String(endDate));
  }

  if (search) {
    const term = String(search).toLowerCase();
    records = records.filter(p =>
      p.payoutId.toLowerCase().includes(term) ||
      p.transactionRef.toLowerCase().includes(term) ||
      p.ambassadorName.toLowerCase().includes(term) ||
      p.ambassadorId.toLowerCase().includes(term) ||
      p.referralIds.some(r => r.toLowerCase().includes(term))
    );
  }

  // Sort descending by date
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ payouts: records });
});

// Record a manual payout (Super Admin only, strictly atomic and duplicate-protected)
payoutsRouter.post('/record-manual', authenticate, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const {
    ambassadorId,
    referralIds,
    paymentMethod,
    transactionRef,
    paymentDate,
    amount,
    adminNotes,
    transferConfirmed,
  } = req.body;

  if (!ambassadorId || !referralIds || !Array.isArray(referralIds) || referralIds.length === 0) {
    return res.status(400).json({ error: 'Ambassador ID and at least one referral ID must be selected.' });
  }

  if (!transactionRef || String(transactionRef).trim().length < 4) {
    return res.status(400).json({ error: 'A valid Transaction Reference / UTR Number is required for auditing.' });
  }

  if (!paymentDate) {
    return res.status(400).json({ error: 'Payment Date is required.' });
  }

  if (!transferConfirmed) {
    return res.status(400).json({
      error: 'Please confirm that the manual transfer has been executed outside the website before recording payout.',
    });
  }

  try {
    const result = await Database.withLock((db) => {
      // 1. Verify ambassador exists
      const targetAmbassador = db.users.find(u => u.ambassadorId === ambassadorId);
      if (!targetAmbassador) {
        throw new Error(`Ambassador with ID ${ambassadorId} not found.`);
      }

      // 2. Prevent duplicate UTR / transactionRef reuse if specified
      const cleanRef = String(transactionRef).trim();
      const existingRef = db.payouts.find(p => p.transactionRef.toLowerCase() === cleanRef.toLowerCase());
      if (existingRef) {
        throw new Error(
          `Transaction Reference / UTR "${cleanRef}" was already recorded in Payout ${existingRef.payoutId} on ${existingRef.paymentDate}. Every transfer must have a unique bank/UPI UTR.`
        );
      }

      // 3. Retrieve and validate all requested referrals
      const matchingLeads = db.leads.filter(l => referralIds.includes(l.referralId) || referralIds.includes(l.id));

      if (matchingLeads.length !== referralIds.length) {
        throw new Error('One or more selected referrals could not be found.');
      }

      // 4. Validate duplicate payout protection on each lead
      for (const lead of matchingLeads) {
        if (lead.ambassadorId !== ambassadorId) {
          throw new Error(`Referral ${lead.referralId} belongs to ${lead.ambassadorId}, not ${ambassadorId}.`);
        }
        if (lead.status === 'Paid' || lead.payoutId) {
          throw new Error(
            `Double payout prevention triggered! Referral ${lead.referralId} has already been paid under Payout ${lead.payoutId}.`
          );
        }
        if (lead.status !== 'Payment Pending' || !lead.rewardEligible) {
          throw new Error(
            `Referral ${lead.referralId} is currently '${lead.status}'. Only referrals in 'Payment Pending' with verified service can be paid.`
          );
        }
      }

      // Calculate total payable
      const calculatedTotal = matchingLeads.reduce((sum, l) => sum + (l.rewardAmount || 100), 0);
      const expectedTotal = Number(amount) || calculatedTotal;

      if (expectedTotal !== calculatedTotal) {
        throw new Error(`Amount mismatch: selected referrals total ₹${calculatedTotal}, but ₹${expectedTotal} was submitted.`);
      }

      // Generate unique Payout ID: CV-PAY-XXXXX
      const payoutSuffix = Math.floor(10000 + Math.random() * 90000);
      const payoutId = `CV-PAY-${payoutSuffix}`;
      const nowIso = new Date().toISOString();

      // Snapshot ambassador payout method
      const chosenMethod = paymentMethod || targetAmbassador.payoutDetails?.method || 'UPI';
      const detailsSnapshot = targetAmbassador.payoutDetails
        ? {
            upiId: targetAmbassador.payoutDetails.upiId,
            bankDetails: targetAmbassador.payoutDetails.bankDetails,
          }
        : {};

      // 5. Update referrals status to 'Paid'
      for (const lead of matchingLeads) {
        lead.status = 'Paid';
        lead.payoutId = payoutId;
        lead.paidAt = nowIso;
        lead.updatedAt = nowIso;
      }

      // 6. Create immutable Payout Record
      const newPayoutRecord: PayoutRecord = {
        id: `payout_${Date.now()}`,
        payoutId,
        ambassadorId,
        ambassadorName: targetAmbassador.name,
        ambassadorPhone: targetAmbassador.phone,
        payoutMethod: chosenMethod,
        payoutDetailsSnapshot: detailsSnapshot,
        referralIds: matchingLeads.map(l => l.referralId),
        referralCount: matchingLeads.length,
        amountPerReferral: 100,
        totalAmount: calculatedTotal,
        transactionRef: cleanRef,
        paymentDate,
        adminId: admin.id,
        adminName: admin.name,
        adminNotes: adminNotes?.trim() || 'Manual transfer verified by Super Admin.',
        status: 'COMPLETED',
        createdAt: nowIso,
      };

      db.payouts.unshift(newPayoutRecord);

      // 7. Send high-priority notification to Ambassador
      db.notifications.push({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: targetAmbassador.id,
        title: `💰 Payout of ₹${calculatedTotal} Received!`,
        message: `Your manual payout for ${matchingLeads.length} referral(s) [${matchingLeads.map(l => l.referralId).join(', ')}] was completed via ${chosenMethod}. Transaction Ref/UTR: ${cleanRef}. Date: ${paymentDate}.`,
        type: 'PAYOUT_SENT',
        payoutId,
        isRead: false,
        createdAt: nowIso,
      });

      // 8. Audit log entry
      db.auditLogs.push({
        id: `audit_${Date.now()}`,
        actorId: admin.id,
        actorName: admin.name,
        actorRole: admin.role,
        action: 'MANUAL_PAYOUT_RECORDED',
        entityType: 'PAYOUT',
        entityId: payoutId,
        details: `Super Admin ${admin.name} recorded manual ${chosenMethod} payout of ₹${calculatedTotal} for Ambassador ${targetAmbassador.name} (${ambassadorId}). UTR: ${cleanRef}. Referrals: ${matchingLeads.map(l => l.referralId).join(', ')}`,
        timestamp: nowIso,
      });

      return {
        payout: newPayoutRecord,
        updatedReferrals: matchingLeads,
      };
    });

    res.status(201).json({
      message: `Manual payout of ₹${result.payout.totalAmount} successfully recorded! Referrals marked as Paid.`,
      payout: result.payout,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record payout' });
  }
});

// CSV Export endpoint
payoutsRouter.get('/export-csv', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { type } = req.query; // 'payouts' or 'referrals'
  const db = await Database.get();

  if (type === 'payouts') {
    // Only Admin can export all payouts; ambassador can export their own
    let list = [...db.payouts];
    if (user.role === 'AMBASSADOR') {
      list = list.filter(p => p.ambassadorId === user.ambassadorId);
    }

    const headers = [
      'Payout ID',
      'Payment Date',
      'Ambassador ID',
      'Ambassador Name',
      'Phone',
      'Payment Mode',
      'Transaction Ref / UTR',
      'Referrals Count',
      'Total Amount (INR)',
      'Referral IDs',
      'Processed By',
      'Notes',
    ];

    const rows = list.map(p => [
      `"${p.payoutId}"`,
      `"${p.paymentDate}"`,
      `"${p.ambassadorId}"`,
      `"${p.ambassadorName}"`,
      `"${p.ambassadorPhone}"`,
      `"${p.payoutMethod}"`,
      `"${p.transactionRef}"`,
      p.referralCount,
      p.totalAmount,
      `"${p.referralIds.join(';')}"`,
      `"${p.adminName}"`,
      `"${(p.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="coolvengers_payouts_${Date.now()}.csv"`);
    return res.send(csvContent);
  }

  // Otherwise referrals CSV
  let leads = [...db.leads];
  if (user.role === 'AMBASSADOR') {
    leads = leads.filter(l => l.ambassadorId === user.ambassadorId);
  }

  const headers = [
    'Referral ID',
    'Date Submitted',
    'Ambassador ID',
    'Ambassador Name',
    'Customer Name',
    'Customer Mobile',
    'Customer Location',
    'AC Service Type',
    'Units',
    'Status',
    'Reward Eligible',
    'Reward Amount (INR)',
    'Verified By Staff',
    'Verified Date',
    'Payout ID',
    'Paid Date',
  ];

  const rows = leads.map(l => [
    `"${l.referralId}"`,
    `"${l.createdAt.split('T')[0]}"`,
    `"${l.ambassadorId}"`,
    `"${l.ambassadorName}"`,
    `"${l.customerName}"`,
    `"${l.customerPhone}"`,
    `"${l.customerLocation.replace(/"/g, '""')}"`,
    `"${l.acServiceType}"`,
    l.acUnitsCount,
    `"${l.status}"`,
    l.rewardEligible ? 'YES' : 'NO',
    l.rewardAmount || 100,
    `"${l.verifiedByStaffName || 'N/A'}"`,
    `"${l.verifiedAt ? l.verifiedAt.split('T')[0] : 'N/A'}"`,
    `"${l.payoutId || 'N/A'}"`,
    `"${l.paidAt ? l.paidAt.split('T')[0] : 'N/A'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="coolvengers_referrals_${Date.now()}.csv"`);
  res.send(csvContent);
});
