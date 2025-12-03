
import React, { useState, useEffect, useCallback } from 'react';
import { Test, PatientDetails, BillItem, PaymentDetails, User, SavedBill, AppSettings, TestCategory, AuditLogEntry } from './types';
import { DEFAULT_TEST_DATA, DEFAULT_SETTINGS, DATA_VERSION } from './constants';
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
    
    // Flag to indicate if an archived bill is currently loaded for viewing/editing
    const [isEditingArchivedBill, setIsEditingArchivedBill] = useState<boolean>(false);
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
        const savedVersion = localStorage.getItem('dataVersion');
        if (savedVersion !== DATA_VERSION) {
            return DEFAULT_TEST_DATA;
        }
        const saved = localStorage.getItem('testData');
        return saved ? JSON.parse(saved) : DEFAULT_TEST_DATA;
    });
    
    const [settings, setSettings] = useState<AppSettings>(() => {
        const savedVersion = localStorage.getItem('dataVersion');
        if (savedVersion !== DATA_VERSION) {
            return DEFAULT_SETTINGS;
        }
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
        return saved ? JSON.parse(saved) : 0;
    });

    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(() => {
        const saved = localStorage.getItem('paymentDetails');
        return saved ? JSON.parse(saved) : { paymentMethod: '', amountPaid: 0 };
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
        localStorage.setItem('dataVersion', DATA_VERSION);
    }, []);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    useEffect(() => { localStorage.setItem('appUsers', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('testData', JSON.stringify(testData)); }, [testData]);
    useEffect(() => { localStorage.setItem('appSettings', JSON.stringify(settings)); }, [settings]);
    useEffect(() => { localStorage.setItem('savedBills', JSON.stringify(savedBills)); }, [savedBills]);
    useEffect(() => { localStorage.setItem('auditLog', JSON.stringify(auditLog)); }, [auditLog]);

    useEffect(() => { if(viewMode !== 'billing' || isEditingArchivedBill) return; localStorage.setItem('patientDetails', JSON.stringify(patientDetails)); }, [patientDetails, viewMode, isEditingArchivedBill]);
    useEffect(() => { if(viewMode !== 'billing' || isEditingArchivedBill) return; localStorage.setItem('billItems', JSON.stringify(billItems)); }, [billItems, viewMode, isEditingArchivedBill]);
    useEffect(() => { if(viewMode !== 'billing' || isEditingArchivedBill) return; localStorage.setItem('totalDiscount', JSON.stringify(totalDiscount)); }, [totalDiscount, viewMode, isEditingArchivedBill]);
    useEffect(() => { if(viewMode !== 'billing' || isEditingArchivedBill) return; localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails)); }, [paymentDetails, viewMode, isEditingArchivedBill]);
    useEffect(() => { if(viewMode !== 'billing' || isEditingArchivedBill) return; localStorage.setItem('currentBillNumber', JSON.stringify(billNumber)); }, [billNumber, viewMode, isEditingArchivedBill]);

    // Update bill items' active price and commission when global shift changes (Dynamic Pricing)
    useEffect(() => {
        if (!isEditingArchivedBill && billItems.length > 0) {
            setBillItems(prevItems => prevItems.map(item => {
                // Find current test data to get latest price
                let currentTestData: Test | undefined;
                for (const cat of testData) {
                    const found = cat.tests.find(t => t.id === item.id);
                    if (found) { currentTestData = found; break; }
                }

                if (currentTestData) {
                    const isNight = settings.currentShift === 'Night';
                    return {
                        ...item,
                        activePrice: isNight && currentTestData.priceNight ? currentTestData.priceNight : currentTestData.price,
                        activeCommission: isNight ? (currentTestData.commissionNight || 0) : (currentTestData.commissionDay || 0)
                    };
                }
                return item;
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.currentShift, testData]);


    useEffect(() => {
        if (settings.autoDeleteDays > 0) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - settings.autoDeleteDays);
            
            const billsToKeep = savedBills.filter(bill => new Date(bill.date) >= cutoffDate);

            if (billsToKeep.length < savedBills.length) {
                setSavedBills(billsToKeep);
            }
        }
    }, [settings.autoDeleteDays]); 

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
            logAction('LOGIN', `User logged in.`);
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
        if (isEditingArchivedBill && currentUser?.role !== 'admin') {
            alert("Cannot add new tests when viewing an archived bill.");
            return;
        }
        setBillItems(prevItems => {
            if (prevItems.some(item => item.id === test.id)) {
                return prevItems;
            }
            // Determine price and commission based on current shift
            const isNight = settings.currentShift === 'Night';
            const price = isNight && test.priceNight ? test.priceNight : test.price;
            const commission = isNight ? (test.commissionNight || 0) : (test.commissionDay || 0);

            return [...prevItems, { 
                ...test, 
                discount: 0, 
                activePrice: price, 
                activeCommission: commission 
            }];
        });
    }, [isEditingArchivedBill, currentUser, settings.currentShift]);

    const handleRemoveTest = useCallback((testId: string) => {
        if (isEditingArchivedBill && currentUser?.role !== 'admin') {
            alert("Cannot remove tests when viewing an archived bill.");
            return;
        }
        setBillItems(prevItems => prevItems.filter(item => item.id !== testId));
    }, [isEditingArchivedBill, currentUser]);
    
    const handleItemDiscountChange = useCallback((testId: string, discountValue: number) => {
        if (isEditingArchivedBill && currentUser?.role !== 'admin') {
            alert("Cannot change discounts when viewing an archived bill.");
            return;
        }
        setBillItems(prevItems =>
            prevItems.map(item =>
                item.id === testId ? { ...item, discount: discountValue } : item
            )
        );
    }, [isEditingArchivedBill, currentUser]);

    const handleClearBill = useCallback(() => {
        if (billItems.length > 0 && !isEditingArchivedBill) { 
            logAction('BILL_CLEARED', `Cleared unsaved bill #${billNumber}.`);
        }
        
        const lastExistingBillNumber = Math.max(
            parseInt(localStorage.getItem('lastBillNumber') || '0', 10),
            ...savedBills.map(b => b.billNumber)
        );
        const newBillNumber = lastExistingBillNumber + 1;

        setBillItems([]);
        setPatientDetails({ name: '', age: '', sex: '', refdBy: '' });
        setTotalDiscount(0);
        setPaymentDetails({ paymentMethod: '', amountPaid: 0 });
        setBillNumber(newBillNumber);
        setIsEditingArchivedBill(false); 
        setViewedBillDetails(null);
    }, [savedBills, billItems.length, billNumber, logAction, isEditingArchivedBill]);

    const handleResetCurrentBill = useCallback(() => {
        if (isEditingArchivedBill && currentUser?.role !== 'admin') {
            alert("Only admins can reset an archived bill.");
            return;
        }

        if (window.confirm('Are you sure you want to reset the current form? All unsaved data will be cleared.')) {
            if (billItems.length > 0) {
                logAction('BILL_RESET_FORM', `Reset current bill form #${billNumber}.`);
            }
            setBillItems([]);
            setPatientDetails({ name: '', age: '', sex: '', refdBy: '' });
            setTotalDiscount(0);
            setPaymentDetails({ paymentMethod: '', amountPaid: 0 });
            setIsEditingArchivedBill(false);
            setViewedBillDetails(null);
        }
    }, [billItems.length, billNumber, logAction, isEditingArchivedBill, currentUser]);


    const calculateBillTotals = useCallback((items: BillItem[], discountPercentage: number, referredBy: string) => {
        // Use activePrice for calculations (handles day/night)
        const subtotal = items.reduce((acc, item) => acc + item.activePrice, 0);
        const itemDiscounts = items.reduce((acc, item) => acc + item.discount, 0);

        const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
        const billDiscountAmount = subtotalAfterItemDiscounts * (discountPercentage / 100);
        
        const totalDiscountAmount = itemDiscounts + billDiscountAmount;
        const finalAmountBeforePayment = subtotal - totalDiscountAmount;
        
        const tax = 0; 
        const total = finalAmountBeforePayment + tax;

        let totalCommissionAmount = 0;
        if (referredBy.trim() !== '') {
            // Use activeCommission
            totalCommissionAmount = items.reduce((acc, item) => acc + item.activeCommission, 0);
        }

        return { subtotal, totalDiscountAmount, billDiscountAmount, total, totalCommissionAmount };
    }, []);


    const handleSaveBill = useCallback(() => {
        if (!currentUser || billItems.length === 0) return;
        if (isEditingArchivedBill) {
            return;
        }

        let billType: 'Standard' | 'Department' = 'Standard';
        let department: string | undefined = undefined;

        const firstItem = billItems[0];
        const categoryOfFirstItem = testData.find(cat => cat.tests.some(t => t.id === firstItem.id));
        if (categoryOfFirstItem?.isMajor) {
            billType = 'Department';
            department = categoryOfFirstItem.category;
        }

        const { subtotal, totalDiscountAmount, total, totalCommissionAmount } = calculateBillTotals(billItems, totalDiscount, patientDetails.refdBy);
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
            totalDiscount,
            paymentDetails,
            totalCommissionAmount,
            subtotal,
            tax: 0,
            totalAmount: total,
            balanceDue,
            paymentStatus,
            billedBy: currentUser.username,
            verificationStatus,
            status: 'active',
            billType,
            department,
            shift: settings.currentShift, // Save the shift used
        };
        
        logAction('BILL_SAVED', `Bill #${billNumber} saved. Shift: ${settings.currentShift}. Total: ₹${total.toFixed(2)}.`);
        setSavedBills(prev => [...prev, newSavedBill]);
        localStorage.setItem('lastBillNumber', billNumber.toString());
        
        setViewedBillDetails(newSavedBill);
        setIsEditingArchivedBill(true); 
    }, [billItems, patientDetails, totalDiscount, paymentDetails, billNumber, settings, logAction, currentUser, testData, calculateBillTotals, isEditingArchivedBill]);

    const handleUpdateBill = useCallback(() => {
        if (!currentUser || currentUser.role !== 'admin' || !isEditingArchivedBill || !viewedBillDetails) {
            alert("Unauthorized update attempt.");
            return;
        }

        let billType: 'Standard' | 'Department' = 'Standard';
        let department: string | undefined = undefined;

        const firstItem = billItems[0];
        const categoryOfFirstItem = testData.find(cat => cat.tests.some(t => t.id === firstItem.id));
        if (categoryOfFirstItem?.isMajor) {
            billType = 'Department';
            department = categoryOfFirstItem.category;
        }

        const { subtotal, totalDiscountAmount, total, totalCommissionAmount } = calculateBillTotals(billItems, totalDiscount, patientDetails.refdBy);
        const balanceDue = total - paymentDetails.amountPaid;

        let paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
        if (paymentDetails.amountPaid <= 0 && total > 0) {
            paymentStatus = 'Unpaid';
        } else if (balanceDue > 0.01) {
            paymentStatus = 'Partial';
        } else {
            paymentStatus = 'Paid';
        }

        let newVerificationStatus: 'Verified' | 'Pending' | 'Rejected' = viewedBillDetails.verificationStatus;
        if (newVerificationStatus !== 'Rejected') { 
            if (total >= settings.verificationThreshold) {
                newVerificationStatus = 'Pending';
            } else {
                newVerificationStatus = 'Verified';
            }
        }


        const updatedBill: SavedBill = {
            ...viewedBillDetails,
            patientDetails,
            billItems,
            totalDiscount,
            paymentDetails,
            totalCommissionAmount,
            subtotal,
            tax: 0,
            totalAmount: total,
            balanceDue,
            paymentStatus,
            verificationStatus: newVerificationStatus, 
            billType,
            department,
            lastModifiedAt: new Date().toISOString(),
            lastModifiedBy: currentUser.username,
        };

        setSavedBills(prev => prev.map(bill => 
            bill.billNumber === updatedBill.billNumber ? updatedBill : bill
        ));
        logAction('BILL_UPDATED', `Bill #${updatedBill.billNumber} updated.`);
        
        setIsEditingArchivedBill(false);
        setViewedBillDetails(null);
        handleClearBill(); 
        alert(`Bill #${updatedBill.billNumber} updated successfully!`);

    }, [currentUser, isEditingArchivedBill, viewedBillDetails, billItems, patientDetails, totalDiscount, paymentDetails, testData, settings.verificationThreshold, calculateBillTotals, logAction, handleClearBill]);


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
                    },
                    lastModifiedAt: new Date().toISOString(),
                    lastModifiedBy: currentUser.username,
                  }
                : bill
            )
        );
        logAction('BILL_VOIDED', `Bill #${billNumberToVoid} voided. Reason: ${reason}`);
    }, [currentUser, logAction]);
    
    const handleRequestCancellation = useCallback((billNumberToCancel: number, reason: string) => {
        if (!currentUser) return;
        setSavedBills(prevBills => 
            prevBills.map(bill => 
                bill.billNumber === billNumberToCancel 
                ? { 
                    ...bill, 
                    cancellationRequest: {
                        requestedBy: currentUser.username,
                        requestedAt: new Date().toISOString(),
                        reason,
                        status: 'pending'
                    }
                  }
                : bill
            )
        );
        logAction('CANCELLATION_REQUESTED', `Cancellation requested for Bill #${billNumberToCancel}.`);
    }, [currentUser, logAction]);

    const handleRequestModification = useCallback((billNumberToModify: number, reason: string) => {
        if (!currentUser) return;
        setSavedBills(prevBills => 
            prevBills.map(bill => 
                bill.billNumber === billNumberToModify 
                ? { 
                    ...bill, 
                    modificationRequest: {
                        requestedBy: currentUser.username,
                        requestedAt: new Date().toISOString(),
                        reason,
                        status: 'pending'
                    }
                  }
                : bill
            )
        );
        logAction('MODIFICATION_REQUESTED', `Modification requested for Bill #${billNumberToModify}.`);
    }, [currentUser, logAction]);

    const handleVerifyBill = useCallback((billNumberToVerify: number, isApproved: boolean, reason?: string) => {
        if (!currentUser || currentUser.role !== 'admin') return;

        setSavedBills(prevBills =>
            prevBills.map(bill => {
                if (bill.billNumber === billNumberToVerify) {
                    if (isApproved) {
                        logAction('BILL_VERIFIED', `Bill #${billNumberToVerify} approved.`);
                        return { ...bill, verificationStatus: 'Verified', lastModifiedAt: new Date().toISOString(), lastModifiedBy: currentUser.username };
                    } else {
                        logAction('BILL_REJECTED', `Bill #${billNumberToVerify} rejected.`);
                        return { ...bill, verificationStatus: 'Rejected', rejectionReason: reason, lastModifiedAt: new Date().toISOString(), lastModifiedBy: currentUser.username };
                    }
                }
                return bill;
            })
        );
    }, [currentUser, logAction]);

    const handleViewArchivedBill = useCallback((bill: SavedBill) => {
        setBillNumber(bill.billNumber);
        setPatientDetails(bill.patientDetails);
        setBillItems(bill.billItems.map(item => ({...item})));
        setTotalDiscount(bill.totalDiscount);
        setPaymentDetails(bill.paymentDetails);
        setIsEditingArchivedBill(true); 
        setViewedBillDetails(bill);
        setViewMode('billing');
        setAdminView('main');
        logAction('VIEW_ARCHIVED_BILL', `Viewed bill #${bill.billNumber}.`);
    }, [currentUser, logAction]);

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
                 {viewMode === 'billing' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
                        <div className="print:hidden">
                            <TestSelector 
                                testData={testData} 
                                onAddTest={handleAddTest}
                                onRemoveTest={handleRemoveTest}
                                currentBillItems={billItems} 
                                isDisabled={isEditingArchivedBill && currentUser.role !== 'admin'} 
                            />
                        </div>
                        <div>
                            <Bill
                                items={billItems}
                                testData={testData}
                                patientDetails={patientDetails}
                                onPatientDetailsChange={setPatientDetails}
                                onRemoveItem={handleRemoveTest}
                                onClearBill={handleClearBill}
                                onSaveBill={handleSaveBill}
                                onUpdateBill={handleUpdateBill}
                                onResetBill={handleResetCurrentBill}
                                billNumber={billNumber}
                                totalDiscount={totalDiscount}
                                onTotalDiscountChange={setTotalDiscount}
                                onItemDiscountChange={handleItemDiscountChange}
                                paymentDetails={paymentDetails}
                                onPaymentDetailsChange={setPaymentDetails}
                                userRole={currentUser.role}
                                isEditingArchivedBill={isEditingArchivedBill}
                                viewedBillDetails={viewedBillDetails}
                                settings={settings}
                                calculateBillTotals={calculateBillTotals}
                            />
                        </div>
                    </div>
                 )}
                 {viewMode === 'history' && (
                     <History savedBills={savedBills} onViewBill={handleViewArchivedBill} onVoidBill={handleVoidBill} onRequestCancellation={handleRequestCancellation} onRequestModification={handleRequestModification} onVerifyBill={handleVerifyBill} currentUser={currentUser} />
                 )}
                 {viewMode === 'dashboard' && currentUser.role === 'admin' && (
                     <>
                        {adminView === 'main' && <AdminDashboard onSelectView={setAdminView} savedBills={savedBills} settings={settings} setSettings={setSettings} />}
                        {adminView === 'reports' && <BillingReports savedBills={savedBills} testData={testData} onBack={() => setAdminView('main')} />}
                        {adminView === 'users' && <ManageUsers users={users} setUsers={setUsers} onBack={() => setAdminView('main')} />}
                        {adminView === 'tests' && <ManageTests testData={testData} setTestData={setTestData} onBack={() => setAdminView('main')} />}
                        {adminView === 'backup' && <BackupRestore onBack={() => setAdminView('main')} />}
                        {adminView === 'settings' && <Settings settings={settings} setSettings={setSettings} onBack={() => setAdminView('main')} />}
                        {adminView === 'activity' && <ActivityLog auditLog={auditLog} onBack={() => setAdminView('main')} />}
                        {adminView === 'workflow' && <Workflow onBack={() => setAdminView('main')} />}
                     </>
                 )}
            </main>
            <Footer labName={settings.labName} />
        </div>
    );
};

export default App;