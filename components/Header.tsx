import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md p-4 print:hidden">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">SHIVASAI SCANNING, LAB & DIAGNOSTIC CENTER</h1>
                    <p className="text-sm text-slate-500">Offline Billing System</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
