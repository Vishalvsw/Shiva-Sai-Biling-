
import React, { useState, useMemo } from 'react';
import { SavedBill, BillItem, TestCategory, TestNickname } from '../types';

interface BillingReportsProps {
    savedBills: SavedBill[];
    testData: TestCategory[];
    nicknames: TestNickname[];
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

const DoctorStatementModal: React.FC<{ 
    doctorName: string; 
    bills: SavedBill[]; 
    onClose: () => void; 
    dateRangeText: string;
}> = ({ doctorName, bills, onClose, dateRangeText }) => {
    
    const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCommission = bills.reduce((sum, b) => sum + b.totalCommissionAmount, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:rounded-none">
                
                {/* Modal Header - Hidden on Print */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Commission Statement</h3>
                        <p className="text-sm text-slate-500">Dr. {doctorName} | {dateRangeText}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => window.print()} 
                            className="px-4 py-2 bg-[#143A78] text-white rounded-lg hover:bg-blue-800 text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Statement
                        </button>
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
                    
                    {/* Print Header - Visible only on Print */}
                    <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
                        <h1 className="text-3xl font-bold uppercase tracking-wider">Commission Statement</h1>
                        <div className="mt-4 flex justify-between items-end">
                            <div className="text-left">
                                <p className="text-sm text-gray-500 uppercase">Referring Doctor</p>
                                <p className="text-xl font-bold">{doctorName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase">Statement Period</p>
                                <p className="text-lg font-semibold">{dateRangeText}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="min-w-full divide-y divide-slate-200 border border-slate-200 print:border-black">
                        <thead>
                            <tr className="bg-slate-50 print:bg-white print:border-b print:border-black">
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black">Bill No</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black">Patient Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black">Tests Included</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black">Bill Amt</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 print:divide-black">
                            {bills.map((bill) => (
                                <tr key={bill.billNumber} className="hover:bg-slate-50 print:hover:bg-white">
                                    <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{String(bill.billNumber).padStart(6, '0')}</td>
                                    <td className="px-4 py-2 text-sm text-slate-900 font-medium">{bill.patientDetails.name}</td>
                                    <td className="px-4 py-2 text-sm text-slate-500 max-w-[200px] truncate print:whitespace-normal print:max-w-none">
                                        {bill.billItems.map(item => item.name).join(', ')}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-slate-600 text-right">₹{bill.totalAmount.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm font-bold text-slate-800 text-right">₹{bill.totalCommissionAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 print:bg-white print:border-black">
                                <td colSpan={4} className="px-4 py-4 text-right text-slate-700 uppercase print:text-black">Total Summary</td>
                                <td className="px-4 py-4 text-right text-slate-800">₹{totalRevenue.toFixed(2)}</td>
                                <td className="px-4 py-4 text-right text-[#143A78] text-lg print:text-black">₹{totalCommission.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                     {/* Print Footer */}
                     <div className="hidden print:flex mt-16 justify-between text-sm pt-8 border-t border-slate-400">
                        <div>
                            <p className="font-bold">Generated By</p>
                            <p className="mt-8 border-t border-black w-32 pt-1">Signature</p>
                        </div>
                        <div>
                            <p className="font-bold">Received By</p>
                            <p className="mt-8 border-t border-black w-32 pt-1">Signature</p>
                        </div>
                        <div className="text-right">
                             <p>Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BillingReports: React.FC<BillingReportsProps> = ({ savedBills, testData, nicknames, onBack }) => {
    const [dateRange, setDateRange] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [shiftFilter, setShiftFilter] = useState('all');
    
    // New States for Doctor Report
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');

    const departmentOptions = useMemo(() => testData.filter(cat => cat.isMajor).map(cat => cat.category), [testData]);
    
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

        if (dateRange !== 'all') {
            let startDate: Date;
            if (dateRange === 'today') startDate = today;
            else if (dateRange === '7days') { startDate = new Date(today); startDate.setDate(today.getDate() - 6); }
            else { startDate = new Date(today); startDate.setDate(today.getDate() - 29); }
            startDate.setHours(0, 0, 0, 0);
            bills = bills.filter(bill => new Date(bill.date) >= startDate);
        }

        if (departmentFilter !== 'all') {
            if (departmentFilter === 'Standard') bills = bills.filter(bill => bill.billType === 'Standard');
            else bills = bills.filter(bill => bill.department === departmentFilter);
        }

        if (doctorFilter !== 'all') {
            bills = bills.filter(bill => bill.patientDetails.refdBy === doctorFilter);
        }

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
        const report: { 
            [key: string]: { 
                referrals: number; 
                revenue: number; 
                commission: number; 
                cases: number;
                nicknameCounts: Record<string, number>;
            } 
        } = {};

        activeBills.forEach(bill => {
            const doctor = bill.patientDetails.refdBy || 'Direct Walk-in';
            if (!report[doctor]) {
                report[doctor] = { referrals: 0, revenue: 0, commission: 0, cases: 0, nicknameCounts: {} };
            }
            
            report[doctor].referrals += 1; // 1 bill = 1 referral
            report[doctor].commission += bill.totalCommissionAmount;
            report[doctor].revenue += bill.totalAmount;
            report[doctor].cases += bill.billItems.length; // Total tests
            
            // Match bill items to nicknames
            bill.billItems.forEach(item => {
                // Find matching nickname
                // Prioritize nickname where test ID matches
                // If multiple nicknames have same test, we just pick the first one found in the nicknames array
                // The prompt implies one test maps to one "nickname logic" or "tier"
                const foundNickname = nicknames.find(n => n.testIds.includes(item.id));
                const label = foundNickname ? foundNickname.name : item.name; // Use nickname if found, else test name
                
                report[doctor].nicknameCounts[label] = (report[doctor].nicknameCounts[label] || 0) + 1;
            });
        });

        const array = Object.entries(report).map(([name, data]) => {
            // Format nickname string: "CT50 (2), CT75 (5)"
            const nicknameStr = Object.entries(data.nicknameCounts)
                .map(([nick, count]) => `${nick} (${count})`)
                .join(', ');

            return {
                name,
                ...data,
                nicknameDisplay: nicknameStr || '-'
            };
        }).sort((a, b) => b.commission - a.commission);
        
        // Filter by search term
        if (doctorSearchTerm.trim()) {
            return array.filter((item) => item.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()));
        }
        return array;
    }, [activeBills, doctorSearchTerm, nicknames]);

    const getBillsForDoctor = (doctorName: string) => {
        return activeBills.filter(bill => (bill.patientDetails.refdBy || 'Direct Walk-in') === doctorName).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

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

    const getDateRangeLabel = () => {
        if (dateRange === 'today') return 'Today';
        if (dateRange === '7days') return 'Last 7 Days';
        if (dateRange === '30days') return 'Last 30 Days';
        return 'All Time';
    };

    return (
        <div className="space-y-6 relative">
            {/* Detailed Doctor Statement Modal */}
            {selectedDoctor && (
                <DoctorStatementModal 
                    doctorName={selectedDoctor} 
                    bills={getBillsForDoctor(selectedDoctor)} 
                    onClose={() => setSelectedDoctor(null)}
                    dateRangeText={getDateRangeLabel()}
                />
            )}

            {/* Main Content (Hide when modal is open during print) */}
            <div className={`${selectedDoctor ? 'print:hidden' : ''} space-y-6`}>
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

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border border-slate-100">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Date Range</label>
                        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">All Departments</option>
                            <option value="Standard">Standard</option>
                            {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Referring Doctor (Global Filter)</label>
                        <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">All Doctors</option>
                            {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Shift Mode</label>
                        <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">All Shifts</option>
                            <option value="Day">Day Shift</option>
                            <option value="Night">Night Shift</option>
                        </select>
                     </div>
                </div>

                {/* KPI Cards */}
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

                {/* Doctor Commission Report Table */}
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-bold text-slate-800">Doctor Commission Report</h3>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search doctor..." 
                                value={doctorSearchTerm}
                                onChange={e => setDoctorSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="py-3 pl-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Name</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">No of Patients</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[30%]">Tests (Nicknames)</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">No of Cases</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-[#143A78] uppercase tracking-wider">Grand Total Commission</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {doctorReport.length > 0 ? (
                                    doctorReport.map((row) => (
                                        <tr key={row.name} className="hover:bg-blue-50 transition-colors group">
                                            <td className="py-4 pl-4 text-sm font-medium text-slate-900">{row.name}</td>
                                            <td className="px-3 py-4 text-sm text-slate-500 text-right">{row.referrals}</td>
                                            <td className="px-3 py-4 text-sm text-slate-600 break-words">{row.nicknameDisplay}</td>
                                            <td className="px-3 py-4 text-sm text-slate-500 text-right">{row.cases}</td>
                                            <td className="px-3 py-4 text-sm text-slate-600 text-right">₹{row.revenue.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-sm font-bold text-[#143A78] text-right">₹{row.commission.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedDoctor(row.name)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors opacity-80 group-hover:opacity-100"
                                                >
                                                    View Statement
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                            No data found for the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingReports;
