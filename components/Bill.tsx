import React from 'react';
import { BillItem, PatientDetails, PaymentDetails, AppSettings } from '../types';
import Barcode from './Barcode';

interface BillProps {
    items: BillItem[];
    patientDetails: PatientDetails;
    billNumber: number;
    totalDiscount: number;
    paymentDetails: PaymentDetails;
    commissionRate: number;
    userRole: 'admin' | 'user';
    isViewingArchived: boolean;
    settings: AppSettings;
    onPatientDetailsChange: (details: PatientDetails) => void;
    onRemoveItem: (testId: string) => void;
    onClearBill: () => void;
    onSaveBill: () => void;
    onItemDiscountChange: (testId: string, discount: number) => void;
    onTotalDiscountChange: (discount: number) => void;
    onPaymentDetailsChange: (details: PaymentDetails) => void;
    onCommissionRateChange: (rate: number) => void;
}

const Bill: React.FC<BillProps> = ({ 
    items, 
    patientDetails, 
    billNumber, 
    totalDiscount,
    paymentDetails,
    commissionRate,
    userRole,
    isViewingArchived,
    settings,
    onPatientDetailsChange, 
    onRemoveItem, 
    onClearBill,
    onSaveBill,
    onItemDiscountChange,
    onTotalDiscountChange,
    onPaymentDetailsChange,
    onCommissionRateChange
}) => {

    const subtotal = items.reduce((acc, item) => acc + item.price, 0);
    const itemDiscounts = items.reduce((acc, item) => acc + item.discount, 0);

    const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
    
    // Commission is for internal tracking and doesn't affect patient's total
    const commissionAmount = patientDetails.refdBy.trim() !== '' ? subtotalAfterItemDiscounts * (commissionRate / 100) : 0;

    const cappedTotalDiscount = Math.max(0, Math.min(totalDiscount, subtotalAfterItemDiscounts));
    const totalDiscountAmount = itemDiscounts + cappedTotalDiscount;
    const taxableAmount = subtotal - totalDiscountAmount;
    const tax = taxableAmount * settings.taxRate;
    const total = taxableAmount + tax;
    const balanceDue = total - paymentDetails.amountPaid;

    const handlePrint = () => {
        window.print();
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onPatientDetailsChange({
            ...patientDetails,
            [e.target.name]: e.target.value
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

    const isSaveDisabled = items.length === 0 || patientDetails.name.trim() === '' || isViewingArchived;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg relative print:p-4 print:shadow-none print:border-none" id="bill-section">
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
                    {isViewingArchived ? `Viewing Bill #${String(billNumber).padStart(6, '0')}` : 'Patient Bill'}
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
                        <input type="text" name="name" id="name" value={patientDetails.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age</label>
                        <input type="text" name="age" id="age" value={patientDetails.age} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="sex" className="block text-sm font-medium text-slate-700">Sex</label>
                        <select name="sex" id="sex" value={patientDetails.sex} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                     <div className="sm:col-span-4 md:col-span-2">
                        <label htmlFor="refdBy" className="block text-sm font-medium text-slate-700">Referred by Dr.</label>
                        <select 
                            name="refdBy" 
                            id="refdBy" 
                            value={patientDetails.refdBy} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="">Select a Doctor</option>
                            {settings.referringDoctors.map(doctor => (
                                <option key={doctor} value={doctor}>{doctor}</option>
                            ))}
                        </select>
                    </div>
                    {userRole === 'admin' && (
                        <div className="sm:col-span-4 md:col-span-2">
                            <label htmlFor="commissionRate" className="block text-sm font-medium text-slate-700">Commission (%)</label>
                            <input 
                                type="number" 
                                name="commissionRate" 
                                id="commissionRate" 
                                value={commissionRate > 0 ? commissionRate : ''}
                                onChange={(e) => onCommissionRateChange(parseFloat(e.target.value) || 0)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="0"
                            />
                        </div>
                    )}
                </div>
                 {/* Print View: Patient Details Text */}
                <div className="hidden print:block border border-black p-3 my-4 text-sm">
                    <div className="grid grid-cols-2 gap-x-4">
                        <p><strong className="font-semibold text-slate-800">Patient Name:</strong> {patientDetails.name}</p>
                        <p><strong className="font-semibold text-slate-800">Age / Sex:</strong> {patientDetails.age} / {patientDetails.sex}</p>
                        <p><strong className="font-semibold text-slate-800">Referred by Dr.:</strong> {patientDetails.refdBy || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Bill Items */}
            <div className="flow-root print:mt-2">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50 print:bg-white print:border-y-2 print:border-black">
                        <tr>
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
                                <td colSpan={5} className="text-center py-10 text-slate-500 italic">No tests selected.</td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 print:py-1.5 print:pl-0">{item.name}</td>
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
                                            className="w-24 rounded-md border-slate-300 py-1 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                    <button onClick={() => onRemoveItem(item.id)} className="text-red-600 hover:text-red-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                    <label htmlFor="totalDiscount" className="text-sm font-medium text-slate-500">Bill Discount:</label>
                    <div className="flex flex-col items-end">
                         <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">₹</span>
                            <input
                                type="number"
                                id="totalDiscount"
                                value={totalDiscount > 0 ? totalDiscount : ''}
                                onChange={(e) => onTotalDiscountChange(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-28 rounded-md border-slate-300 py-1 pl-7 pr-2 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        {totalDiscount > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                                Net: ₹{(taxableAmount).toFixed(2)}
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
                    <span className="font-medium text-slate-500">Taxable Amount:</span>
                    <span className="text-slate-900 w-28">₹{taxableAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-end gap-4 print:text-sm">
                    <span className="font-medium text-slate-500">Tax ({settings.taxRate * 100}%):</span>
                    <span className="text-slate-900 w-28">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-4 border-t border-slate-200 pt-2 mt-2 print:border-t-2 print:border-black">
                    <span className="text-base font-bold text-slate-900">Grand Total:</span>
                    <span className="text-base font-bold text-slate-900 w-28">₹{total.toFixed(2)}</span>
                </div>
                
                {/* --- Reference Commission (Screen Only) --- */}
                {userRole === 'admin' && commissionAmount > 0 && (
                     <div className="flex justify-end gap-4 pt-2 border-t border-dashed print:hidden">
                        <span className="text-sm font-medium text-slate-500">Reference Commission:</span>
                        <span className="text-sm font-semibold text-orange-600 w-28">
                            ₹{commissionAmount.toFixed(2)}
                        </span>
                    </div>
                )}

                {/* --- Payment Details --- */}
                <div className="pt-4 mt-4 border-t border-dashed space-y-2">
                    {/* Screen Inputs */}
                    <div className="space-y-2 print:hidden">
                        <div className="flex justify-end items-center gap-4">
                            <label htmlFor="paymentMethod" className="text-sm font-medium text-slate-500">Payment Method:</label>
                            <select name="paymentMethod" id="paymentMethod" value={paymentDetails.paymentMethod} onChange={handlePaymentChange} className="w-28 rounded-md border-slate-300 py-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
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
                                    className="w-28 rounded-md border-slate-300 py-1 pl-7 pr-2 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
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
                <button onClick={handleNewBillClick} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">New Bill</button>
                <button 
                    onClick={onSaveBill}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:bg-slate-300" 
                    disabled={isSaveDisabled}
                    title={isSaveDisabled ? "Add items and patient name to save" : "Save bill to history"}
                >
                    Save Bill
                </button>
                <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] border border-transparent rounded-lg hover:bg-blue-800 disabled:bg-slate-300" disabled={items.length === 0}>Print Bill</button>
            </div>
            
             <div className="hidden print:block mt-16 text-center">
                <p className="border-t border-dashed border-slate-400 pt-2 text-xs text-slate-600">Developed by VISHAL WAGARAJ - vsw data solutions | www.vswdatasolutions</p>
                <p className="text-sm">--- Thank you ---</p>
            </div>
        </div>
    );
};

export default Bill;