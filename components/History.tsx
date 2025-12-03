
import React, { useState, useMemo } from 'react';
import { SavedBill, User } from '../types';

interface HistoryProps {
    savedBills: SavedBill[];
    onViewBill: (bill: SavedBill) => void;
    onVoidBill: (billNumber: number, reason: string) => void;
    onRequestCancellation: (billNumber: number, reason: string) => void;
    onRequestModification: (billNumber: number, reason: string) => void;
    onVerifyBill: (billNumber: number, isApproved: boolean, reason?: string) => void;
    currentUser: User;
}

const History: React.FC<HistoryProps> = ({ savedBills, onViewBill, onVoidBill, onRequestCancellation, onRequestModification, onVerifyBill, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showVoided, setShowVoided] = useState(false);

    const sortedBills = useMemo(() => {
        return [...savedBills].sort((a, b) => b.billNumber - a.billNumber);
    }, [savedBills]);

    const handleVoidClick = (bill: SavedBill) => {
        const reason = prompt(`Please provide a reason for voiding Bill #${String(bill.billNumber).padStart(6, '0')}:`);
        if (reason && reason.trim()) {
            onVoidBill(bill.billNumber, reason.trim());
        } else if (reason !== null) { // User didn't click cancel
            alert('A reason is required to void a bill.');
        }
    };
    
    const handleRequestCancelClick = (bill: SavedBill) => {
        const reason = prompt(`Please provide a reason for cancelling Bill #${String(bill.billNumber).padStart(6, '0')}:`);
        if (reason && reason.trim()) {
            onRequestCancellation(bill.billNumber, reason.trim());
        } else if (reason !== null) {
            alert('A reason is required to request cancellation.');
        }
    };

    const handleRequestModifyClick = (bill: SavedBill) => {
        const reason = prompt(`Please provide a reason for requesting modification on Bill #${String(bill.billNumber).padStart(6, '0')}:`);
        if (reason && reason.trim()) {
            onRequestModification(bill.billNumber, reason.trim());
        } else if (reason !== null) {
            alert('A reason is required to request modification.');
        }
    };

    const handleRejectClick = (bill: SavedBill) => {
        const reason = prompt(`Please provide a reason for rejecting Bill #${String(bill.billNumber).padStart(6, '0')}:`);
        if (reason && reason.trim()) {
            onVerifyBill(bill.billNumber, false, reason.trim());
        } else if (reason !== null) {
             alert('A reason is required to reject a bill.');
        }
    };

    const filteredBills = useMemo(() => {
        let bills = sortedBills;

        if (currentUser.role === 'admin' && !showVoided) {
             bills = bills.filter(bill => bill.status !== 'voided');
        } else if (currentUser.role !== 'admin') {
            bills = bills.filter(bill => bill.status !== 'voided');
        }

        if (!searchTerm) return bills;

        const lowercasedFilter = searchTerm.toLowerCase();
        return bills.filter(bill =>
            bill.patientDetails.name.toLowerCase().includes(lowercasedFilter) ||
            String(bill.billNumber).includes(lowercasedFilter) ||
            bill.billedBy.toLowerCase().includes(lowercasedFilter) ||
            (bill.department && bill.department.toLowerCase().includes(lowercasedFilter))
        );
    }, [sortedBills, searchTerm, showVoided, currentUser.role]);

    const getPaymentStatusBadge = (status: 'Paid' | 'Partial' | 'Unpaid') => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Partial': return 'bg-yellow-100 text-yellow-800';
            case 'Unpaid': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getVerificationStatusBadge = (status: 'Verified' | 'Pending' | 'Rejected') => {
        switch (status) {
            case 'Verified': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-orange-100 text-orange-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getBillTypeBadge = (bill: SavedBill) => {
        if (bill.billType === 'Department') {
            return 'bg-purple-100 text-purple-800';
        }
        return 'bg-gray-100 text-gray-800';
    }

    const handleViewBillClick = (bill: SavedBill) => {
        // Now allows all users to view
        onViewBill(bill);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                 <h2 className="text-2xl font-bold text-slate-800">Bill History</h2>
                 {currentUser.role === 'admin' && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="showVoided"
                            checked={showVoided}
                            onChange={e => setShowVoided(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="showVoided" className="ml-2 block text-sm text-gray-900">
                            Show Voided Bills
                        </label>
                    </div>
                )}
            </div>
            
            <input
                type="text"
                placeholder="Search by patient, bill number, user, or department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-lg p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Bill No.</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Patient Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Bill Type</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Billed By</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Doctor</th>
                            {currentUser.role === 'admin' && (
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Comm.</th>
                            )}
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Total</th>
                            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900">Payment</th>
                            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900">Verification</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredBills.length === 0 ? (
                            <tr>
                                <td colSpan={currentUser.role === 'admin' ? 11 : 10} className="text-center py-10 text-slate-500 italic">
                                    {savedBills.length === 0 ? 'No bills have been saved yet.' : 'No matching bills found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredBills.map((bill) => (
                                <tr key={bill.billNumber} className={bill.status === 'voided' ? 'bg-red-50 opacity-70' : bill.verificationStatus === 'Pending' ? 'bg-orange-50' : 'hover:bg-slate-50'}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{String(bill.billNumber).padStart(6, '0')}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{bill.patientDetails.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBillTypeBadge(bill)}`}>
                                            {bill.department || 'Standard'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{bill.billedBy}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{bill.patientDetails.refdBy || '-'}</td>
                                    {currentUser.role === 'admin' && (
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">
                                            {bill.totalCommissionAmount > 0 ? `₹${bill.totalCommissionAmount.toFixed(2)}` : '-'}
                                        </td>
                                    )}
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">₹{bill.totalAmount.toFixed(2)}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadge(bill.paymentStatus)}`}>
                                            {bill.paymentStatus}
                                        </span>
                                    </td>
                                     <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusBadge(bill.verificationStatus)}`} title={bill.rejectionReason}>
                                            {bill.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                                        {currentUser.role === 'admin' && bill.verificationStatus === 'Pending' ? (
                                            <>
                                                <button onClick={() => onVerifyBill(bill.billNumber, true)} className="text-green-600 hover:text-green-900">Approve</button>
                                                <button onClick={() => handleRejectClick(bill)} className="text-red-600 hover:text-red-900">Reject</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleViewBillClick(bill)} className="text-orange-600 hover:text-orange-900 disabled:text-slate-400 disabled:cursor-not-allowed" disabled={bill.status === 'voided'}>
                                                    View
                                                </button>
                                                
                                                {/* Admin Actions */}
                                                {currentUser.role === 'admin' && bill.status !== 'voided' && (
                                                    <button onClick={() => handleVoidClick(bill)} className="text-red-600 hover:text-red-900 ml-2">
                                                        Void
                                                    </button>
                                                )}
                                                
                                                {/* User Actions - Request Cancellation */}
                                                {currentUser.role !== 'admin' && bill.status !== 'voided' && !bill.cancellationRequest && (
                                                    <button onClick={() => handleRequestCancelClick(bill)} className="text-red-500 hover:text-red-700 ml-2">
                                                        Req. Cancel
                                                    </button>
                                                )}
                                                
                                                {/* Pending Cancel Status */}
                                                {bill.cancellationRequest?.status === 'pending' && (
                                                    <span className="text-xs text-orange-600 font-semibold ml-2 block sm:inline">Cancel Requested</span>
                                                )}

                                                {/* User Actions - Request Modification */}
                                                {currentUser.role !== 'admin' && bill.status !== 'voided' && !bill.modificationRequest && (
                                                    <button onClick={() => handleRequestModifyClick(bill)} className="text-blue-600 hover:text-blue-800 ml-2">
                                                        Req. Modify
                                                    </button>
                                                )}

                                                {/* Pending Modify Status */}
                                                {bill.modificationRequest?.status === 'pending' && (
                                                    <span className="text-xs text-blue-600 font-semibold ml-2 block sm:inline">Modify Requested</span>
                                                )}
                                            </>
                                        )}
                                        {bill.status === 'voided' && (
                                            <span className="font-bold text-red-500">VOIDED</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;