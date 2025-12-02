

import React, { useState, useMemo } from 'react';
import { SavedBill, BillItem, TestCategory } from '../types';

interface BillingReportsProps {
    savedBills: SavedBill[];
    testData: TestCategory[];
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; subValue?: string; icon: React.ReactNode }> = ({ title, value, subValue, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-[#143A78] p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                 {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
            </div>
        </div>
    </div>
);

const BillingReports: React.FC<BillingReportsProps> = ({ savedBills, testData, onBack }) => {
    const [dateRange, setDateRange] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const departmentOptions = useMemo(() => {
        return testData.filter(cat => cat.isMajor).map(cat => cat.category);
    }, [testData]);

    const filteredBills = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let bills = savedBills;

        // Date Range Filter
        if (dateRange !== 'all') {
            let startDate: Date;
            if (dateRange === 'today') {
                startDate = today;
            } else if (dateRange === '7days') {
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 6);
            } else { // 30days
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 29);
            }
            startDate.setHours(0, 0, 0, 0);
            bills = bills.filter(bill => new Date(bill.date) >= startDate);
        }

        // Department Filter
        if (departmentFilter !== 'all') {
            if (departmentFilter === 'Standard') {
                bills = bills.filter(bill => bill.billType === 'Standard');
            } else {
                bills = bills.filter(bill => bill.department === departmentFilter);
            }
        }
        
        return bills;
    }, [savedBills, dateRange, departmentFilter]);

    const activeBills = useMemo(() => filteredBills.filter(b => b.status !== 'voided' && b.verificationStatus !== 'Rejected'), [filteredBills]);
    const voidedBills = useMemo(() => filteredBills.filter(b => b.status === 'voided'), [filteredBills]);
    const rejectedBills = useMemo(() => filteredBills.filter(b => b.verificationStatus === 'Rejected' && b.status !== 'voided'), [filteredBills]);

    const stats = useMemo(() => {
        const totalRevenue = activeBills.reduce((sum, bill) => sum + bill.paymentDetails.amountPaid, 0);
        const outstandingBills = activeBills.filter(b => b.paymentStatus === 'Partial' || b.paymentStatus === 'Unpaid');
        const outstandingBalance = outstandingBills.reduce((sum, bill) => sum + bill.balanceDue, 0);
        const voidedBillsValue = voidedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const rejectedBillsValue = rejectedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

        return {
            totalRevenue,
            totalBills: activeBills.length,
            outstandingBalance,
            outstandingCount: outstandingBills.length,
            voidedBillsCount: voidedBills.length,
            voidedBillsValue,
            rejectedBillsValue,
            rejectedBillsCount: rejectedBills.length,
        };
    }, [activeBills, voidedBills, rejectedBills]);


    const doctorReport = useMemo(() => {
        const report: { [key: string]: { referrals: number; revenue: number; commission: number } } = {};
        activeBills.forEach(bill => {
            const doctor = bill.patientDetails.refdBy || 'Direct';
            if (!report[doctor]) {
                report[doctor] = { referrals: 0, revenue: 0, commission: 0 };
            }
            report[doctor].referrals++;
            
            // Use totalCommissionAmount from the saved bill directly
            report[doctor].commission += bill.totalCommissionAmount;
            report[doctor].revenue += bill.totalAmount; // This is the total amount, not just commission
        });
        return Object.entries(report).sort(([, a], [, b]) => b.revenue - a.revenue);
    }, [activeBills]);

    const testReport = useMemo(() => {
        const report: { [key: string]: { count: number; revenue: number } } = {};
        activeBills.forEach(bill => {
            bill.billItems.forEach((item: BillItem) => {
                if (!report[item.name]) {
                    report[item.name] = { count: 0, revenue: 0 };
                }
                report[item.name].count++;
                report[item.name].revenue += (item.price - item.discount);
            });
        });
        return Object.entries(report).sort(([, a], [, b]) => b.count - a.count);
    }, [activeBills]);

    const userCollectionReport = useMemo(() => {
        const report: { [user: string]: { billsCreated: number, totalBilled: number, totalCollected: number } } = {};
        activeBills.forEach(bill => {
            const user = bill.billedBy;
            if (!report[user]) {
                report[user] = { billsCreated: 0, totalBilled: 0, totalCollected: 0 };
            }
            report[user].billsCreated++;
            report[user].totalBilled += bill.totalAmount;
            report[user].totalCollected += bill.paymentDetails.amountPaid;
        });
        return Object.entries(report).sort(([, a], [, b]) => b.totalBilled - a.totalBilled);
    }, [activeBills]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Billing Reports</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <label htmlFor="dateRange" className="text-sm font-medium text-slate-700">Date Range:</label>
                        <select
                            id="dateRange"
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </select>
                     </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="departmentFilter" className="text-sm font-medium text-slate-700">Department:</label>
                        <select
                            id="departmentFilter"
                            value={departmentFilter}
                            onChange={e => setDepartmentFilter(e.target.value)}
                            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Departments</option>
                            <option value="Standard">Standard Bills</option>
                            {departmentOptions.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                     </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue (Paid)" 
                    value={`₹${stats.totalRevenue.toFixed(2)}`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <StatCard 
                    title="Verified Bills" 
                    value={stats.totalBills} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                 <StatCard 
                    title="Outstanding Balance" 
                    value={`₹${stats.outstandingBalance.toFixed(2)}`} 
                    subValue={`from ${stats.outstandingCount} bills`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
                 <StatCard 
                    title="Voided Bills" 
                    value={stats.voidedBillsCount} 
                    subValue={`Totaling ₹${stats.voidedBillsValue.toFixed(2)}`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                />
                 <StatCard 
                    title="Rejected Bills" 
                    value={stats.rejectedBillsCount} 
                    subValue={`Totaling ₹${stats.rejectedBillsValue.toFixed(2)}`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>
             {/* User Collection Report */}
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">User Collection Report</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">User</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Bills Created</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Total Billed Amount</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Total Payments Collected</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Difference</th>
                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {userCollectionReport.map(([user, data]) => {
                                const difference = data.totalCollected - data.totalBilled;
                                const isMismatch = Math.abs(difference) > 0.01;
                                return (
                                    <tr key={user} className={isMismatch ? 'bg-red-50' : ''}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{user}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">{data.billsCreated}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">₹{data.totalBilled.toFixed(2)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-600 text-right">₹{data.totalCollected.toFixed(2)}</td>
                                        <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold text-right ${isMismatch ? 'text-red-600' : 'text-slate-600'}`}>
                                            ₹{difference.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                            {isMismatch ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ Mismatch</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">OK</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Doctor Report */}
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Doctor Referral Report</h3>
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Doctor</th>
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Referrals</th>
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Commission</th>
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Total Billed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {doctorReport.map(([name, data]) => (
                                    <tr key={name}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">{data.referrals}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">₹{data.commission.toFixed(2)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-600 text-right">₹{data.revenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Test Report */}
                 <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Test Frequency Report</h3>
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Test Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Times Billed</th>
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                               {testReport.map(([name, data]) => (
                                    <tr key={name}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 text-right">{data.count}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-600 text-right">₹{data.revenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingReports;