import React from 'react';

const SplashScreen: React.FC<{ labName: string }> = ({ labName }) => {
    return (
        <div className="relative flex items-center justify-center h-screen bg-gradient-to-br from-[#143A78] to-[#2057b5]">
            <div className="text-center text-white">
                <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full animate-pulse">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h1 className="mt-6 text-2xl md:text-4xl font-bold tracking-wider uppercase px-4">{labName}</h1>
                <p className="mt-2 text-lg text-blue-100">Initializing Billing System...</p>
            </div>
            <div className="absolute bottom-6 text-center text-white text-sm opacity-80">
                <p>Developed by VISHAL WAGARAJ - vsw data solutions</p>
                <p>www.vswdatasolutions</p>
            </div>
        </div>
    );
};

export default SplashScreen;