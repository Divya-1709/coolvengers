import {
  User,
  ReferralLead,
  PayoutRecord,
  Notification,
  AuditLog,
  AmbassadorSummary,
  LeadStatus,
  PayoutMethodType,
  BankDetails,
} from '../types/index.js';

const RAW_API_URL = (import.meta.env.VITE_API_URL as string) || '';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = API_BASE_URL.startsWith('http') ? API_BASE_URL : window.location.origin;
  const url = new URL(path.startsWith('/') ? path : `/${path}`, base);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
  }
  return url.toString();
}

class ApiService {
  private currentUserId: string | null = null;

  setUserId(id: string | null) {
    this.currentUserId = id;
    if (id) {
      localStorage.setItem('cv_user_id', id);
    } else {
      localStorage.removeItem('cv_user_id');
    }
  }

  getUserId(): string | null {
    const saved = localStorage.getItem('cv_user_id');
    if (saved) return saved;
    return this.currentUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    const uid = this.getUserId();
    if (uid) {
      headers.set('Authorization', `Bearer ${uid}`);
    }

    const fullUrl =
      endpoint.startsWith('http://') || endpoint.startsWith('https://')
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = 'Request failed';
      try {
        const data = await res.json();
        errMsg = data.error || errMsg;
      } catch {
        errMsg = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errMsg);
    }

    return res.json();
  }

  // Auth & Profile
  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  }

  async getDemoUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/api/auth/demo-users');
  }

  async login(email: string, role?: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async registerAmbassador(data: {
    name: string;
    email: string;
    phone: string;
    payoutMethod?: PayoutMethodType;
    upiId?: string;
    bankDetails?: BankDetails;
  }): Promise<{ message: string; token: string; user: User }> {
    return this.request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayoutMethod(data: {
    method: PayoutMethodType;
    upiId?: string;
    bankDetails?: BankDetails;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/api/auth/payout-method', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePayoutDetails(data: {
    method: PayoutMethodType;
    upiId?: string;
    bankDetails?: BankDetails;
  }): Promise<{ message: string; user: User }> {
    return this.updatePayoutMethod(data);
  }

  // Leads
  async submitLead(data: {
    customerName: string;
    customerPhone: string;
    customerLocation: string;
    acServiceType: string;
    acUnitsCount: number;
    customerNotes?: string;
  }): Promise<{ message: string; lead: ReferralLead }> {
    return this.request<{ message: string; lead: ReferralLead }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeads(params?: {
    status?: string;
    ambassadorId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ leads: ReferralLead[] }> {
    const url = buildUrl('/api/leads', params);
    return this.request<{ leads: ReferralLead[] }>(url);
  }

  async updateLeadStatus(
    id: string,
    data: {
      status: LeadStatus;
      scheduledDate?: string;
      technicianNotes?: string;
      rejectionReason?: string;
    }
  ): Promise<{ message: string; lead: ReferralLead }> {
    return this.request<{ message: string; lead: ReferralLead }>(`/api/leads/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payouts
  async getPayoutSummary(): Promise<{
    metrics: {
      totalAmbassadors: number;
      payableReferralsCount: number;
      totalPendingAmount: number;
      totalPaidAmount: number;
      totalPayoutTransactions: number;
    };
    ambassadors: AmbassadorSummary[];
    payableLeads: ReferralLead[];
  }> {
    return this.request('/api/payouts/summary');
  }

  async getPayoutHistory(params?: {
    search?: string;
    ambassadorId?: string;
    startDate?: string;
    endDate?: string;
    method?: string;
  }): Promise<{ payouts: PayoutRecord[] }> {
    const url = buildUrl('/api/payouts/history', params);
    return this.request<{ payouts: PayoutRecord[] }>(url);
  }

  async recordManualPayout(data: {
    ambassadorId: string;
    referralIds: string[];
    paymentMethod: PayoutMethodType;
    transactionRef: string;
    paymentDate: string;
    amount: number;
    adminNotes?: string;
    transferConfirmed: boolean;
  }): Promise<{ message: string; payout: PayoutRecord }> {
    return this.request<{ message: string; payout: PayoutRecord }>('/api/payouts/record-manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // CSV Export
  async exportCsv(type: 'payouts' | 'referrals') {
    const url = buildUrl('/api/payouts/export-csv', { type });
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.getUserId()}`,
      },
    });
    if (!res.ok) throw new Error('Failed to generate CSV');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `coolvengers_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request('/api/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/api/notifications/mark-all-read', { method: 'PUT' });
  }

  // Audit
  async getAuditLogs(params?: { search?: string; entityType?: string; limit?: number }): Promise<{ logs: AuditLog[] }> {
    const url = buildUrl('/api/audit', params);
    return this.request(url);
  }
}

export const api = new ApiService();
