
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
    
    const toggleShift = () => {
        setLocalSettings(prev => ({ ...prev, currentShift: prev.currentShift === 'Day' ? 'Night' : 'Day' }));
    };

    const handleSave = () => {
        setSettings(localSettings);
        alert('Settings saved!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-8">
                
                {/* Global Shift Settings */}
                <div className="space-y-4 border-b pb-6">
                     <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Pricing & Shift Mode
                     </h3>
                     <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                            <p className="font-medium text-slate-900">Current Shift: <span className={`font-bold ${localSettings.currentShift === 'Day' ? 'text-yellow-600' : 'text-indigo-600'}`}>{localSettings.currentShift}</span></p>
                            <p className="text-sm text-slate-500">Toggling this will instantly update prices and commission rates for all new items added to a bill.</p>
                        </div>
                        <button 
                            onClick={toggleShift}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${localSettings.currentShift === 'Day' ? 'bg-yellow-400' : 'bg-indigo-900'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${localSettings.currentShift === 'Day' ? 'translate-x-1' : 'translate-x-9'}`} />
                        </button>
                     </div>
                </div>

                {/* Lab Information */}
                <div className="space-y-4 border-b pb-6">
                     <h3 className="text-xl font-bold text-slate-800">Lab Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Lab Name</label>
                            <input type="text" name="labName" value={localSettings.labName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Lab Address</label>
                            <input type="text" name="labAddress" value={localSettings.labAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                         </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Lab Contact</label>
                            <input type="text" name="labContact" value={localSettings.labContact} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                         </div>
                     </div>
                </div>

                {/* Referring Doctors */}
                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-xl font-bold text-slate-800">Referring Doctors</h3>
                    <form onSubmit={handleAddDoctor} className="flex gap-2">
                        <input type="text" value={newDoctor} onChange={e => setNewDoctor(e.target.value)} placeholder="Add new doctor name" className="flex-grow block w-full rounded-md border-slate-300 shadow-sm" />
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] rounded-lg hover:bg-blue-900">Add</button>
                    </form>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {localSettings.referringDoctors.map(doc => (
                            <div key={doc} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">{doc}</span>
                                <button onClick={() => handleRemoveDoctor(doc)} className="text-red-500 hover:text-red-700 px-2">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admin Settings */}
                <div className="space-y-4">
                     <h3 className="text-xl font-bold text-slate-800">System Controls</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Verification Threshold (₹)</label>
                            <input type="number" name="verificationThreshold" value={localSettings.verificationThreshold} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Auto-delete bills older than (days)</label>
                            <input type="number" name="autoDeleteDays" value={localSettings.autoDeleteDays} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                         </div>
                     </div>
                </div>

                 <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="px-8 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md">
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
