
import React, { useState, useMemo } from 'react';
import { SavedBill, BillItem } from '../types';

interface BillingReportsProps {
    savedBills: SavedBill[];
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center gap-4">
            <div className="bg-teal-100 text-teal-600 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    </div>
);

const BillingReports: React.FC<BillingReportsProps> = ({ savedBills, onBack }) => {
    const [dateRange, setDateRange] = useState('all');

    const filteredBills = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRange === 'all') {
            return savedBills;
        }

        let startDate: Date;
        if (dateRange === 'today') {
            startDate = today;
        } else if (dateRange === '7days') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6);
        } else if (dateRange === '30days') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
        } else {
            return savedBills;
        }
        
        // Include bills from the start of the startDate
        startDate.setHours(0, 0, 0, 0);

        return savedBills.filter(bill => new Date(bill.date) >= startDate);
    }, [savedBills, dateRange]);

    const totalRevenue = useMemo(() => filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0), [filteredBills]);
    const totalBills = filteredBills.length;
    const averageBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

    const doctorReport = useMemo(() => {
        const report: { [key: string]: { referrals: number; revenue: number; commission: number } } = {};
        filteredBills.forEach(bill => {
            const doctor = bill.patientDetails.refdBy || 'Direct';
            if (!report[doctor]) {
                report[doctor] = { referrals: 0, revenue: 0, commission: 0 };
            }
            report[doctor].referrals++;
            
            const itemDiscounts = bill.billItems.reduce((acc, item) => acc + item.discount, 0);
            const subtotalAfterItemDiscounts = bill.subtotal - itemDiscounts;
            const commissionAmount = bill.patientDetails.refdBy.trim() !== '' ? subtotalAfterItemDiscounts * (bill.commissionRate / 100) : 0;
            
            report[doctor].revenue += bill.totalAmount;
            report[doctor].commission += commissionAmount;
        });
        return Object.entries(report).sort(([, a], [, b]) => b.revenue - a.revenue);
    }, [filteredBills]);

    const testReport = useMemo(() => {
        const report: { [key: string]: { count: number; revenue: number } } = {};
        filteredBills.forEach(bill => {
            bill.billItems.forEach((item: BillItem) => {
                if (!report[item.name]) {
                    report[item.name] = { count: 0, revenue: 0 };
                }
                report[item.name].count++;
                report[item.name].revenue += (item.price - item.discount);
            });
        });
        return Object.entries(report).sort(([, a], [, b]) => b.count - a.count);
    }, [filteredBills]);


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
                <div className="flex items-center gap-4">
                     <label htmlFor="dateRange" className="text-sm font-medium text-slate-700">Date Range:</label>
                     <select
                        id="dateRange"
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                     >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                     </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${totalRevenue.toFixed(2)}`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <StatCard 
                    title="Total Bills" 
                    value={totalBills} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                 <StatCard 
                    title="Average Bill Value" 
                    value={`₹${averageBillValue.toFixed(2)}`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
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
                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Revenue</th>
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
