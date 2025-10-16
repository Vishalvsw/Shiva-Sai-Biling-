import React from 'react';

type AdminView = 'reports' | 'users' | 'tests' | 'backup' | 'settings';

interface AdminCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, description, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-left border border-slate-200 w-full"
    >
        <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-[#143A78] p-3 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
    </button>
);


interface AdminDashboardProps {
    onSelectView: (view: AdminView) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectView }) => {
    const features: { title: string; description: string; icon: React.ReactNode; view: AdminView }[] = [
        {
            title: 'Manage Users',
            description: 'Add, edit, or remove user accounts.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            view: 'users'
        },
        {
            title: 'View Billing Reports',
            description: 'Generate and view detailed sales reports.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            view: 'reports'
        },
        {
            title: 'Manage Test Types',
            description: 'Add, edit, or update test details and prices.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
            view: 'tests'
        },
        {
            title: 'Backup & Restore',
            description: 'Save or restore your application data.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>,
            view: 'backup'
        },
        {
            title: 'Settings',
            description: 'Configure application-wide settings.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
            view: 'settings'
        }
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 border-b pb-2">Admin Dashboard</h2>
             <p className="text-slate-600 pt-2">Welcome, admin. Select an option below to manage the application.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {features.map((feature) => (
                    <AdminCard 
                        key={feature.title} 
                        {...feature}
                        onClick={() => onSelectView(feature.view)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;