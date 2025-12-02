
import React from 'react';
import { User, AppSettings } from '../types';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
    viewMode: 'billing' | 'history' | 'dashboard';
    onSetViewMode: (mode: 'billing' | 'history' | 'dashboard') => void;
    settings: AppSettings;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
    const baseClasses = "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200";
    const activeClasses = "bg-white text-blue-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-white hover:bg-opacity-20";
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, viewMode, onSetViewMode, settings }) => {
    return (
        <header className="bg-gradient-to-r from-[#143A78] to-[#2057b5] shadow-lg p-4 print:hidden">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{settings.labName}</h1>
                    <p className="text-sm text-blue-100">Offline Billing System</p>
                </div>
                <div className="flex items-center gap-2">
                    <nav className="flex items-center gap-2 border-r border-blue-400 pr-2 mr-2">
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
                        <p className="font-semibold text-white">Welcome, {currentUser.username}</p>
                        <p className="text-xs text-blue-200 capitalize">{currentUser.role}</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;