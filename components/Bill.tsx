
import React, { useEffect, useMemo, useState } from 'react';
import { BillItem, PatientDetails, PaymentDetails, AppSettings, SavedBill, TestCategory } from '../types';
import Barcode from './Barcode';

// Define a type for the calculateBillTotals function to be passed as a prop
type CalculateBillTotalsFn = (items: BillItem[], discountPercentage: number, referredBy: string) => {
    subtotal: number;
    totalDiscountAmount: number;
    billDiscountAmount: number; 
    total: number;
    totalCommissionAmount: number;
};

interface BillProps {
    items: BillItem[];
    testData: TestCategory[];
    patientDetails: PatientDetails;
    billNumber: number;
    totalDiscount: number; // Now represents percentage
    paymentDetails: PaymentDetails;
    userRole: 'admin' | 'user';
    isEditingArchivedBill: boolean; 
    viewedBillDetails: SavedBill | null;
    settings: AppSettings;
    onPatientDetailsChange: (details: PatientDetails) => void;
    onRemoveItem: (testId: string) => void;
    onClearBill: () => void;
    onSaveBill: () => void;
    onUpdateBill: () => void; 
    onResetBill: () => void; 
    onItemDiscountChange: (testId: string, discount: number) => void;
    onTotalDiscountChange: (discount: number) => void; // Now handles percentage
    onPaymentDetailsChange: (details: PaymentDetails) => void;
    calculateBillTotals: CalculateBillTotalsFn; // Passed from App.tsx
}

const Bill: React.FC<BillProps> = ({ 
    items, 
    testData,
    patientDetails, 
    billNumber, 
    totalDiscount, // Percentage
    paymentDetails,
    userRole,
    isEditingArchivedBill,
    viewedBillDetails,
    settings,
    onPatientDetailsChange, 
    onRemoveItem, 
    onClearBill,
    onSaveBill,
    onUpdateBill, 
    onResetBill,
    onItemDiscountChange,
    onTotalDiscountChange,
    onPaymentDetailsChange,
    calculateBillTotals
}) => {
    // State to manage edit mode for archived bills (only for admins)
    const [isEditModeActive, setIsEditModeActive] = useState(false);
    
    // State to track which items are selected for printing/calculation
    const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(new Set());

    // Ensure all items are selected by default when they first appear
    useEffect(() => {
        setSelectedForPrint(prev => {
            const next = new Set(prev);
            let changed = false;
            items.forEach(item => {
                if (!next.has(item.id)) {
                    next.add(item.id);
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [items]);

    const togglePrintSelection = (id: string) => {
        const next = new Set(selectedForPrint);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedForPrint(next);
    };

    const toggleAllPrintSelection = () => {
        const allIds = items.map(i => i.id);
        const allSelected = allIds.every(id => selectedForPrint.has(id));
        
        if (allSelected) {
            setSelectedForPrint(new Set()); // Deselect all
        } else {
            setSelectedForPrint(new Set(allIds)); // Select all
        }
    };

    // Filter items for Calculation and Print Rendering
    // If an item is NOT selected for print, it is excluded from totals and print view.
    const activePrintItems = useMemo(() => {
        return items.filter(item => selectedForPrint.has(item.id));
    }, [items, selectedForPrint]);

    // Recalculate totals using the passed utility function based on ACTIVE items only
    const { subtotal, totalDiscountAmount, billDiscountAmount, total } = useMemo(() => { 
        return calculateBillTotals(activePrintItems, totalDiscount, patientDetails.refdBy);
    }, [activePrintItems, totalDiscount, patientDetails.refdBy, calculateBillTotals]);

    const balanceDue = total - paymentDetails.amountPaid;

    const showPaymentMismatchWarning = !isEditingArchivedBill && paymentDetails.amountPaid > total && total > 0;

    const billTitle = useMemo(() => {
        if (isEditingArchivedBill && viewedBillDetails) {
            return viewedBillDetails?.department ? `${viewedBillDetails.department} Bill` : 'Standard Lab Bill';
        }
        if (items.length > 0) {
            const firstItem = items[0];
            const category = testData.find(cat => cat.tests.some(t => t.id === firstItem.id));
            if (category?.isMajor) {
                return `${category.category} Bill`;
            }
        }
        return 'Standard Lab Bill';
    }, [items, isEditingArchivedBill, viewedBillDetails, testData]);

    // Automatically set amount paid to total if total is >= verificationThreshold for a new bill
    useEffect(() => {
        if (!isEditingArchivedBill && total >= settings.verificationThreshold) {
            // Only update if the value is not already correct to avoid unnecessary re-renders
            if (paymentDetails.amountPaid !== total) {
                onPaymentDetailsChange({
                    ...paymentDetails,
                    amountPaid: total,
                });
            }
        }
    }, [total, isEditingArchivedBill, paymentDetails, onPaymentDetailsChange, settings.verificationThreshold]);

    // Reset edit mode when a new archived bill is loaded or when bill is cleared
    useEffect(() => {
        if (!isEditingArchivedBill) {
            setIsEditModeActive(false);
        }
    }, [isEditingArchivedBill]);


    const handlePrint = () => {
        window.print();
    };

    const handlePrintReceipt = () => {
        const onAfterPrint = () => {
            document.body.classList.remove('receipt-print-mode');
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint);
        document.body.classList.add('receipt-print-mode');
        window.print();
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onPatientDetailsChange({
            ...patientDetails,
            [e.target.name]: e.target.value
        });
    };
    
    const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const docName = e.target.value;
        const selectedDoc = settings.referringDoctors.find(d => d.name === docName);
        
        onPatientDetailsChange({
            ...patientDetails,
            refdBy: docName,
            doctorPhone: selectedDoc?.phone || '' // Auto-fill phone if available
        });
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onPaymentDetailsChange({
            ...paymentDetails,
            [name]: name === 'amountPaid' ? parseFloat(value) || 0 : value
        });
    };

    const handleNewBillClick = () => {
        if (window.confirm('Are you sure you want to start a new bill? All unsaved changes will be lost.')) {
            onClearBill();
        }
    };
    
    // Determine if inputs should be disabled (viewing archived/saved bill and not in admin edit mode)
    // If a bill is saved (isEditingArchivedBill is true), it is read-only by default.
    const areInputsDisabled = isEditingArchivedBill && !isEditModeActive;
    
    const isSaveDisabled = items.length === 0 || patientDetails.name.trim() === '';
    const isAmountPaidDisabled = total >= settings.verificationThreshold && !isEditingArchivedBill;
    const isAllSelected = items.length > 0 && items.every(i => selectedForPrint.has(i.id));

    // Helper to format test name with shortcuts
    const getFormattedTestName = (item: BillItem) => {
        const category = testData.find(cat => cat.tests.some(t => t.id === item.id));
        const originalCatName = category ? category.category.toUpperCase() : '';
        
        // Define shortcuts for main categories
        const catShortcuts: {[key: string]: string} = {
            'ULTRASONOGRAPHY': 'USG',
            'CT SCAN': 'CT',
            'LABORATORY': 'LAB',
            'XRAY': 'X-RAY',
            'CARDIAC': 'CARD',
            'HEALTH PACKAGE': 'PKG',
            'CT SCAN-DAY': 'CT', 
        };

        const catName = catShortcuts[originalCatName] || originalCatName;
        const subName = item.subcategory ? item.subcategory.toUpperCase() : '';
        const testName = item.name.toUpperCase();
        
        let formatted = catName;
        if (subName) formatted += ` - ${subName}`;
        formatted += ` - ${testName}`;
        
        return formatted;
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg relative print:p-4 print:shadow-none print:border-none" id="bill-section">
                {isEditingArchivedBill && viewedBillDetails?.verificationStatus === 'Pending' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none print:flex z-10">
                    <div className="text-6xl sm:text-8xl font-black text-red-500 text-opacity-20 transform -rotate-45 border-4 border-red-500 border-opacity-20 p-4 rounded-lg">
                      PROVISIONAL BILL
                    </div>
                  </div>
                )}
                {/* Printable Header */}
                <div className="hidden print:block mb-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-800 print:text-2xl">{settings.labName}</h1>
                        <p className="text-sm text-slate-600 print:text-xs">{settings.labAddress}</p>
                        <p className="text-sm text-slate-600 print:text-xs">{settings.labContact}</p>
                    </div>
                     <div className="mt-4 flex justify-between items-center border-y-2 border-slate-800 py-2 print:border-black">
                        <div className="w-1/3"></div> {/* Left spacer */}
                        <h2 className="text-2xl font-bold text-slate-800 text-center w-1/3 print:text-xl">INVOICE</h2>
                        <div className="w-1/3 flex justify-end">
                            <div className="w-40">
                                 <Barcode value={String(billNumber).padStart(6, '0')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Details Section */}
                <div className="mb-6 border-b pb-6 print:border-none print:pb-0 print:mb-2">
                     <h2 className="text-2xl font-bold text-slate-800 sm:col-span-2 print:hidden mb-4">
                        {isEditingArchivedBill ? `Viewing Bill #${String(billNumber).padStart(6, '0')}` : billTitle}
                        {isEditingArchivedBill && userRole === 'admin' && (
                            <button 
                                onClick={() => setIsEditModeActive(!isEditModeActive)} 
                                className={`ml-4 px-3 py-1 text-sm font-medium rounded-lg ${isEditModeActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                                aria-label={isEditModeActive ? "Exit edit mode" : "Enable edit mode for this bill"}
                            >
                                {isEditModeActive ? 'Exit Edit Mode' : 'Edit Bill'}
                            </button>
                        )}
                    </h2>
                     <div className="grid grid-cols-2 gap-4 mb-4 print:mb-2 print:text-sm">
                        <div>
                            <p><span className="font-semibold text-slate-700">Bill No:</span> {String(billNumber).padStart(6, '0')}</p>
                        </div>
                        <div className="text-right sm:text-left">
                            <p><span className="font-semibold text-slate-700">Date:</span> {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                     {/* Screen View: Patient Details Form */}
                     <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
                        <div className="sm:col-span-4 md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Patient Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={patientDetails.name} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" 
                                disabled={areInputsDisabled}
                                aria-label="Patient Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age</label>
                            <input 
                                type="text" 
                                name="age" 
                                id="age" 
                                value={patientDetails.age} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" 
                                disabled={areInputsDisabled}
                                aria-label="Patient Age"
                            />
                        </div>
                        <div>
                            <label htmlFor="sex" className="block text-sm font-medium text-slate-700">Sex</label>
                            <select 
                                name="sex" 
                                id="sex" 
                                value={patientDetails.sex} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                disabled={areInputsDisabled}
                                aria-label="Patient Sex"
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="sm:col-span-4 md:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Patient Phone</label>
                            <input 
                                type="text" 
                                name="phone" 
                                id="phone" 
                                value={patientDetails.phone || ''} 
                                onChange={handleInputChange} 
                                placeholder="Optional"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" 
                                disabled={areInputsDisabled}
                            />
                        </div>
                         <div className="sm:col-span-4 md:col-span-2">
                            <label htmlFor="refdBy" className="block text-sm font-medium text-slate-700">Referred by Dr.</label>
                            <select 
                                name="refdBy" 
                                id="refdBy" 
                                value={patientDetails.refdBy} 
                                onChange={handleDoctorChange} 
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                disabled={areInputsDisabled}
                                aria-label="Referred by Doctor"
                            >
                                <option value="">Select a Doctor</option>
                                {settings.referringDoctors.map(doctor => (
                                    <option key={doctor.name} value={doctor.name}>{doctor.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Doctor Phone (Auto-filled but editable) */}
                        <div className="sm:col-span-4 md:col-span-2">
                            <label htmlFor="doctorPhone" className="block text-sm font-medium text-slate-700">Doctor Phone</label>
                            <input 
                                type="text" 
                                name="doctorPhone" 
                                id="doctorPhone" 
                                value={patientDetails.doctorPhone || ''} 
                                onChange={handleInputChange} 
                                placeholder="Auto-filled from settings"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" 
                                disabled={areInputsDisabled}
                            />
                        </div>
                    </div>
                     {/* Print View: Patient Details Text */}
                    <div className="hidden print:block border border-black p-3 my-4 text-sm">
                        <div className="grid grid-cols-2 gap-x-4">
                            <p><strong className="font-semibold text-slate-800">Bill No:</strong> {String(billNumber).padStart(6, '0')}</p>
                            <p><strong className="font-semibold text-slate-800">Date:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong className="font-semibold text-slate-800">Patient Name:</strong> {patientDetails.name}</p>
                            <p><strong className="font-semibold text-slate-800">Age / Sex:</strong> {patientDetails.age} / {patientDetails.sex}</p>
                            {patientDetails.phone && <p><strong className="font-semibold text-slate-800">Patient Ph:</strong> {patientDetails.phone}</p>}
                            <p><strong className="font-semibold text-slate-800">Referred by Dr.:</strong> {patientDetails.refdBy || 'N/A'}</p>
                            {patientDetails.doctorPhone && <p><strong className="font-semibold text-slate-800">Dr. Ph:</strong> {patientDetails.doctorPhone}</p>}
                        </div>
                    </div>
                </div>

                {/* Bill Items */}
                <div className="flow-root print:mt-2">
                    <table className="min-w-full divide-y divide-slate-300" aria-label="Bill Items">
                        <thead className="bg-slate-50 print:bg-white print:border-y-2 print:border-black">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 print:hidden w-10">
                                    <input 
                                        type="checkbox" 
                                        checked={isAllSelected}
                                        onChange={toggleAllPrintSelection}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        title="Select/Deselect All for Print"
                                    />
                                </th>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 print:py-2 print:pl-0">Test Name</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 print:py-2">Price</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 print:hidden">Discount (₹)</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 print:py-2 print:pr-0">Total</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 print:hidden">
                                    <span className="sr-only">Remove</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500 italic">No tests selected.</td>
                                </tr>
                            )}
                            {items.map((item) => {
                                const isSelected = selectedForPrint.has(item.id);
                                return (
                                    <tr key={item.id} className={`${isSelected ? '' : 'print:hidden opacity-50 bg-slate-50'}`}>
                                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6 print:hidden">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => togglePrintSelection(item.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 print:py-1.5 print:pl-0">
                                            {/* Use formatted test name */}
                                            {getFormattedTestName(item)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right print:py-1.5">₹{item.price.toFixed(2)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right print:hidden">
                                            <div className="flex flex-col items-end">
                                                <input
                                                    type="number"
                                                    aria-label={`Discount for ${item.name}`}
                                                    value={item.discount > 0 ? item.discount : ''}
                                                    onChange={(e) => {
                                                        const discount = parseFloat(e.target.value) || 0;
                                                        onItemDiscountChange(item.id, Math.max(0, Math.min(item.price, discount)));
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-24 rounded-md border-slate-300 py-1 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                    disabled={areInputsDisabled}
                                                />
                                                {item.discount > 0 && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Net: ₹{(item.price - item.discount).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                         <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right print:py-1.5 print:pr-0">₹{(item.price - item.discount).toFixed(2)}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 print:hidden">
                                            <button 
                                                onClick={() => onRemoveItem(item.id)} 
                                                className="text-red-600 hover:text-red-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                disabled={areInputsDisabled}
                                                aria-label={`Remove ${item.name} from bill`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="mt-6 border-t border-slate-200 pt-6 space-y-2 text-right print:mt-4 print:pt-4">
                    <div className="flex justify-end gap-4 print:text-sm">
                        <span className="font-medium text-slate-500">Subtotal:</span>
                        <span className="text-slate-900 w-28">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-end items-center gap-4 print:hidden">
                        <label htmlFor="totalDiscount" className="text-sm font-medium text-slate-500">Bill Discount (%):</label> 
                        <div className="flex flex-col items-end">
                             <div className="relative">
                                <input
                                    type="number"
                                    id="totalDiscount"
                                    value={totalDiscount > 0 ? totalDiscount : ''}
                                    onChange={(e) => onTotalDiscountChange(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    className="w-28 rounded-md border-slate-300 py-1 pr-7 pl-2 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    disabled={areInputsDisabled}
                                    aria-label="Bill Discount Percentage"
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span> 
                            </div>
                            {totalDiscount > 0 && (
                                <p className="text-xs text-slate-500 mt-1" aria-hidden="true">
                                    Amount: ₹{billDiscountAmount.toFixed(2)} 
                                </p>
                            )}
                        </div>
                    </div>

                    {totalDiscountAmount > 0 && (
                        <div className="flex justify-end gap-4 print:text-sm">
                            <span className="font-medium text-slate-500">Total Discount:</span>
                            <span className="text-red-600 w-28">- ₹{totalDiscountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-4 print:text-sm">
                        <span className="font-medium text-slate-500">Net Amount:</span> 
                        <span className="text-slate-900 w-28">₹{total.toFixed(2)}</span>
                    </div>

                    {/* Tax section removed */}
                    
                    <div className="flex justify-end gap-4 border-t border-slate-200 pt-2 mt-2 print:border-t-2 print:border-black">
                        <span className="text-base font-bold text-slate-900">Grand Total:</span>
                        <span className="text-base font-bold text-slate-900 w-28">₹{total.toFixed(2)}</span>
                    </div>

                    {/* --- Payment Details --- */}
                    <div className="pt-4 mt-4 border-t border-dashed space-y-2">
                        {/* Screen Inputs */}
                        <div className="space-y-2 print:hidden">
                            <div className="flex justify-end items-center gap-4">
                                <label htmlFor="paymentMethod" className="text-sm font-medium text-slate-500">Payment Method:</label>
                                <select 
                                    name="paymentMethod" 
                                    id="paymentMethod" 
                                    value={paymentDetails.paymentMethod} 
                                    onChange={handlePaymentChange} 
                                    className="w-28 rounded-md border-slate-300 py-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    disabled={areInputsDisabled}
                                    aria-label="Payment Method"
                                >
                                    <option value="">Select</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="flex justify-end items-center gap-4">
                                <label htmlFor="amountPaid" className="text-sm font-medium text-slate-500">Amount Paid:</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        id="amountPaid"
                                        name="amountPaid"
                                        value={paymentDetails.amountPaid > 0 ? paymentDetails.amountPaid : ''}
                                        onChange={handlePaymentChange}
                                        placeholder="0.00"
                                        className="w-28 rounded-md border-slate-300 py-1 pl-7 pr-2 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        disabled={isAmountPaidDisabled || areInputsDisabled}
                                        title={isAmountPaidDisabled ? `Full payment is required for bills of ₹${settings.verificationThreshold} or more.` : "Enter amount paid by patient"}
                                        aria-label="Amount Paid"
                                    />
                                </div>
                            </div>
                             {showPaymentMismatchWarning && (
                                <p className="text-red-600 text-sm text-right">⚠️ Warning: Amount paid is higher than total.</p>
                            )}
                        </div>
                        
                        {/* Print Display */}
                        <div className="hidden print:block space-y-1 print:text-sm">
                            <div className="flex justify-end gap-4">
                                <span className="font-medium text-slate-500">Payment Method:</span>
                                <span className="text-slate-900 w-28">{paymentDetails.paymentMethod || 'N/A'}</span>
                            </div>
                            <div className="flex justify-end gap-4">
                                <span className="font-medium text-slate-500">Amount Paid:</span>
                                <span className="text-slate-900 w-28">₹{paymentDetails.amountPaid.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Shared Balance Due */}
                         <div className="flex justify-end gap-4 border-t border-slate-200 pt-2 mt-2 print:border-t print:border-dashed print:border-slate-500">
                            <span className="text-base font-bold text-slate-900">Balance Due:</span>
                            <span className={`text-base font-bold w-28 ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{balanceDue.toFixed(2)}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3 print:hidden">
                    {/* If editing an archived bill (which happens after save or when viewing history) */}
                    {isEditingArchivedBill ? (
                        <>
                             {/* Only show these if viewing, not if creating new (which is checked via isEditingArchivedBill) */}
                            <button 
                                onClick={handleNewBillClick} 
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                                aria-label="Start a new bill"
                            >
                                New Bill
                            </button>
                            
                            {userRole === 'admin' && (
                                <button 
                                    onClick={onUpdateBill}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:bg-slate-300" 
                                    disabled={isSaveDisabled || !isEditModeActive}
                                    title={isEditModeActive ? "Update archived bill" : "Enable edit mode to update"}
                                    aria-label="Update current archived bill"
                                >
                                    Update Bill
                                </button>
                            )}
                             <button 
                                onClick={handlePrint} 
                                className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] border border-transparent rounded-lg hover:bg-blue-800" 
                                aria-label="Print full bill"
                            >
                                Print Bill
                            </button>
                            <button 
                                onClick={handlePrintReceipt} 
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-lg hover:bg-gray-700" 
                                aria-label="Print receipt"
                            >
                                Print Receipt
                            </button>
                        </>
                    ) : (
                        // If creating a NEW bill
                        <>
                            <button 
                                onClick={handleNewBillClick} 
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                                aria-label="Start a new bill"
                            >
                                New Bill
                            </button>
                            <button 
                                onClick={onResetBill} 
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                                aria-label="Reset current bill form"
                            >
                                Reset
                            </button> 
                            <button 
                                onClick={onSaveBill}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:bg-slate-300" 
                                disabled={isSaveDisabled}
                                title={isSaveDisabled ? "Add items and patient name to save" : "Save bill to history"}
                                aria-label="Save current bill to history"
                            >
                                Save Bill
                            </button>
                        </>
                    )}
                </div>
                
                 <div className="hidden print:block mt-16 text-center">
                    <p className="border-t border-dashed border-slate-400 pt-2 text-xs text-slate-600">Developed by VISHAL WAGARAJ - vsw data solutions | vswdatasolutions.in</p>
                    <p className="text-sm">--- Thank you ---</p>
                </div>
            </div>

            {/* --- POS Receipt Structure (Hidden on screen, styled for print via CSS in index.html) --- */}
            <div id="bill-receipt">
                <header className="text-center space-y-0.5">
                    <h1 className="text-base font-bold">{settings.labName}</h1>
                    <p className="text-[8pt] leading-tight">{settings.labAddress}</p>
                    <p className="text-[8pt] leading-tight">{settings.labContact}</p>
                </header>

                <div className="text-xs my-2 py-1 border-t border-b border-dashed border-black grid grid-cols-2">
                    <p>Bill No: {String(billNumber).padStart(6, '0')}</p>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                    <p className="col-span-2">Patient: {patientDetails.name}</p>
                    <p>Age/Sex: {patientDetails.age}/{patientDetails.sex}</p>
                    {patientDetails.phone && <p className="col-span-2">Ph: {patientDetails.phone}</p>}
                    <p>Refd By: {patientDetails.refdBy || 'N/A'}</p>
                </div>

                <div className="text-xs my-2">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="text-left font-bold pb-1">Test</th>
                                <th className="text-right font-bold pb-1">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activePrintItems.map(item => (
                                <tr key={item.id}>
                                    <td className="py-0.5">{getFormattedTestName(item)}</td>
                                    <td className="text-right py-0.5">{(item.price - item.discount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-xs py-1 border-t-2 border-black space-y-0.5">
                    <table className="w-full">
                        <tbody>
                            <tr><td>Subtotal:</td><td className="text-right">₹{subtotal.toFixed(2)}</td></tr>
                            {totalDiscountAmount > 0 && <tr><td>Discount:</td><td className="text-right">- ₹{totalDiscountAmount.toFixed(2)}</td></tr>}
                            {/* Tax row removed from receipt */}
                            <tr className="font-bold border-t border-dashed border-black"><td className="pt-1">Grand Total:</td><td className="pt-1 text-right">₹{total.toFixed(2)}</td></tr>
                            <tr><td>Amount Paid:</td><td className="text-right">₹{paymentDetails.amountPaid.toFixed(2)}</td></tr>
                            <tr className="font-bold"><td className="pb-1">Balance Due:</td><td className="pb-1 text-right">₹{balanceDue.toFixed(2)}</td></tr>
                            <tr className="border-t border-dashed border-black"><td className="pt-1">Total Items:</td><td className="pt-1 text-right">{activePrintItems.length}</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="barcode mt-2">
                    <Barcode value={String(billNumber).padStart(6, '0')} />
                </div>
                <footer className="text-center text-[8pt] mt-4 space-y-1">
                    <p>--- Thank you ---</p>
                    <p>Developed by VISHAL WAGARAJ</p>
                </footer>
            </div>
        </>
    );
};

export default Bill;
