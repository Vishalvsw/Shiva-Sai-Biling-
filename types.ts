
export interface Test {
    id: string;
    name: string;
    price: number; // Day Price
    priceNight?: number; // Night Price
    subcategory?: string; 
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
    phone: string;
    refdBy: string;
    doctorPhone?: string;
}

export interface BillItem extends Test {
    discount: number; 
    activePrice: number; // The price actually used (Day or Night)
    activeCommission: number; // The commission actually used
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
    totalCommissionAmount: number;
    subtotal: number;
    tax: number;
    totalAmount: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    billedBy: string;
    verificationStatus: 'Verified' | 'Pending' | 'Rejected';
    rejectionReason?: string;
    status: 'active' | 'voided';
    shift: 'Day' | 'Night'; // Track which shift this bill belongs to
    voidedInfo?: {
        voidedBy: string;
        voidedAt: string;
        reason: string;
    };
    cancellationRequest?: {
        requestedBy: string;
        requestedAt: string;
        reason: string;
        status: 'pending' | 'approved' | 'rejected';
    };
    modificationRequest?: {
        requestedBy: string;
        requestedAt: string;
        reason: string;
        status: 'pending' | 'resolved' | 'rejected';
    };
    billType: 'Standard' | 'Department';
    department?: string;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}

export interface Doctor {
    name: string;
    phone: string;
}

export interface AppSettings {
    labName: string;
    labAddress: string;
    labContact: string;
    taxRate: number;
    referringDoctors: Doctor[];
    autoDeleteDays: number;
    verificationThreshold: number;
    currentShift: 'Day' | 'Night'; // Global toggle for current pricing mode
}

export interface AuditLogEntry {
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

export interface TestNickname {
    id: string;
    name: string;
    commission: number;
    testIds: string[];
}
