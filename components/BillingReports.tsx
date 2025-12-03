
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
    const [doctorFilter, setDoctorFilter] = useState('all'); // New Doctor Filter
    const [shiftFilter, setShiftFilter] = useState('all'); // New Shift Filter

    const departmentOptions = useMemo(() => testData.filter(cat => cat.isMajor).map(cat => cat.category), [testData]);
    
    // Extract unique doctors list from bills
    const doctorOptions = useMemo(() => {
        const doctors = new Set<string>();
        savedBills.forEach(b => {
            if(b.patientDetails.refdBy) doctors.add(b.patientDetails.refdBy);
        });
        return Array.from(doctors).sort();
    }, [savedBills]);

    const filteredBills = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let bills = savedBills;

        // Date Filter
        if (dateRange !== 'all') {
            let startDate: Date;
            if (dateRange === 'today') startDate = today;
            else if (dateRange === '7days') { startDate = new Date(today); startDate.setDate(today.getDate() - 6); }
            else { startDate = new Date(today); startDate.setDate(today.getDate() - 29); }
            startDate.setHours(0, 0, 0, 0);
            bills = bills.filter(bill => new Date(bill.date) >= startDate);
        }

        // Dept Filter
        if (departmentFilter !== 'all') {
            if (departmentFilter === 'Standard') bills = bills.filter(bill => bill.billType === 'Standard');
            else bills = bills.filter(bill => bill.department === departmentFilter);
        }

        // Doctor Filter
        if (doctorFilter !== 'all') {
            bills = bills.filter(bill => bill.patientDetails.refdBy === doctorFilter);
        }

        // Shift Filter
        if (shiftFilter !== 'all') {
            bills = bills.filter(bill => bill.shift === shiftFilter);
        }
        
        return bills;
    }, [savedBills, dateRange, departmentFilter, doctorFilter, shiftFilter]);

    const activeBills = useMemo(() => filteredBills.filter(b => b.status !== 'voided' && b.verificationStatus !== 'Rejected'), [filteredBills]);

    const stats = useMemo(() => {
        const totalRevenue = activeBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalCommission = activeBills.reduce((sum, bill) => sum + bill.totalCommissionAmount, 0);
        const outstandingBills = activeBills.filter(b => b.paymentStatus === 'Partial' || b.paymentStatus === 'Unpaid');
        const outstandingBalance = outstandingBills.reduce((sum, bill) => sum + bill.balanceDue, 0);

        return {
            totalRevenue,
            totalCommission,
            totalBills: activeBills.length,
            outstandingBalance,
        };
    }, [activeBills]);


    const doctorReport = useMemo(() => {
        const report: { [key: string]: { referrals: number; revenue: number; commission: number; tests: number } } = {};
        activeBills.forEach(bill => {
            const doctor = bill.patientDetails.refdBy || 'Direct Walk-in';
            if (!report[doctor]) report[doctor] = { referrals: 0, revenue: 0, commission: 0, tests: 0 };
            
            report[doctor].referrals++;
            report[doctor].commission += bill.totalCommissionAmount;
            report[doctor].revenue += bill.totalAmount;
            report[doctor].tests += bill.billItems.length;
        });
        return Object.entries(report).sort(([, a], [, b]) => b.commission - a.commission);
    }, [activeBills]);

    const handleExportCSV = () => {
        const headers = ["Bill No", "Date", "Shift", "Patient", "Doctor", "Department", "Tests", "Total Amount", "Commission"];
        const rows = activeBills.map(b => [
            b.billNumber,
            new Date(b.date).toLocaleDateString(),
            b.shift,
            b.patientDetails.name,
            b.patientDetails.refdBy || 'N/A',
            b.department || 'Standard',
            b.billItems.map(i => i.name).join('; '),
            b.totalAmount.toFixed(2),
            b.totalCommissionAmount.toFixed(2)
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `billing_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Billing Reports</h2>
                <div className="flex gap-2">
                    <button onClick={handleExportCSV} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                        Export CSV
                    </button>
                    <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">
                        Back
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Date Range</label>
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                    </select>
                 </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                    <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="all">All Departments</option>
                        <option value="Standard">Standard</option>
                        {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Referring Doctor</label>
                    <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="all">All Doctors</option>
                        {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Shift Mode</label>
                    <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="p-2 border rounded-lg text-sm">
                        <option value="all">All Shifts</option>
                        <option value="Day">Day Shift</option>
                        <option value="Night">Night Shift</option>
                    </select>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
                 <StatCard 
                    title="Total Commission" value={`₹${stats.totalCommission.toLocaleString()}`} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <StatCard 
                    title="Outstanding" value={`₹${stats.outstandingBalance.toLocaleString()}`} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
            </div>

            {/* Doctor Commission Report */}
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Doctor Commission Report</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="py-3 pl-4 text-left text-sm font-semibold text-slate-900">Doctor</th>
                                <th className="px-3 py-3 text-right text-sm font-semibold text-slate-900">Patients Referred</th>
                                <th className="px-3 py-3 text-right text-sm font-semibold text-slate-900">Total Tests</th>
                                <th className="px-3 py-3 text-right text-sm font-semibold text-slate-900">Total Billed</th>
                                <th className="px-3 py-3 text-right text-sm font-bold text-[#143A78]">Total Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {doctorReport.map(([name, data]) => (
                                <tr key={name} className="hover:bg-slate-50">
                                    <td className="py-4 pl-4 text-sm font-medium text-slate-900">{name}</td>
                                    <td className="px-3 py-4 text-sm text-slate-500 text-right">{data.referrals}</td>
                                    <td className="px-3 py-4 text-sm text-slate-500 text-right">{data.tests}</td>
                                    <td className="px-3 py-4 text-sm text-slate-600 text-right">₹{data.revenue.toLocaleString()}</td>
                                    <td className="px-3 py-4 text-sm font-bold text-[#143A78] text-right">₹{data.commission.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingReports;
