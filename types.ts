
export interface Test {
  id: string;
  name: string;
  price: number;
}

export interface BillItem extends Test {
  discount: number;
}

export interface TestCategory {
  category: string;
  tests: Test[];
}

export interface PatientDetails {
    name: string;
    age: string;
    sex: 'Male' | 'Female' | 'Other' | '';
    refdBy: string;
}

export interface PaymentDetails {
    paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Other' | '';
    amountPaid: number;
}

export interface User {
    username: string;
    role: 'admin' | 'user';
}

export interface SavedBill {
    billNumber: number;
    date: string;
    patientDetails: PatientDetails;
    billItems: BillItem[];
    totalDiscount: number;
    paymentDetails: PaymentDetails;
    commissionRate: number;
    subtotal: number;
    totalAmount: number;
    tax: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    status?: 'active' | 'voided';
    voidedInfo?: {
        voidedBy: string;
        voidedAt: string;
        reason: string;
    };
}

export interface AppSettings {
    labName: string;
    labAddress: string;
    labContact: string;
    taxRate: number; // e.g., 0.05 for 5%
    referringDoctors: string[];
    autoDeleteDays: number; // 0 to disable
}

export interface AuditLogEntry {
    timestamp: string;
    user: string;
    action: string;
    details: string;
}
