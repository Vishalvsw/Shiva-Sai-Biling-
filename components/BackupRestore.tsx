
import React from 'react';

interface BackupRestoreProps {
    onBack: () => void;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ onBack }) => {

    const handleBackup = () => {
        try {
            const backupData: { [key: string]: any } = {};
            const keysToBackup = ['appUsers', 'testData', 'appSettings', 'savedBills', 'lastBillNumber'];
            
            keysToBackup.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    backupData[key] = JSON.parse(data);
                }
            });

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lab-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Backup successful!');
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Backup failed. See console for details.');
        }
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm('Are you sure you want to restore? This will overwrite all current data.')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Invalid file content");
                
                const restoredData = JSON.parse(text);
                
                // Clear existing data and restore
                Object.keys(restoredData).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(restoredData[key]));
                });
                
                alert('Restore successful! The application will now reload.');
                window.location.reload();

            } catch (error) {
                console.error('Restore failed:', error);
                alert('Restore failed. Make sure you are using a valid backup file.');
            } finally {
                // Reset file input
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Backup & Restore</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Backup Data</h3>
                    <p className="text-sm text-slate-600">Download a JSON file containing all your application data, including saved bills, users, tests, and settings. Keep this file in a safe place.</p>
                    <button onClick={handleBackup} className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Download Backup File
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Restore Data</h3>
                    <p className="text-sm text-slate-600"><strong className="text-red-600">Warning:</strong> Restoring from a file will completely overwrite all existing data. This action cannot be undone.</p>
                     <label htmlFor="restore-file-upload" className="w-full cursor-pointer text-center block px-4 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                        Upload Restore File
                    </label>
                    <input 
                        id="restore-file-upload"
                        type="file" 
                        accept=".json"
                        onChange={handleRestore}
                        className="hidden" 
                    />
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;
