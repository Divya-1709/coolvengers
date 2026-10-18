export type UserRole = 'AMBASSADOR' | 'SUPER_ADMIN';

export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Service Scheduled'
  | 'Service Completed'
  | 'Payment Pending'
  | 'Paid'
  | 'Rejected';

export type PayoutMethodType = 'UPI' | 'BANK_TRANSFER';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface PayoutDetails {
  method: PayoutMethodType;
  upiId?: string;
  bankDetails?: BankDetails;
  updatedAt: string;
}

export interface User {
  id: string;
  ambassadorId: string; // e.g. "CV-AMB-1001" or "CV-ADMIN-01"
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash?: string;
  payoutDetails?: PayoutDetails;
  createdAt: string;
}

export interface ReferralLead {
  id: string;
  referralId: string; // e.g. "CV-REF-20491"
  ambassadorId: string;
  ambassadorName: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  acServiceType: string;
  acUnitsCount: number;
  customerNotes?: string;
  status: LeadStatus;
  rewardAmount: number; // default ₹100
  rewardEligible: boolean; // true once service is completed
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  technicianNotes?: string;
  scheduledDate?: string;
  payoutId?: string;
  paidAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRecord {
  id: string;
  payoutId: string; // e.g. "CV-PAY-98124"
  ambassadorId: string;
  ambassadorName: string;
  ambassadorPhone: string;
  payoutMethod: PayoutMethodType;
  payoutDetailsSnapshot: {
    upiId?: string;
    bankDetails?: BankDetails;
  };
  referralIds: string[]; // List of CV-REF IDs paid in this transaction
  referralCount: number;
  amountPerReferral: number;
  totalAmount: number;
  transactionRef: string; // UTR or Bank Reference entered by Super Admin
  paymentDate: string;
  adminId: string;
  adminName: string;
  adminNotes?: string;
  status: 'COMPLETED';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'LEAD_UPDATE' | 'REWARD_EARNED' | 'PAYOUT_SENT' | 'SYSTEM';
  referralId?: string;
  payoutId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'REFERRAL' | 'PAYOUT' | 'USER';
  entityId: string;
  details: string;
  timestamp: string;
}
