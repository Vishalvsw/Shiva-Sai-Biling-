
import React, { useState, useEffect, useCallback } from 'react';
import { Test, PatientDetails, BillItem, PaymentDetails } from './types';
import { TEST_DATA, TAX_RATE } from './constants';
import TestSelector from './components/TestSelector';
import Bill from './components/Bill';
import Header from './components/Header';

const App: React.FC = () => {
    const [patientDetails, setPatientDetails] = useState<PatientDetails>(() => {
        const saved = localStorage.getItem('patientDetails');
        return saved ? JSON.parse(saved) : { name: '', age: '', sex: '', refdBy: '' };
    });

    const [billItems, setBillItems] = useState<BillItem[]>(() => {
        const saved = localStorage.getItem('billItems');
        return saved ? JSON.parse(saved) : [];
    });

     const [totalDiscount, setTotalDiscount] = useState<number>(() => {
        const saved = localStorage.getItem('totalDiscount');
        return saved ? JSON.parse(saved) : 0;
    });

    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(() => {
        const saved = localStorage.getItem('paymentDetails');
        return saved ? JSON.parse(saved) : { paymentMethod: '', amountPaid: 0 };
    });
    
    const [commissionRate, setCommissionRate] = useState<number>(() => {
        const saved = localStorage.getItem('commissionRate');
        return saved ? JSON.parse(saved) : 0;
    });

    const [billNumber, setBillNumber] = useState<number>(() => {
        const savedBillNumber = localStorage.getItem('currentBillNumber');
        const savedItems = localStorage.getItem('billItems');
        const hasActiveBill = savedItems && JSON.parse(savedItems).length > 0;

        if (hasActiveBill && savedBillNumber) {
            return JSON.parse(savedBillNumber);
        }
        
        const lastBillNumber = parseInt(localStorage.getItem('lastBillNumber') || '0', 10);
        return lastBillNumber + 1;
    });
    
    useEffect(() => {
        localStorage.setItem('patientDetails', JSON.stringify(patientDetails));
    }, [patientDetails]);

    useEffect(() => {
        localStorage.setItem('billItems', JSON.stringify(billItems));
    }, [billItems]);

     useEffect(() => {
        localStorage.setItem('totalDiscount', JSON.stringify(totalDiscount));
    }, [totalDiscount]);

    useEffect(() => {
        localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
    }, [paymentDetails]);

    useEffect(() => {
        localStorage.setItem('commissionRate', JSON.stringify(commissionRate));
    }, [commissionRate]);

    useEffect(() => {
        localStorage.setItem('currentBillNumber', JSON.stringify(billNumber));
    }, [billNumber]);

    const handleAddTest = useCallback((test: Test) => {
        setBillItems(prevItems => {
            if (prevItems.some(item => item.id === test.id)) {
                return prevItems;
            }
            return [...prevItems, { ...test, discount: 0 }];
        });
    }, []);

    const handleRemoveTest = useCallback((testId: string) => {
        setBillItems(prevItems => prevItems.filter(item => item.id !== testId));
    }, []);
    
    const handleItemDiscountChange = useCallback((testId: string, discountValue: number) => {
        setBillItems(prevItems =>
            prevItems.map(item =>
                item.id === testId ? { ...item, discount: discountValue } : item
            )
        );
    }, []);


    const handleClearBill = useCallback(() => {
        const lastBillNumber = parseInt(localStorage.getItem('lastBillNumber') || '0', 10);
        const newLast = Math.max(lastBillNumber, billNumber);
        localStorage.setItem('lastBillNumber', newLast.toString());

        const newBillNumber = newLast + 1;

        setBillItems([]);
        setPatientDetails({ name: '', age: '', sex: '', refdBy: '' });
        setTotalDiscount(0);
        setPaymentDetails({ paymentMethod: '', amountPaid: 0 });
        setCommissionRate(0);
        setBillNumber(newBillNumber);
    }, [billNumber]);

    return (
        <div className="min-h-screen bg-slate-100 font-sans print:bg-white">
            <Header />
            <main className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1 print:p-0">
                <div className="print:hidden">
                    <TestSelector testData={TEST_DATA} onAddTest={handleAddTest} />
                </div>
                <div>
                    <Bill
                        items={billItems}
                        patientDetails={patientDetails}
                        onPatientDetailsChange={setPatientDetails}
                        onRemoveItem={handleRemoveTest}
                        onClearBill={handleClearBill}
                        taxRate={TAX_RATE}
                        billNumber={billNumber}
                        totalDiscount={totalDiscount}
                        onTotalDiscountChange={setTotalDiscount}
                        onItemDiscountChange={handleItemDiscountChange}
                        paymentDetails={paymentDetails}
                        onPaymentDetailsChange={setPaymentDetails}
                        commissionRate={commissionRate}
                        onCommissionRateChange={setCommissionRate}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;
