
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
    
    const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percent = parseFloat(e.target.value) || 0;
        setLocalSettings(prev => ({ ...prev, taxRate: percent / 100 }));
    };

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
                        <label className="block text-sm font-medium text-slate-700">Lab Name</label>
                        <input type="text" name="labName" value={localSettings.labName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Lab Address</label>
                        <input type="text" name="labAddress" value={localSettings.labAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Lab Contact</label>
                        <input type="text" name="labContact" value={localSettings.labContact} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                     </div>
                </div>

                {/* Financials */}
                <div className="space-y-2 border-b pb-4">
                     <h3 className="text-xl font-bold text-slate-800">Financial</h3>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Tax Rate (%)</label>
                        <input type="number" name="taxRate" value={localSettings.taxRate * 100} onChange={handleTaxChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                     </div>
                </div>
                
                {/* Referring Doctors */}
                <div className="space-y-2 border-b pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Referring Doctors</h3>
                    <form onSubmit={handleAddDoctor} className="flex gap-2">
                        <input type="text" value={newDoctor} onChange={e => setNewDoctor(e.target.value)} placeholder="Add new doctor name" className="flex-grow block w-full rounded-md border-slate-300 shadow-sm" />
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Add</button>
                    </form>
                     <div className="space-y-1 pt-2">
                        {localSettings.referringDoctors.map(doc => (
                            <div key={doc} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                <span className="text-sm">{doc}</span>
                                <button onClick={() => handleRemoveDoctor(doc)} className="text-red-500 hover:text-red-700">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-2">
                     <h3 className="text-xl font-bold text-slate-800">Data Management</h3>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Auto-delete bills older than (days)</label>
                        <input type="number" name="autoDeleteDays" value={localSettings.autoDeleteDays} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                        <p className="text-xs text-slate-500 mt-1">Set to 0 to disable automatic deletion.</p>
                     </div>
                </div>

                 <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
