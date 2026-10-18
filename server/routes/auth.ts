import { Router, Request, Response, NextFunction } from 'express';
import { Database } from '../db.js';
import { User, UserRole } from '../types.js';

export const authRouter = Router();

// Simple tokenless/cookie/header session resolver for app demo & production
// In real use, Bearer token with user ID or session ID is passed in Authorization header
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const db = await Database.get();

  let user: User | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userIdOrId = authHeader.substring(7).trim();
    user = db.users.find(u => u.id === userIdOrId || u.ambassadorId === userIdOrId || u.email === userIdOrId);
  }

  // Fallback to query param or default ambassador if not provided (for smooth testing)
  if (!user && req.query.asUser) {
    const asUserId = String(req.query.asUser);
    user = db.users.find(u => u.id === asUserId || u.ambassadorId === asUserId);
  }

  // If still not found, default to first ambassador for unauthenticated read if not protected
  (req as any).user = user;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden: requires ${roles.join(' or ')} role` });
    }
    next();
  };
}

// Get current user profile
authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

// Demo switch: list all users
authRouter.get('/demo-users', async (_req: Request, res: Response) => {
  const db = await Database.get();
  res.json({
    users: db.users.map(u => ({
      id: u.id,
      ambassadorId: u.ambassadorId,
      name: u.name,
      email: u.email,
      role: u.role,
      hasPayoutDetails: !!u.payoutDetails,
      payoutMethod: u.payoutDetails?.method,
    })),
  });
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, role } = req.body;
  const db = await Database.get();

  let user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user && role) {
    user = db.users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found. Try one of the demo accounts or register.' });
  }

  res.json({
    token: user.id,
    user,
  });
});

// Register new ambassador
authRouter.post('/register', async (req: Request, res: Response) => {
  const { name, email, phone, payoutMethod, upiId, bankDetails } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  if (payoutMethod === 'UPI' && (!upiId || !upiId.includes('@'))) {
    return res.status(400).json({ error: 'A valid UPI ID is required (e.g. yourname@okhdfcbank)' });
  }

  if (payoutMethod === 'BANK_TRANSFER' && (!bankDetails?.accountNumber || !bankDetails?.ifscCode)) {
    return res.status(400).json({ error: 'Bank account number and IFSC code are required for bank transfer' });
  }

  const result = await Database.withLock((db) => {
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    // Generate unique Ambassador ID: CV-AMB-XXXX
    const ambCount = db.users.filter(u => u.role === 'AMBASSADOR').length;
    const ambassadorId = `CV-AMB-${1000 + ambCount + 1}`;

    const newUser: User = {
      id: `user_amb_${Date.now()}`,
      ambassadorId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'AMBASSADOR',
      createdAt: new Date().toISOString(),
    };

    if (payoutMethod === 'UPI' && upiId) {
      newUser.payoutDetails = {
        method: 'UPI',
        upiId: upiId.trim(),
        updatedAt: new Date().toISOString(),
      };
    } else if (payoutMethod === 'BANK_TRANSFER' && bankDetails) {
      newUser.payoutDetails = {
        method: 'BANK_TRANSFER',
        bankDetails: {
          accountHolderName: bankDetails.accountHolderName?.trim() || name.trim(),
          accountNumber: bankDetails.accountNumber?.trim() || '',
          ifscCode: bankDetails.ifscCode?.trim().toUpperCase() || '',
          bankName: bankDetails.bankName?.trim() || '',
        },
        updatedAt: new Date().toISOString(),
      };
    }

    db.users.push(newUser);

    // Welcome notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: `Welcome to Coolvengers Ambassador Club!`,
      message: `Your Ambassador ID is ${ambassadorId}. Start referring AC repair, installation, and servicing leads to earn ₹100 per completed job!`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.auditLogs.push({
      id: `audit_${Date.now()}`,
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: 'AMBASSADOR',
      action: 'AMBASSADOR_REGISTERED',
      entityType: 'USER',
      entityId: ambassadorId,
      details: `New Ambassador registered: ${newUser.name} (${ambassadorId})`,
      timestamp: new Date().toISOString(),
    });

    return newUser;
  });

  res.status(201).json({
    message: 'Registered successfully',
    token: result.id,
    user: result,
  });
});

// Update Ambassador payout details (Ambassadors only)
authRouter.put('/payout-method', authenticate, requireRole('AMBASSADOR'), async (req: Request, res: Response) => {
  const user = (req as any).user as User;

  const { method, upiId, bankDetails } = req.body;

  if (method !== 'UPI' && method !== 'BANK_TRANSFER') {
    return res.status(400).json({ error: 'Valid payment method (UPI or BANK_TRANSFER) is required' });
  }

  if (method === 'UPI') {
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid UPI VPA ID (e.g. name@bank)' });
    }
  }

  if (method === 'BANK_TRANSFER') {
    if (!bankDetails?.accountNumber || !bankDetails?.ifscCode || !bankDetails?.accountHolderName) {
      return res.status(400).json({ error: 'Account holder name, account number, and IFSC code are required' });
    }
  }

  const updatedUser = await Database.withLock((db) => {
    const target = db.users.find(u => u.id === user.id);
    if (!target) throw new Error('User not found');

    target.payoutDetails = {
      method,
      upiId: method === 'UPI' ? upiId.trim() : undefined,
      bankDetails: method === 'BANK_TRANSFER' ? {
        accountHolderName: bankDetails.accountHolderName.trim(),
        accountNumber: bankDetails.accountNumber.trim(),
        ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
        bankName: bankDetails.bankName?.trim() || 'Bank Transfer',
      } : undefined,
      updatedAt: new Date().toISOString(),
    };

    db.auditLogs.push({
      id: `audit_${Date.now()}`,
      actorId: target.id,
      actorName: target.name,
      actorRole: target.role,
      action: 'UPDATE_PAYOUT_DETAILS',
      entityType: 'USER',
      entityId: target.ambassadorId,
      details: `Updated payout method to ${method}`,
      timestamp: new Date().toISOString(),
    });

    return target;
  });

  res.json({
    message: 'Payout details updated successfully',
    user: updatedUser,
  });
});
