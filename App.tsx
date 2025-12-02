import React, { useState, useEffect, useCallback } from 'react';
import { Test, PatientDetails, BillItem, PaymentDetails, User, SavedBill, AppSettings, TestCategory, AuditLogEntry } from './types';
import { DEFAULT_TEST_DATA, DEFAULT_SETTINGS } from './constants';
import { USERS } from './users';
import TestSelector from './components/TestSelector';
import Bill from './components/Bill';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import History from './components/History';
import AdminDashboard from './components/AdminDashboard';
import BillingReports from './components/BillingReports';
import ManageUsers from './components/ManageUsers';
import ManageTests from './components/ManageTests';
import BackupRestore from './components/BackupRestore';
import Settings from './components/Settings';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import ActivityLog from './components/ActivityLog';
import Workflow from './components/Workflow';


type AdminView = 'main' | 'reports' | 'users' | 'tests' | 'backup' | 'settings' | 'activity' | 'workflow';
type AppUser = { password: string; role: 'admin' | 'user' };

const App: React.FC = () => {
    // --- APP STATE ---
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'billing' | 'history' | 'dashboard'>('billing');
    const [adminView, setAdminView] = useState<AdminView>('main');
    const [isViewingArchived, setIsViewingArchived] = useState<boolean>(false);
    const [viewedBillDetails, setViewedBillDetails] = useState<SavedBill | null>(null);
    
    // --- AUTHENTICATION STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // --- DATA STATE ---
    const [users, setUsers] = useState<{ [key: string]: AppUser }>(() => {
        const saved = localStorage.getItem('appUsers');
        return saved ? JSON.parse(saved) : USERS;
    });

    const [testData, setTestData] = useState<TestCategory[]>(() => {
        const saved = localStorage.getItem('testData');
        return saved ? JSON.parse(saved) : DEFAULT_TEST_DATA;
    });
    
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
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
        // If tax was previously saved (old version), reset to 0
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

    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => {
        const saved = localStorage.getItem('auditLog');
        return saved ? JSON.parse(saved) : [];
    });
    
    // --- EFFECTS ---
     useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // Data persistence effects
    useEffect(() => { localStorage.setItem('appUsers', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('testData', JSON.stringify(testData)); }, [testData]);
    useEffect(() => { localStorage.setItem('appSettings', JSON.stringify(settings)); }, [settings]);
    useEffect(() => { localStorage.setItem('savedBills', JSON.stringify(savedBills)); }, [savedBills]);
    useEffect(() => { localStorage.setItem('auditLog', JSON.stringify(auditLog)); }, [auditLog]);

    // Current bill persistence effects
    useEffect(() => { if(viewMode !== 'billing') return; localStorage.setItem('patientDetails', JSON.stringify(patientDetails)); }, [patientDetails, viewMode]);
    useEffect(() => { if(viewMode !== 'billing') return; localStorage.setItem('billItems', JSON.stringify(billItems)); }, [billItems, viewMode]);
    useEffect(() => { if(viewMode !== 'billing') return; localStorage.setItem('totalDiscount', JSON.stringify(totalDiscount)); }, [totalDiscount, viewMode]);
    useEffect(() => { if(viewMode !== 'billing') return; localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails)); }, [paymentDetails, viewMode]);
    useEffect(() => { if(viewMode !== 'billing') return; localStorage.setItem('commissionRate', JSON.stringify(commissionRate)); }, [commissionRate, viewMode]);
    useEffect(() => { if(viewMode !== 'billing') return; localStorage.setItem('currentBillNumber', JSON.stringify(billNumber)); }, [billNumber, viewMode]);

    // Auto-delete old bills effect
    useEffect(() => {
        if (settings.autoDeleteDays > 0) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - settings.autoDeleteDays);
            
            const billsToKeep = savedBills.filter(bill => new Date(bill.date) >= cutoffDate);

            if (billsToKeep.length < savedBills.length) {
                console.log(`Auto-deleted ${savedBills.length - billsToKeep.length} bills older than ${settings.autoDeleteDays} days.`);
                setSavedBills(billsToKeep);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.autoDeleteDays]); // Only run on initial load

    // --- LOGGING ---
    const logAction = useCallback((action: string, details: string) => {
        if (!currentUser) return;
        const newEntry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            user: currentUser.username,
            action,
            details,
        };
        setAuditLog(prev => [newEntry, ...prev]);
    }, [currentUser]);

    // --- HANDLERS ---
    const handleLogin = (username: string, password: string): boolean => {
        const userInDb = users[username];
        if (userInDb && userInDb.password === password) {
            const user: User = { username, role: userInDb.role };
            setCurrentUser(user);

            // Log action immediately after setting user
            const newEntry: AuditLogEntry = {
                timestamp: new Date().toISOString(),
                user: user.username,
                action: 'LOGIN',
                details: `User logged in.`,
            };
            setAuditLog(prev => [newEntry, ...prev]);

            const initialView = user.role === 'admin' ? 'dashboard' : 'billing';
            setViewMode(initialView);
            setAdminView('main');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        logAction('LOGOUT', `User logged out.`);
        setCurrentUser(null);
        setAdminView('main');
    };

    const handleAddTest = useCallback((test: Test) => {
        setIsViewingArchived(false);
        setViewedBillDetails(null);
        setBillItems(prevItems => {
            if (prevItems.some(item => item.id === test.id)) {
                return prevItems;
            }
            return [...prevItems, { ...test, discount: 0 }];
        });
    }, []);

    const handleRemoveTest = useCallback((testId: string) => {
        setIsViewingArchived(false);
        setViewedBillDetails(null);
        setBillItems(prevItems => prevItems.filter(item => item.id !== testId));
    }, []);
    
    const handleItemDiscountChange = useCallback((testId: string, discountValue: number) => {
        setIsViewingArchived(false);
        setViewedBillDetails(null);
        setBillItems(prevItems =>
            prevItems.map(item =>
                item.id === testId ? { ...item, discount: discountValue } : item
            )
        );
    }, []);

    const handleClearBill = useCallback(() => {
        if (billItems.length > 0) {
            logAction('BILL_CLEARED', `Cleared unsaved bill #${billNumber}.`);
        }
        
        const newBillNumber = Math.max(
            parseInt(localStorage.getItem('lastBillNumber') || '0', 10),
            ...savedBills.map(b => b.billNumber)
        ) + 1;

        setBillItems([]);
        setPatientDetails({ name: '', age: '', sex: '', refdBy: '' });
        setTotalDiscount(0); // Reset total discount to 0%
        setPaymentDetails({ paymentMethod: '', amountPaid: 0 });
        setCommissionRate(0);
        setBillNumber(newBillNumber);
        setIsViewingArchived(false);
        setViewedBillDetails(null);
    }, [savedBills, billItems.length, billNumber, logAction]);

    const handleResetCurrentBill = useCallback(() => {
        if (window.confirm('Are you sure you want to reset the current bill? All unsaved data will be cleared.')) {
            if (billItems.length > 0) {
                logAction('BILL_RESET', `Reset current bill #${billNumber}.`);
            }
            setBillItems([]);
            setPatientDetails({ name: '', age: '', sex: '', refdBy: '' });
            setTotalDiscount(0); // Reset total discount to 0%
            setPaymentDetails({ paymentMethod: '', amountPaid: 0 });
            setCommissionRate(0);
            setIsViewingArchived(false);
            setViewedBillDetails(null);
            // DO NOT change billNumber here
        }
    }, [billItems.length, billNumber, logAction]);

    const handleSaveBill = useCallback(() => {
        if (!currentUser || billItems.length === 0) return;

        // Determine Bill Type
        let billType: 'Standard' | 'Department' = 'Standard';
        let department: string | undefined = undefined;

        const firstItem = billItems[0];
        const categoryOfFirstItem = testData.find(cat => cat.tests.some(t => t.id === firstItem.id));
        if (categoryOfFirstItem?.isMajor) {
            billType = 'Department';
            department = categoryOfFirstItem.category;
        }

        // Calculations
        const subtotal = billItems.reduce((acc, item) => acc + item.price, 0);
        const itemDiscounts = billItems.reduce((acc, item) => acc + item.discount, 0);

        const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
        const billDiscountAmount = subtotalAfterItemDiscounts * (totalDiscount / 100);
        
        const totalDiscountAmount = itemDiscounts + billDiscountAmount;
        const finalAmountBeforePayment = subtotal - totalDiscountAmount;
        
        // Tax removed as per request. Set to 0.
        const tax = 0; 
        const total = finalAmountBeforePayment + tax;
        const balanceDue = total - paymentDetails.amountPaid;

        let paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
        if (paymentDetails.amountPaid <= 0 && total > 0) {
            paymentStatus = 'Unpaid';
        } else if (balanceDue > 0.01) {
            paymentStatus = 'Partial';
        } else {
            paymentStatus = 'Paid';
        }

        const verificationStatus = total >= settings.verificationThreshold ? 'Pending' : 'Verified';

        const newSavedBill: SavedBill = {
            billNumber,
            date: new Date().toISOString(),
            patientDetails,
            billItems,
            totalDiscount, // Now a percentage
            paymentDetails,
            commissionRate,
            subtotal,
            tax, // Always 0 now
            totalAmount: total,
            balanceDue,
            paymentStatus,
            billedBy: currentUser.username,
            verificationStatus,
            status: 'active',
            billType,
            department,
        };
        
        logAction('BILL_SAVED', `Bill #${billNumber} saved for "${patientDetails.name}". Type: ${department || 'Standard'}. Total: ₹${total.toFixed(2)}, Paid: ₹${paymentDetails.amountPaid.toFixed(2)}.`);
        setSavedBills(prev => [...prev, newSavedBill]);
        localStorage.setItem('lastBillNumber', billNumber.toString());
        handleClearBill();
    }, [billItems, patientDetails, totalDiscount, paymentDetails, commissionRate, billNumber, handleClearBill, settings, logAction, currentUser, testData]);

    const handleVoidBill = useCallback((billNumberToVoid: number, reason: string) => {
        if (!currentUser) return;
        
        setSavedBills(prevBills => 
            prevBills.map(bill => 
                bill.billNumber === billNumberToVoid 
                ? { 
                    ...bill, 
                    status: 'voided',
                    voidedInfo: {
                        voidedBy: currentUser.username,
                        voidedAt: new Date().toISOString(),
                        reason,
                    }
                  }
                : bill
            )
        );
        logAction('BILL_VOIDED', `Bill #${billNumberToVoid} was voided. Reason: ${reason}`);
    }, [currentUser, logAction]);

    const handleVerifyBill = useCallback((billNumberToVerify: number, isApproved: boolean, reason?: string) => {
        if (!currentUser || currentUser.role !== 'admin') return;

        setSavedBills(prevBills =>
            prevBills.map(bill => {
                if (bill.billNumber === billNumberToVerify) {
                    if (isApproved) {
                        logAction('BILL_VERIFIED', `Bill #${billNumberToVerify} was approved.`);
                        return { ...bill, verificationStatus: 'Verified' };
                    } else {
                        logAction('BILL_REJECTED', `Bill #${billNumberToVerify} was rejected. Reason: ${reason}`);
                        return { ...bill, verificationStatus: 'Rejected', rejectionReason: reason };
                    }
                }
                return bill;
            })
        );
    }, [currentUser, logAction]);

    const handleViewArchivedBill = useCallback((bill: SavedBill) => {
        if (currentUser?.role !== 'admin') {
            alert("Admin permission required to view or modify this bill's details.");
            return;
        }

        setBillNumber(bill.billNumber);
        setPatientDetails(bill.patientDetails);
        setBillItems(bill.billItems);
        setTotalDiscount(bill.totalDiscount);
        setPaymentDetails(bill.paymentDetails);
        setCommissionRate(bill.commissionRate);
        setIsViewingArchived(true);
        setViewedBillDetails(bill);
        setViewMode('billing');
        setAdminView('main');
    }, [currentUser]);

    const handleSetViewMode = (mode: 'billing' | 'history' | 'dashboard') => {
        setViewMode(mode);
        if (mode !== 'dashboard') {
            setAdminView('main');
        }
    };

    if (isLoading) {
        return <SplashScreen labName={settings.labName} />;
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }
    
    const renderContent = () => {
        switch (viewMode) {
            case 'billing':
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
                        <div className="print:hidden">
                            <TestSelector 
                                testData={testData} 
                                onAddTest={handleAddTest}
                                onRemoveTest={handleRemoveTest}
                                currentBillItems={billItems} 
                            />
                        </div>
                        <div>
                            <Bill
                                items={billItems}
                                testData={testData}
                                patientDetails={patientDetails}
                                onPatientDetailsChange={(details) => {
                                    setIsViewingArchived(false);
                                    setViewedBillDetails(null);
                                    setPatientDetails(details);
                                }}
                                onRemoveItem={handleRemoveTest}
                                onClearBill={handleClearBill}
                                onSaveBill={handleSaveBill}
                                onResetBill={handleResetCurrentBill}
                                billNumber={billNumber}
                                totalDiscount={totalDiscount}
                                onTotalDiscountChange={(discount) => {
                                    setIsViewingArchived(false);
                                    setViewedBillDetails(null);
                                    setTotalDiscount(discount);
                                }}
                                onItemDiscountChange={handleItemDiscountChange}
                                paymentDetails={paymentDetails}
                                onPaymentDetailsChange={(details) => {
                                    setIsViewingArchived(false);
                                    setViewedBillDetails(null);
                                    setPaymentDetails(details);
                                }}
                                commissionRate={commissionRate}
                                onCommissionRateChange={(rate) => {
                                    setIsViewingArchived(false);
                                    setViewedBillDetails(null);
                                    setCommissionRate(rate);
                                }}
                                userRole={currentUser.role}
                                isViewingArchived={isViewingArchived}
                                viewedBillDetails={viewedBillDetails}
                                settings={settings}
                            />
                        </div>
                    </div>
                );
            case 'history':
                return <History savedBills={savedBills} onViewBill={handleViewArchivedBill} onVoidBill={handleVoidBill} onVerifyBill={handleVerifyBill} currentUser={currentUser} />;
            case 'dashboard':
                if (currentUser.role === 'admin') {
                    switch(adminView) {
                        case 'reports':
                            return <BillingReports savedBills={savedBills} testData={testData} onBack={() => setAdminView('main')} />;
                        case 'users':
                           return <ManageUsers users={users} setUsers={setUsers} onBack={() => setAdminView('main')} />;
                        case 'tests':
                            return <ManageTests testData={testData} setTestData={setTestData} onBack={() => setAdminView('main')} />;
                        case 'backup':
                            return <BackupRestore onBack={() => setAdminView('main')} />;
                        case 'settings':
                            return <Settings settings={settings} setSettings={setSettings} onBack={() => setAdminView('main')} />;
                        case 'activity':
                            return <ActivityLog auditLog={auditLog} onBack={() => setAdminView('main')} />;
                        case 'workflow':
                            return <Workflow onBack={() => setAdminView('main')} />;
                        case 'main':
                        default:
                            return <AdminDashboard onSelectView={setAdminView} savedBills={savedBills} />;
                    }
                }
                // Fallback for non-admins trying to access dashboard
                setViewMode('billing');
                return null;
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans print:bg-white">
            <Header 
                currentUser={currentUser} 
                onLogout={handleLogout}
                viewMode={viewMode}
                onSetViewMode={handleSetViewMode}
                settings={settings}
            />
            <main className="flex-grow p-4 sm:p-6 md:p-8 print:p-0">
                 {renderContent()}
            </main>
            <Footer labName={settings.labName} />
        </div>
    );
};

export default App;