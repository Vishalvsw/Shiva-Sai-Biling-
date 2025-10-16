import React, { useState, useMemo } from 'react';
import { SavedBill } from '../types';

interface HistoryProps {
    savedBills: SavedBill[];
    onViewBill: (bill: SavedBill) => void;
}

const History: React.FC<HistoryProps> = ({ savedBills, onViewBill }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const sortedBills = useMemo(() => {
        return [...savedBills].sort((a, b) => b.billNumber - a.billNumber);
    }, [savedBills]);

    const filteredBills = useMemo(() => {
        if (!searchTerm) return sortedBills;
        const lowercasedFilter = searchTerm.toLowerCase();
        return sortedBills.filter(bill =>
            bill.patientDetails.name.toLowerCase().includes(lowercasedFilter) ||
            String(bill.billNumber).includes(lowercasedFilter)
        );
    }, [sortedBills, searchTerm]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Bill History</h2>
            <input
                type="text"
                placeholder="Search by patient name or bill number..."
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
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Referred By</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Total Amount</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredBills.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 italic">
                                    {savedBills.length === 0 ? 'No bills have been saved yet.' : 'No matching bills found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredBills.map((bill) => (
                                <tr key={bill.billNumber} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{String(bill.billNumber).padStart(6, '0')}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{bill.patientDetails.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{bill.patientDetails.refdBy || 'N/A'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">₹{bill.totalAmount.toFixed(2)}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button onClick={() => onViewBill(bill)} className="text-orange-600 hover:text-orange-900">
                                            View
                                        </button>
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