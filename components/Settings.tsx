
import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, onBack }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [newDoctor, setNewDoctor] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };
    
    // const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Removed
    //     const percent = parseFloat(e.target.value) || 0;
    //     setLocalSettings(prev => ({ ...prev, taxRate: percent / 100 }));
    // };

    const handleAddDoctor = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDoctor.trim() && !localSettings.referringDoctors.includes(newDoctor.trim())) {
            setLocalSettings(prev => ({ ...prev, referringDoctors: [...prev.referringDoctors, newDoctor.trim()]}));
            setNewDoctor('');
        }
    };
    
    const handleRemoveDoctor = (doctor: string) => {
        setLocalSettings(prev => ({ ...prev, referringDoctors: prev.referringDoctors.filter(d => d !== doctor)}));
    };
    
    const handleSave = () => {
        setSettings(localSettings);
        alert('Settings saved!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                    aria-label="Back to Dashboard"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                
                {/* Lab Information */}
                <div className="space-y-2 border-b pb-4">
                     <h3 className="text-xl font-bold text-slate-800">Lab Information</h3>
                     <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="labName">Lab Name</label>
                        <input type="text" name="labName" id="labName" value={localSettings.labName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" aria-label="Lab Name" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="labAddress">Lab Address</label>
                        <input type="text" name="labAddress" id="labAddress" value={localSettings.labAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" aria-label="Lab Address" />
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="labContact">Lab Contact</label>
                        <input type="text" name="labContact" id="labContact" value={localSettings.labContact} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" aria-label="Lab Contact" />
                     </div>
                </div>

                {/* Financials */}
                <div className="space-y-2 border-b pb-4">
                     <h3 className="text-xl font-bold text-slate-800">Financial & Security</h3>
                     {/* Tax Rate input removed */}
                     <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="verificationThreshold">Admin Verification Threshold (₹)</label>
                        <input type="number" name="verificationThreshold" id="verificationThreshold" value={localSettings.verificationThreshold} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" aria-label="Admin Verification Threshold" />
                        <p className="text-xs text-slate-500 mt-1">Bills with a total amount above this value will require admin approval.</p>
                     </div>
                </div>
                
                {/* Referring Doctors */}
                <div className="space-y-2 border-b pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Referring Doctors</h3>
                    <form onSubmit={handleAddDoctor} className="flex gap-2" aria-label="Add new referring doctor">
                        <input type="text" value={newDoctor} onChange={e => setNewDoctor(e.target.value)} placeholder="Add new doctor name" className="flex-grow block w-full rounded-md border-slate-300 shadow-sm" aria-label="New doctor name" />
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] rounded-lg hover:bg-blue-900">Add</button>
                    </form>
                     <div className="space-y-1 pt-2" aria-label="List of referring doctors">
                        {localSettings.referringDoctors.map(doc => (
                            <div key={doc} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                <span className="text-sm">{doc}</span>
                                <button onClick={() => handleRemoveDoctor(doc)} className="text-red-500 hover:text-red-700" aria-label={`Remove doctor ${doc}`}>&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-2">
                     <h3 className="text-xl font-bold text-slate-800">Data Management</h3>
                     <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="autoDeleteDays">Auto-delete bills older than (days)</label>
                        <input type="number" name="autoDeleteDays" id="autoDeleteDays" value={localSettings.autoDeleteDays} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" aria-label="Auto-delete bills older than X days" />
                        <p className="text-xs text-slate-500 mt-1">Set to 0 to disable automatic deletion.</p>
                     </div>
                </div>

                 <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700" aria-label="Save all settings">
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;