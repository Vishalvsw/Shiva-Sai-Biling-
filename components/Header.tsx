
import React from 'react';
import { User } from '../types';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
    return (
        <header className="bg-white shadow-md p-4 print:hidden">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">SHIVASAI SCANNING, LAB & DIAGNOSTIC CENTER</h1>
                    <p className="text-sm text-slate-500">Offline Billing System</p>
                </div>
                <div className="flex items-center gap-4">
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
