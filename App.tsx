import React, { useState, useEffect, useCallback } from 'react';
import { Test, PatientDetails, BillItem, PaymentDetails, User, SavedBill } from './types';
import { TEST_DATA, TAX_RATE } from './constants';
import { USERS } from './users';
import TestSelector from './components/TestSelector';
import Bill from './components/Bill';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import History from './components/History';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
    // --- APP STATE ---
    const [viewMode, setViewMode] = useState<'billing' | 'history' | 'dashboard'>('billing');
    const [isViewingArchived, setIsViewingArchived] = useState<boolean>(false);
    
    // --- AUTHENTICATION STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // --- BILLING STATE ---
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
    
    const [savedBills, setSavedBills] = useState<SavedBill[]>(() => {
        const saved = localStorage.getItem('savedBills');
        return saved ? JSON.parse(saved) : [];
    });
    
    // --- EFFECTS ---
     useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    useEffect(() => {
        if(viewMode !== 'billing') return;
        localStorage.setItem('patientDetails', JSON.stringify(patientDetails));
    }, [patientDetails, viewMode]);

    useEffect(() => {
        if(viewMode !== 'billing') return;
        localStorage.setItem('billItems', JSON.stringify(billItems));
    }, [billItems, viewMode]);

     useEffect(() => {
        if(viewMode !== 'billing') return;
        localStorage.setItem('totalDiscount', JSON.stringify(totalDiscount));
    }, [totalDiscount, viewMode]);

    useEffect(() => {
        if(viewMode !== 'billing') return;
        localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
    }, [paymentDetails, viewMode]);

    useEffect(() => {
        if(viewMode !== 'billing') return;
        localStorage.setItem('commissionRate', JSON.stringify(commissionRate));
    }, [commissionRate, viewMode]);

    useEffect(() => {
        if(viewMode !== 'billing') return;
        localStorage.setItem('currentBillNumber', JSON.stringify(billNumber));
    }, [billNumber, viewMode]);
    
    useEffect(() => {
        localStorage.setItem('savedBills', JSON.stringify(savedBills));
    }, [savedBills]);

    // --- HANDLERS ---
    const handleLogin = (username: string, password: string): boolean => {
        const userInDb = USERS[username as keyof typeof USERS];
        if (userInDb && userInDb.password === password) {
            const user: User = { username, role: userInDb.role as 'admin' | 'user' };
            setCurrentUser(user);
            // Set initial view based on role
            setViewMode(user.role === 'admin' ? 'dashboard' : 'billing');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleAddTest = useCallback((test: Test) => {
        setIsViewingArchived(false); // Any edit creates a new, unsaved bill
        setBillItems(prevItems => {
            if (prevItems.some(item => item.id === test.id)) {
                return prevItems;
            }
            return [...prevItems, { ...test, discount: 0 }];
        });
    }, []);

    const handleRemoveTest = useCallback((testId: string) => {
        setIsViewingArchived(false);
        setBillItems(prevItems => prevItems.filter(item => item.id !== testId));
    }, []);
    
    const handleItemDiscountChange = useCallback((testId: string, discountValue: number) => {
        setIsViewingArchived(false);
        setBillItems(prevItems =>
            prevItems.map(item =>
                item.id === testId ? { ...item, discount: discountValue } : item
            )
        );
    }, []);

    const handleClearBill = useCallback(() => {
        const newBillNumber = Math.max(
            parseInt(localStorage.getItem('lastBillNumber') || '0', 10),
            ...savedBills.map(b => b.billNumber)
        ) + 1;

        setBillItems([]);
        setPatientDetails({ name: '', age: '', sex: '', refdBy: '' });
        setTotalDiscount(0);
        setPaymentDetails({ paymentMethod: '', amountPaid: 0 });
        setCommissionRate(0);
        setBillNumber(newBillNumber);
        setIsViewingArchived(false);
    }, [savedBills]);

    const handleSaveBill = useCallback(() => {
        const subtotal = billItems.reduce((acc, item) => acc + item.price, 0);
        const itemDiscounts = billItems.reduce((acc, item) => acc + item.discount, 0);
        const cappedTotalDiscount = Math.max(0, Math.min(totalDiscount, subtotal - itemDiscounts));
        const totalDiscountAmount = itemDiscounts + cappedTotalDiscount;
        const taxableAmount = subtotal - totalDiscountAmount;
        const tax = taxableAmount * TAX_RATE;
        const total = taxableAmount + tax;
        const balanceDue = total - paymentDetails.amountPaid;

        const newSavedBill: SavedBill = {
            billNumber,
            date: new Date().toISOString(),
            patientDetails,
            billItems,
            totalDiscount,
            paymentDetails,
            commissionRate,
            subtotal,
            tax,
            totalAmount: total,
            balanceDue,
        };
        
        setSavedBills(prev => [...prev, newSavedBill]);
        localStorage.setItem('lastBillNumber', billNumber.toString());
        handleClearBill();
    }, [billItems, patientDetails, totalDiscount, paymentDetails, commissionRate, billNumber, handleClearBill]);

    const handleViewArchivedBill = useCallback((bill: SavedBill) => {
        setBillNumber(bill.billNumber);
        setPatientDetails(bill.patientDetails);
        setBillItems(bill.billItems);
        setTotalDiscount(bill.totalDiscount);
        setPaymentDetails(bill.paymentDetails);
        setCommissionRate(bill.commissionRate);
        setIsViewingArchived(true);
        setViewMode('billing');
    }, []);


    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }
    
    const renderContent = () => {
        switch (viewMode) {
            case 'billing':
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
                        <div className="print:hidden">
                            <TestSelector testData={TEST_DATA} onAddTest={handleAddTest} />
                        </div>
                        <div>
                            <Bill
                                items={billItems}
                                patientDetails={patientDetails}
                                onPatientDetailsChange={(details) => {
                                    setIsViewingArchived(false);
                                    setPatientDetails(details);
                                }}
                                onRemoveItem={handleRemoveTest}
                                onClearBill={handleClearBill}
                                onSaveBill={handleSaveBill}
                                taxRate={TAX_RATE}
                                billNumber={billNumber}
                                totalDiscount={totalDiscount}
                                onTotalDiscountChange={(discount) => {
                                    setIsViewingArchived(false);
                                    setTotalDiscount(discount);
                                }}
                                onItemDiscountChange={handleItemDiscountChange}
                                paymentDetails={paymentDetails}
                                onPaymentDetailsChange={(details) => {
                                    setIsViewingArchived(false);
                                    setPaymentDetails(details);
                                }}
                                commissionRate={commissionRate}
                                onCommissionRateChange={(rate) => {
                                    setIsViewingArchived(false);
                                    setCommissionRate(rate);
                                }}
                                userRole={currentUser.role}
                                isViewingArchived={isViewingArchived}
                            />
                        </div>
                    </div>
                );
            case 'history':
                return (
                    <History 
                        savedBills={savedBills} 
                        onViewBill={handleViewArchivedBill} 
                    />
                );
            case 'dashboard':
                if (currentUser.role === 'admin') {
                    return <AdminDashboard />;
                }
                // Fallback for non-admins trying to access dashboard
                setViewMode('billing');
                return null;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans print:bg-white">
            <Header 
                currentUser={currentUser} 
                onLogout={handleLogout}
                viewMode={viewMode}
                onSetViewMode={setViewMode}
            />
            <main className="p-4 sm:p-6 md:p-8 print:p-0">
                 {renderContent()}
            </main>
        </div>
    );
};

export default App;