
export interface Test {
    id: string;
    name: string;
    price: number;
    subcategory?: string; // Added for tree-view organization
    commissionDay?: number;
    commissionNight?: number;
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
    discount: number; // Discount per item is still in absolute amount
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
    totalDiscount: number; // This will now be a percentage for bill-level discount
    paymentDetails: PaymentDetails;
    totalCommissionAmount: number; // Added to store calculated commission for a bill
    subtotal: number;
    tax: number; // Tax is removed from calculations, but kept in type for historical data, will be 0
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
    cancellationRequest?: {
        requestedBy: string;
        requestedAt: string;
        reason: string;
        status: 'pending' | 'approved' | 'rejected';
    };
    billType: 'Standard' | 'Department';
    department?: string;
    lastModifiedAt?: string; // Added for audit trail on modifications
    lastModifiedBy?: string; // Added for audit trail on modifications
}

export interface AppSettings {
    labName: string;
    labAddress: string;
    labContact: string;
    taxRate: number; // Tax is removed from calculations, but kept in type for potential future use or historical data context
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
