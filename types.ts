
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
}