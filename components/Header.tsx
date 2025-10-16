import React from 'react';
import { User } from '../types';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
    viewMode: 'billing' | 'history' | 'dashboard';
    onSetViewMode: (mode: 'billing' | 'history' | 'dashboard') => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
    const baseClasses = "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors";
    const activeClasses = "bg-blue-600 text-white";
    const inactiveClasses = "bg-slate-100 text-slate-700 hover:bg-slate-200";
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, viewMode, onSetViewMode }) => {
    return (
        <header className="bg-white shadow-md p-4 print:hidden">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">SHIVASAI SCANNING, LAB & DIAGNOSTIC CENTER</h1>
                    <p className="text-sm text-slate-500">Offline Billing System</p>
                </div>
                <div className="flex items-center gap-2">
                    <nav className="flex items-center gap-2 border-r pr-2 mr-2">
                         {currentUser.role === 'admin' && (
                             <NavButton isActive={viewMode === 'dashboard'} onClick={() => onSetViewMode('dashboard')}>
                                Dashboard
                            </NavButton>
                         )}
                        <NavButton isActive={viewMode === 'billing'} onClick={() => onSetViewMode('billing')}>
                            Billing
                        </NavButton>
                        <NavButton isActive={viewMode === 'history'} onClick={() => onSetViewMode('history')}>
                           History
                        </NavButton>
                    </nav>
                    <div className="text-right">
                        <p className="font-semibold text-slate-700">Welcome, {currentUser.username}</p>
                        <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;