
import React from 'react';

interface FooterProps {
    labName: string;
}

const Footer: React.FC<FooterProps> = ({ labName }) => {
    return (
        <footer className="bg-gray-50 text-center text-xs text-slate-500 py-4 border-t border-slate-200 print:hidden">
            <p>
                Copyright &copy; {new Date().getFullYear()} {labName}. All Rights Reserved.
            </p>
            <p className="mt-1">
                Developed by{' '}
                <a 
                    href="http://vswdatasolutions.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-600 hover:text-blue-700"
                >
                    VISHAL WAGARAJ - vsw data solutions
                </a>
            </p>
        </footer>
    );
};

export default Footer;