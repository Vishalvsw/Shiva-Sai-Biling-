
import React, { useState, useMemo } from 'react';
import { TestCategory, Test } from '../types';

interface ManageTestsProps {
    testData: TestCategory[];
    setTestData: React.Dispatch<React.SetStateAction<TestCategory[]>>;
    onBack: () => void;
}

const ManageTests: React.FC<ManageTestsProps> = ({ testData, setTestData, onBack }) => {
    // --- State ---
    const [addingCategoryIndex, setAddingCategoryIndex] = useState<number | null>(null);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Test | null>(null);
    
    // Selection State
    const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set());
    
    // Bulk Edit Form State
    const [bulkValues, setBulkValues] = useState({
        price: '',
        priceNight: '',
        commissionDay: '',
        commissionNight: ''
    });

    // --- Helpers ---
    const allTestIds = useMemo(() => {
        const ids: string[] = [];
        testData.forEach(cat => cat.tests.forEach(t => ids.push(t.id)));
        return ids;
    }, [testData]);

    // --- Category Handlers ---
    const handleCategoryNameChange = (index: number, newName: string) => {
        const newData = [...testData];
        newData[index].category = newName;
        setTestData(newData);
    };

    const handleAddCategory = () => {
        const name = prompt('Enter new category name:');
        if (name?.trim()) {
            setTestData([...testData, { category: name.trim(), tests: [] }]);
        }
    };

    const handleDeleteCategory = (index: number) => {
        if (window.confirm(`Delete category "${testData[index].category}" and all its tests?`)) {
            // Remove selected IDs if they belong to this category
            const idsToRemove = testData[index].tests.map(t => t.id);
            const newSelected = new Set(selectedTestIds);
            idsToRemove.forEach(id => newSelected.delete(id));
            setSelectedTestIds(newSelected);

            setTestData(testData.filter((_, i) => i !== index));
        }
    };

    // --- Selection Handlers ---
    const toggleTestSelection = (id: string) => {
        // If editing, stop editing when selecting
        if (editingTestId) {
            setEditingTestId(null);
            setEditForm(null);
        }
        
        const newSet = new Set(selectedTestIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTestIds(newSet);
    };

    const toggleCategorySelection = (catIndex: number) => {
        // If editing, stop editing when selecting
        if (editingTestId) {
            setEditingTestId(null);
            setEditForm(null);
        }

        const catTests = testData[catIndex].tests;
        const allSelected = catTests.every(t => selectedTestIds.has(t.id));
        
        const newSet = new Set(selectedTestIds);
        if (allSelected) {
            catTests.forEach(t => newSet.delete(t.id));
        } else {
            catTests.forEach(t => newSet.add(t.id));
        }
        setSelectedTestIds(newSet);
    };

    const clearSelection = () => {
        setSelectedTestIds(new Set());
        setBulkValues({ price: '', priceNight: '', commissionDay: '', commissionNight: '' });
    };

    // --- Bulk Action Handlers ---
    const handleBulkUpdate = () => {
        if (selectedTestIds.size === 0) return;
        if (!window.confirm(`Update ${selectedTestIds.size} selected tests with entered values? Empty fields will remain unchanged.`)) return;

        const newData = testData.map(cat => ({
            ...cat,
            tests: cat.tests.map(t => {
                if (selectedTestIds.has(t.id)) {
                    return {
                        ...t,
                        price: bulkValues.price !== '' ? Number(bulkValues.price) : t.price,
                        priceNight: bulkValues.priceNight !== '' ? Number(bulkValues.priceNight) : t.priceNight,
                        commissionDay: bulkValues.commissionDay !== '' ? Number(bulkValues.commissionDay) : t.commissionDay,
                        commissionNight: bulkValues.commissionNight !== '' ? Number(bulkValues.commissionNight) : t.commissionNight,
                    };
                }
                return t;
            })
        }));

        setTestData(newData);
        clearSelection();
    };

    // --- Single Edit Handlers ---
    const handleStartEdit = (test: Test, e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent row click if button clicked
        // Prevent edit if we are selecting
        if (selectedTestIds.size > 0) return; 
        setEditingTestId(test.id);
        setEditForm({ ...test });
    };

    const handleCancelEdit = () => {
        setEditingTestId(null);
        setEditForm(null);
    };

    const handleSaveEdit = (catIndex: number, testIndex: number) => {
        if (!editForm || !editForm.name.trim()) return alert("Test name required");
        
        const newData = [...testData];
        newData[catIndex].tests[testIndex] = editForm;
        setTestData(newData);
        setEditingTestId(null);
        setEditForm(null);
    };

    const handleInlineChange = (field: keyof Test, value: string | number) => {
        if (!editForm) return;
        setEditForm({ ...editForm, [field]: value });
    };

    const handleDeleteTest = (catIndex: number, testIndex: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (window.confirm("Delete this test?")) {
            const testId = testData[catIndex].tests[testIndex].id;
            const newSelected = new Set(selectedTestIds);
            newSelected.delete(testId);
            setSelectedTestIds(newSelected);

            const newData = [...testData];
            newData[catIndex].tests.splice(testIndex, 1);
            setTestData(newData);
        }
    };

    // --- New Test Handler ---
    const handleSaveNewTest = (test: Test) => {
        if (addingCategoryIndex === null) return;
        const newData = [...testData];
        newData[addingCategoryIndex].tests.push({ ...test, id: `custom-${Date.now()}` });
        setTestData(newData);
        setAddingCategoryIndex(null);
    };

    // --- Components ---
    const AddTestModal = () => {
        const [formData, setFormData] = useState<Partial<Test>>({ price: 0, priceNight: 0, commissionDay: 0, commissionNight: 0 });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!formData.name || !formData.price) return alert("Name and Price are required");
            handleSaveNewTest(formData as Test);
        };

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm p-4 transition-opacity duration-300">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                    <div className="bg-[#143A78] px-6 py-4 flex justify-between items-center">
                        <h3 className="text-white font-bold text-lg">Add New Test</h3>
                        <button type="button" onClick={() => setAddingCategoryIndex(null)} className="text-white/80 hover:text-white transition-colors">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Test Name</label>
                            <input autoFocus type="text" className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 text-sm" 
                                value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. CBC" />
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Subcategory</label>
                            <input type="text" className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 text-sm" 
                                value={formData.subcategory || ''} onChange={e => setFormData({...formData, subcategory: e.target.value})} placeholder="e.g. Biochemistry" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Day Price (₹)</label>
                                <input type="number" className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2 text-sm" 
                                    value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)||0})} min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Night Price (₹)</label>
                                <input type="number" className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2 text-sm" 
                                    value={formData.priceNight} onChange={e => setFormData({...formData, priceNight: parseFloat(e.target.value)||0})} min="0" />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Commissions</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Day Shift</label>
                                    <input type="number" className="w-full border-slate-300 rounded text-sm p-1.5" 
                                        value={formData.commissionDay} onChange={e => setFormData({...formData, commissionDay: parseFloat(e.target.value)||0})} min="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Night Shift</label>
                                    <input type="number" className="w-full border-slate-300 rounded text-sm p-1.5" 
                                        value={formData.commissionNight} onChange={e => setFormData({...formData, commissionNight: parseFloat(e.target.value)||0})} min="0" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={() => setAddingCategoryIndex(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[#143A78] text-white hover:bg-blue-900 rounded-lg font-medium text-sm shadow-sm">Save Test</button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-24 relative max-w-7xl mx-auto">
            {addingCategoryIndex !== null && <AddTestModal />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Manage Tests</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Select multiple items to bulk edit prices, or click the <span className="inline-block bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-xs font-bold">✎</span> icon to edit individually.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleAddCategory} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold shadow-sm text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Category
                    </button>
                    <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold shadow-sm text-sm border border-slate-200">
                        Back
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
                {testData.map((category, catIndex) => {
                    const isAllCatSelected = category.tests.length > 0 && category.tests.every(t => selectedTestIds.has(t.id));
                    
                    return (
                        <div key={catIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Category Header */}
                            <div className="bg-slate-50 px-6 py-3 flex justify-between items-center border-b border-slate-200">
                                <div className="flex items-center gap-4">
                                     <input 
                                        type="checkbox" 
                                        checked={isAllCatSelected}
                                        onChange={() => toggleCategorySelection(catIndex)}
                                        className="h-5 w-5 rounded border-slate-300 text-[#143A78] focus:ring-[#143A78] cursor-pointer"
                                        title="Select all in category"
                                     />
                                    <input 
                                        type="text"
                                        className="text-lg font-bold text-slate-800 bg-transparent border-none focus:ring-0 px-0 py-1 cursor-text w-full hover:bg-white hover:px-2 transition-all rounded"
                                        value={category.category}
                                        onChange={(e) => handleCategoryNameChange(catIndex, e.target.value)}
                                        placeholder="Category Name"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setAddingCategoryIndex(catIndex)} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                                        + Add Test
                                    </button>
                                    <button onClick={() => handleDeleteCategory(catIndex)} className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Tests Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-white text-xs font-semibold text-slate-500 uppercase">
                                        <tr>
                                            <th className="w-12 px-6 py-3 text-center">
                                                {/* Checkbox Col */}
                                            </th>
                                            <th className="px-6 py-3 text-left w-[30%]">Test Name</th>
                                            <th className="px-6 py-3 text-left w-[15%]">Subcategory</th>
                                            <th className="px-6 py-3 text-left w-[20%]">Price (Day/Night)</th>
                                            <th className="px-6 py-3 text-left w-[20%]">Comm (Day/Night)</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {category.tests.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm italic">No tests in this category.</td></tr>
                                        )}
                                        {category.tests.map((test, testIndex) => {
                                            const isEditing = editingTestId === test.id;
                                            const isSelected = selectedTestIds.has(test.id);

                                            return (
                                                <tr key={test.id} className={`group transition-colors ${isEditing ? 'bg-blue-50' : isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                                                    <td className="px-6 py-4 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => toggleTestSelection(test.id)}
                                                            className="h-4 w-4 rounded border-slate-300 text-[#143A78] focus:ring-[#143A78] cursor-pointer"
                                                        />
                                                    </td>

                                                    {isEditing ? (
                                                        // --- EDIT MODE ---
                                                        <>
                                                            <td className="px-4 py-3 align-top">
                                                                <input type="text" className="w-full text-sm border-blue-400 rounded focus:ring-1 focus:ring-blue-500 shadow-sm" 
                                                                    value={editForm?.name} onChange={e => handleInlineChange('name', e.target.value)} autoFocus />
                                                            </td>
                                                            <td className="px-4 py-3 align-top">
                                                                <input type="text" className="w-full text-sm border-slate-300 rounded focus:ring-blue-500 shadow-sm" 
                                                                    value={editForm?.subcategory || ''} onChange={e => handleInlineChange('subcategory', e.target.value)} />
                                                            </td>
                                                            <td className="px-4 py-3 align-top">
                                                                <div className="flex gap-2">
                                                                    <input type="number" placeholder="D" className="w-1/2 text-sm border-slate-300 rounded focus:ring-blue-500" 
                                                                        value={editForm?.price} onChange={e => handleInlineChange('price', parseFloat(e.target.value)||0)} />
                                                                    <input type="number" placeholder="N" className="w-1/2 text-sm border-slate-300 rounded focus:ring-blue-500 bg-indigo-50" 
                                                                        value={editForm?.priceNight} onChange={e => handleInlineChange('priceNight', parseFloat(e.target.value)||0)} />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 align-top">
                                                                <div className="flex gap-2">
                                                                    <input type="number" placeholder="D" className="w-1/2 text-sm border-slate-300 rounded focus:ring-blue-500" 
                                                                        value={editForm?.commissionDay} onChange={e => handleInlineChange('commissionDay', parseFloat(e.target.value)||0)} />
                                                                    <input type="number" placeholder="N" className="w-1/2 text-sm border-slate-300 rounded focus:ring-blue-500 bg-indigo-50" 
                                                                        value={editForm?.commissionNight} onChange={e => handleInlineChange('commissionNight', parseFloat(e.target.value)||0)} />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 align-middle text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button onClick={() => handleSaveEdit(catIndex, testIndex)} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700" title="Save">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                    </button>
                                                                    <button onClick={handleCancelEdit} className="p-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-100" title="Cancel">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        // --- VIEW MODE ---
                                                        <>
                                                            <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}>
                                                                <span className="text-sm font-medium text-slate-700">{test.name}</span>
                                                            </td>
                                                            <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}>
                                                                <span className="text-sm text-slate-500">{test.subcategory || '-'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}>
                                                                <div className="text-sm">
                                                                    <span className="font-semibold text-slate-700">₹{test.price}</span>
                                                                    {test.priceNight ? <span className="text-xs text-indigo-600 ml-1 bg-indigo-50 px-1 rounded">N: {test.priceNight}</span> : null}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}>
                                                                <div className="text-sm text-slate-500">
                                                                    <span>{test.commissionDay || 0}</span>
                                                                    <span className="mx-1">/</span>
                                                                    <span className={test.commissionNight ? 'text-indigo-600' : ''}>{test.commissionNight || 0}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                 <button onClick={(e) => handleStartEdit(test, e)} className="text-slate-400 hover:text-blue-600 transition-colors p-1 mr-2" title="Edit">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button onClick={(e) => handleDeleteTest(catIndex, testIndex, e)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sticky Bulk Action Bar */}
            {selectedTestIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl z-50 transition-all duration-500 ease-in-out">
                    <div className="bg-slate-800 text-white rounded-xl shadow-2xl p-4 flex flex-col md:flex-row items-center gap-4 border border-slate-700 ring-4 ring-slate-800/20">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start border-b md:border-b-0 border-slate-700 pb-2 md:pb-0">
                            <span className="font-bold whitespace-nowrap text-lg text-white flex items-center gap-2">
                                <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">{selectedTestIds.size}</span>
                                <span className="hidden md:inline">Selected</span>
                            </span>
                            <button onClick={clearSelection} className="text-xs text-slate-400 hover:text-white underline">Cancel</button>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                            <div className="relative">
                                <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">D-Price</span>
                                <input 
                                    type="number" 
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                    value={bulkValues.price} onChange={e => setBulkValues({...bulkValues, price: e.target.value})}
                                />
                            </div>
                             <div className="relative">
                                <span className="absolute left-2 top-1.5 text-xs text-indigo-300 font-bold">N-Price</span>
                                <input 
                                    type="number" 
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                    value={bulkValues.priceNight} onChange={e => setBulkValues({...bulkValues, priceNight: e.target.value})}
                                />
                            </div>
                             <div className="relative">
                                <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">D-Comm</span>
                                <input 
                                    type="number"
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                    value={bulkValues.commissionDay} onChange={e => setBulkValues({...bulkValues, commissionDay: e.target.value})}
                                />
                            </div>
                             <div className="relative">
                                <span className="absolute left-2 top-1.5 text-xs text-indigo-300 font-bold">N-Comm</span>
                                <input 
                                    type="number" 
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                    value={bulkValues.commissionNight} onChange={e => setBulkValues({...bulkValues, commissionNight: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleBulkUpdate}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-transform transform active:scale-95 whitespace-nowrap"
                        >
                            Update All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTests;
