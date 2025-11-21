
// FIX: The content of this file was incorrect and contained the main App component.
// It has been replaced with the correct type definitions.

export interface Test {
    id: string;
    name: string;
    price: number;
    subcategory?: string; // Added for tree-view organization
}

export interface TestCategory {
    category: string;
    tests: Test[];
    isMajor?: boolean;
}

export interface PatientDetails {
    name: string;
    age: string;
    sex: 'Male' | 'Female' | 'Other' | '';
    refdBy: string;
}

export interface BillItem extends Test {
    discount: number;
}

export interface PaymentDetails {
    paymentMethod: string;
    amountPaid: number;
}

export interface User {
    username: string;
    role: 'admin' | 'user';
}

export interface SavedBill {
    billNumber: number;
    date: string; // ISO string
    patientDetails: PatientDetails;
    billItems: BillItem[];
    totalDiscount: number;
    paymentDetails: PaymentDetails;
    commissionRate: number;
    subtotal: number;
    tax: number;
    totalAmount: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    billedBy: string;
    verificationStatus: 'Verified' | 'Pending' | 'Rejected';
    rejectionReason?: string;
    status: 'active' | 'voided';
    voidedInfo?: {
        voidedBy: string;
        voidedAt: string; // ISO string
        reason: string;
    };
    billType: 'Standard' | 'Department';
    department?: string;
}

export interface AppSettings {
    labName: string;
    labAddress: string;
    labContact: string;
    taxRate: number;
    referringDoctors: string[];
    autoDeleteDays: number;
    verificationThreshold: number;
}

export interface AuditLogEntry {
    timestamp: string; // ISO string
    user: string;
    action: string;
    details: string;
}
