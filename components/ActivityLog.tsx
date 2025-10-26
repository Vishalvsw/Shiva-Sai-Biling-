import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../types';

interface ActivityLogProps {
    auditLog: AuditLogEntry[];
    onBack: () => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ auditLog, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return auditLog;
        const lowercasedFilter = searchTerm.toLowerCase();
        return auditLog.filter(log =>
            log.user.toLowerCase().includes(lowercasedFilter) ||
            log.action.toLowerCase().includes(lowercasedFilter) ||
            log.details.toLowerCase().includes(lowercasedFilter)
        );
    }, [auditLog, searchTerm]);

    return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Activity Log</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <input
                    type="text"
                    placeholder="Search logs by user, action, or details..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Timestamp</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">User</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Action</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">{log.user}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-slate-500 break-words">{log.details}</td>
                                </tr>
                            ))}
                             {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-500 italic">No log entries found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
