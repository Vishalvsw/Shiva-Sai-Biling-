
import React, { useMemo } from 'react';
import { SavedBill, AppSettings } from '../types';

type AdminView = 'reports' | 'users' | 'tests' | 'backup' | 'settings' | 'activity' | 'workflow';

interface AdminDashboardProps {
    onSelectView: (view: AdminView) => void;
    savedBills: SavedBill[];
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const StatSummaryCard: React.FC<{ title: string; value: string | number; color: string; icon?: React.ReactNode }> = ({ title, value, color, icon }) => {
    const colors = {
        red: 'bg-red-50 border-red-200 text-red-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        slate: 'bg-slate-50 border-slate-200 text-slate-700',
    };
    const textColors = {
        red: 'text-red-900',
        yellow: 'text-yellow-900',
        green: 'text-green-900',
        blue: 'text-blue-900',
        indigo: 'text-indigo-900',
        slate: 'text-slate-900',
    }
    return (
        <div className={`p-5 rounded-lg border ${colors[color] || colors.slate} shadow-sm`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className={`text-2xl font-bold mt-1 ${textColors[color] || textColors.slate}`}>{value}</p>
                </div>
                {icon && <div className={`p-2 rounded-full bg-white bg-opacity-40`}>{icon}</div>}
            </div>
        </div>
    );
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all border border-slate-100 w-full h-full group text-left">
        <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
    </button>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectView, savedBills, settings, setSettings }) => {
    
    // Toggle global shift setting directly from dashboard
    const toggleShift = () => {
        setSettings(prev => ({ ...prev, currentShift: prev.currentShift === 'Day' ? 'Night' : 'Day' }));
    };

    const stats = useMemo(() => {
        const activeBills = savedBills.filter(b => b.status !== 'voided');
        
        const totalRevenue = activeBills.reduce((sum, b) => sum + b.totalAmount, 0);
        const dayRevenue = activeBills.filter(b => b.shift === 'Day').reduce((sum, b) => sum + b.totalAmount, 0);
        const nightRevenue = activeBills.filter(b => b.shift === 'Night').reduce((sum, b) => sum + b.totalAmount, 0);
        
        const totalCommission = activeBills.reduce((sum, b) => sum + b.totalCommissionAmount, 0);
        const totalReferrals = activeBills.filter(b => b.patientDetails.refdBy).length;
        
        const billsGenerated = activeBills.length;

        // Test Breakdown
        let plainTests = 0, contrastTests = 0, otherTests = 0;
        activeBills.forEach(bill => {
            bill.billItems.forEach(item => {
                if (item.name.toLowerCase().includes('plain')) plainTests++;
                else if (item.name.toLowerCase().includes('contrast')) contrastTests++;
                else otherTests++;
            });
        });

        // Top Doctor
        const doctorCounts: {[key:string]: number} = {};
        activeBills.forEach(b => {
            if(b.patientDetails.refdBy) {
                doctorCounts[b.patientDetails.refdBy] = (doctorCounts[b.patientDetails.refdBy] || 0) + 1;
            }
        });
        const topDoctor = Object.entries(doctorCounts).sort((a,b) => b[1] - a[1])[0];

        return {
            totalRevenue, dayRevenue, nightRevenue,
            totalCommission, totalReferrals, billsGenerated,
            plainTests, contrastTests, otherTests,
            topDoctorName: topDoctor ? topDoctor[0] : 'None',
            topDoctorCount: topDoctor ? topDoctor[1] : 0
        };
    }, [savedBills]);

    const features = [
        { title: 'Billing Reports', description: 'Sales, commissions & doctor reports.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, view: 'reports' as AdminView },
        { title: 'Manage Users', description: 'Create & edit admin/staff accounts.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, view: 'users' as AdminView },
        { title: 'Test & Prices', description: 'Set Day/Night prices & categories.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, view: 'tests' as AdminView },
        { title: 'Backup / Restore', description: 'Secure your data externally.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>, view: 'backup' as AdminView },
        { title: 'Global Settings', description: 'Lab details & shift configuration.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, view: 'settings' as AdminView },
        { title: 'Workflow Guide', description: 'View system process & security.', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, view: 'workflow' as AdminView },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
                    <p className="text-slate-500">Overview of lab performance and quick controls.</p>
                </div>
                {/* Quick Shift Toggle */}
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">Current Mode:</span>
                    <button 
                        onClick={toggleShift}
                        className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all ${settings.currentShift === 'Day' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'bg-indigo-900 text-white shadow-sm'}`}
                    >
                        {settings.currentShift} Shift
                    </button>
                </div>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatSummaryCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <StatSummaryCard title="Day Shift Revenue" value={`₹${stats.dayRevenue.toLocaleString()}`} color="yellow" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                <StatSummaryCard title="Night Shift Revenue" value={`₹${stats.nightRevenue.toLocaleString()}`} color="indigo" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>} />
                <StatSummaryCard title="Total Commission" value={`₹${stats.totalCommission.toLocaleString()}`} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Secondary Stats */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 border-b pb-2">Operational Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Total Bills</p>
                            <p className="text-xl font-bold text-slate-800">{stats.billsGenerated}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Referrals</p>
                            <p className="text-xl font-bold text-slate-800">{stats.totalReferrals}</p>
                        </div>
                         <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Top Doctor</p>
                            <p className="text-sm font-bold text-slate-800 truncate" title={stats.topDoctorName}>{stats.topDoctorName}</p>
                            <p className="text-xs text-slate-400">{stats.topDoctorCount} Referrals</p>
                        </div>
                    </div>
                </div>

                {/* Test Breakdown */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 md:col-span-2">
                    <h3 className="font-bold text-slate-800 border-b pb-2">Tests Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-slate-50 rounded">
                            <p className="text-2xl font-bold text-slate-700">{stats.plainTests}</p>
                            <p className="text-sm font-medium text-slate-500">Plain Tests</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded">
                            <p className="text-2xl font-bold text-slate-700">{stats.contrastTests}</p>
                            <p className="text-sm font-medium text-slate-500">Contrast Tests</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded">
                            <p className="text-2xl font-bold text-slate-700">{stats.otherTests}</p>
                            <p className="text-sm font-medium text-slate-500">Other Tests</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Navigation */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4">Management Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature) => (
                        <FeatureCard 
                            key={feature.title} 
                            {...feature}
                            onClick={() => onSelectView(feature.view)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
