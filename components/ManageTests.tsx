
import React, { useState, useMemo } from 'react';
import { TestCategory, Test, TestNickname } from '../types';

interface ManageTestsProps {
    testData: TestCategory[];
    setTestData: React.Dispatch<React.SetStateAction<TestCategory[]>>;
    nicknames: TestNickname[];
    setNicknames: React.Dispatch<React.SetStateAction<TestNickname[]>>;
    onBack: () => void;
}

// Extended Test type to track origin for editing
type ExtendedTest = Test & { category: string; catIndex: number; testIndex: number };

const ManageTests: React.FC<ManageTestsProps> = ({ testData, setTestData, nicknames, setNicknames, onBack }) => {
    const [activeTab, setActiveTab] = useState<'tests' | 'nicknames'>('tests');

    // --- State for Tests Tab ---
    const [viewMode, setViewMode] = useState<'category' | 'price'>('category');
    const [addingCategoryIndex, setAddingCategoryIndex] = useState<number | null>(null);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<ExtendedTest | null>(null);
    const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set());
    const [bulkValues, setBulkValues] = useState({
        price: '',
        priceNight: '',
        commissionDay: '',
        commissionNight: ''
    });

    // --- State for Nicknames Tab ---
    const [isCreatingNickname, setIsCreatingNickname] = useState(false);
    const [nicknameForm, setNicknameForm] = useState<{name: string, commission: string, selectedTests: Test[]}>({
        name: '',
        commission: '',
        selectedTests: []
    });
    const [nicknameSelectionMode, setNicknameSelectionMode] = useState<'search' | 'group'>('search');
    const [testSearchTerm, setTestSearchTerm] = useState('');
    const [nicknamePreviewShift, setNicknamePreviewShift] = useState<'Day' | 'Night'>('Day');

    // --- Helpers (Shared) ---
    const allTestsFlattened = useMemo(() => {
        const flattened: ExtendedTest[] = [];
        testData.forEach((cat, cIdx) => {
            cat.tests.forEach((test, tIdx) => {
                flattened.push({ ...test, category: cat.category, catIndex: cIdx, testIndex: tIdx });
            });
        });
        return flattened;
    }, [testData]);

    const groupTestsByPrice = (tests: ExtendedTest[]) => {
        const groups: { [key: string]: ExtendedTest[] } = {};
        tests.forEach(test => {
            // Grouping key: D-Price, N-Price, D-Comm, N-Comm
            const pD = test.price;
            const pN = test.priceNight || test.price;
            const cD = test.commissionDay || 0;
            const cN = test.commissionNight || 0;
            const key = JSON.stringify({ pD, pN, cD, cN });
            
            if (!groups[key]) groups[key] = [];
            groups[key].push(test);
        });

        // Convert to array and sort by Price Descending
        return Object.entries(groups).map(([key, groupTests]) => {
            const { pD, pN, cD, cN } = JSON.parse(key);
            return {
                id: key,
                label: `Price: ₹${pD}${pD!==pN?`/₹${pN}`:''} | Comm: ₹${cD}${cD!==cN?`/₹${cN}`:''}`,
                pD, cD,
                tests: groupTests
            };
        }).sort((a, b) => b.pD - a.pD);
    };

    const groupedData = useMemo(() => {
        if (viewMode === 'price' || nicknameSelectionMode === 'group') {
            return groupTestsByPrice(allTestsFlattened);
        }
        return [];
    }, [allTestsFlattened, viewMode, nicknameSelectionMode]);


    // --- Tab: Tests Logic ---

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
            setTestData(testData.filter((_, i) => i !== index));
        }
    };

    const toggleTestSelection = (id: string) => {
        if (editingTestId) { setEditingTestId(null); setEditForm(null); }
        const newSet = new Set(selectedTestIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTestIds(newSet);
    };

    // Generic toggle for a list of tests (used by Category select and Price Group select)
    const toggleGroupSelection = (tests: Test[]) => {
        if (editingTestId) { setEditingTestId(null); setEditForm(null); }
        const allSelected = tests.every(t => selectedTestIds.has(t.id));
        const newSet = new Set(selectedTestIds);
        
        if (allSelected) {
            tests.forEach(t => newSet.delete(t.id));
        } else {
            tests.forEach(t => newSet.add(t.id));
        }
        setSelectedTestIds(newSet);
    };

    const clearSelection = () => {
        setSelectedTestIds(new Set());
        setBulkValues({ price: '', priceNight: '', commissionDay: '', commissionNight: '' });
    };

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

    const handleStartEdit = (test: ExtendedTest, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedTestIds.size > 0) return; 
        setEditingTestId(test.id);
        setEditForm({ ...test });
    };

    const handleCancelEdit = () => {
        setEditingTestId(null);
        setEditForm(null);
    };

    const handleSaveEdit = () => {
        if (!editForm || !editForm.name.trim()) return alert("Test name required");
        // Use catIndex and testIndex from the extended test object to find original location
        const newData = [...testData];
        // Ensure indices are valid
        if (newData[editForm.catIndex] && newData[editForm.catIndex].tests[editForm.testIndex]) {
             // Create a standard Test object to save (remove extended props)
            const { catIndex, testIndex, category, ...standardTest } = editForm;
            newData[editForm.catIndex].tests[editForm.testIndex] = standardTest;
            setTestData(newData);
            setEditingTestId(null);
            setEditForm(null);
        } else {
            alert("Error finding test to update. Indices mismatch.");
        }
    };

    const handleInlineChange = (field: keyof Test, value: string | number) => {
        if (!editForm) return;
        setEditForm({ ...editForm, [field]: value });
    };

    const handleDeleteTest = (catIndex: number, testIndex: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (window.confirm("Delete this test?")) {
            const newData = [...testData];
            newData[catIndex].tests.splice(testIndex, 1);
            setTestData(newData);
        }
    };

    const handleSaveNewTest = (test: Test) => {
        if (addingCategoryIndex === null) return;
        const newData = [...testData];
        newData[addingCategoryIndex].tests.push({ ...test, id: `custom-${Date.now()}` });
        setTestData(newData);
        setAddingCategoryIndex(null);
    };

    // --- Tab: Nicknames Logic ---

    const handleCreateNickname = () => {
        if (!nicknameForm.name.trim()) return alert("Please enter a nickname.");
        if (!nicknameForm.commission) return alert("Please enter a commission amount.");
        if (nicknameForm.selectedTests.length === 0) return alert("Please select at least one test.");

        const newNickname: TestNickname = {
            id: `nick-${Date.now()}`,
            name: nicknameForm.name.trim(),
            commission: parseFloat(nicknameForm.commission),
            testIds: nicknameForm.selectedTests.map(t => t.id)
        };

        setNicknames(prev => [...prev, newNickname]);
        setIsCreatingNickname(false);
        setNicknameForm({ name: '', commission: '', selectedTests: [] });
        setTestSearchTerm('');
    };

    const handleDeleteNickname = (id: string) => {
        if (window.confirm("Are you sure you want to delete this nickname?")) {
            setNicknames(prev => prev.filter(n => n.id !== id));
        }
    };

    const handleAddTestToNickname = (test: Test) => {
        if (nicknameForm.selectedTests.some(t => t.id === test.id)) return;
        setNicknameForm(prev => ({
            ...prev,
            selectedTests: [...prev.selectedTests, test]
        }));
        // Don't clear search term to allow quick multi-add
    };

    const handleAddGroupToNickname = (tests: Test[]) => {
        const currentIds = new Set(nicknameForm.selectedTests.map(t => t.id));
        const newTests = tests.filter(t => !currentIds.has(t.id));
        if (newTests.length === 0) return;
        
        setNicknameForm(prev => ({
            ...prev,
            selectedTests: [...prev.selectedTests, ...newTests]
        }));
    };

    const handleRemoveTestFromNickname = (testId: string) => {
        setNicknameForm(prev => ({
            ...prev,
            selectedTests: prev.selectedTests.filter(t => t.id !== testId)
        }));
    };

    const filteredCategoriesForNickname = useMemo(() => {
        // If no search, return full data (all 6 branches)
        if (!testSearchTerm.trim()) return testData;
        
        const lower = testSearchTerm.toLowerCase();
        // Filter but keep structure
        return testData.map(cat => ({
            ...cat,
            tests: cat.tests.filter(t => 
                t.name.toLowerCase().includes(lower) || 
                t.subcategory?.toLowerCase().includes(lower) ||
                cat.category.toLowerCase().includes(lower)
            )
        })).filter(cat => cat.tests.length > 0);
    }, [testData, testSearchTerm]);

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
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="bg-[#143A78] px-6 py-4 flex justify-between items-center">
                        <h3 className="text-white font-bold text-lg">Add New Test</h3>
                        <button type="button" onClick={() => setAddingCategoryIndex(null)} className="text-white/80 hover:text-white">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Test Name</label>
                            <input autoFocus type="text" className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2 text-sm" 
                                value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. CBC" />
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Subcategory</label>
                            <input type="text" className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2 text-sm" 
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

    // Shared Render Function for Test Row
    // Changed from Component to render function to fix TS issues with `key` and prevent focus loss during editing
    const renderTestRow = (test: ExtendedTest, catIndex: number, testIndex: number) => {
        const isEditing = editingTestId === test.id;
        const isSelected = selectedTestIds.has(test.id);
        
        return (
            <tr key={test.id} className={`group transition-colors ${isEditing ? 'bg-blue-50' : isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4 text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleTestSelection(test.id)} className="h-4 w-4 rounded border-slate-300 text-[#143A78] focus:ring-[#143A78] cursor-pointer" />
                </td>
                {isEditing ? (
                    <>
                        <td className="px-4 py-3 align-top"><input type="text" className="w-full text-sm border-blue-400 rounded focus:ring-1 focus:ring-blue-500 shadow-sm" value={editForm?.name || ''} onChange={e => handleInlineChange('name', e.target.value)} autoFocus /></td>
                        <td className="px-4 py-3 align-top"><input type="text" className="w-full text-sm border-slate-300 rounded focus:ring-blue-500 shadow-sm" value={editForm?.subcategory || ''} onChange={e => handleInlineChange('subcategory', e.target.value)} /></td>
                        <td className="px-4 py-3 align-top"><div className="flex gap-2"><input type="number" placeholder="D" className="w-1/2 text-sm border-slate-300 rounded" value={editForm?.price} onChange={e => handleInlineChange('price', parseFloat(e.target.value)||0)} /><input type="number" placeholder="N" className="w-1/2 text-sm border-slate-300 rounded bg-indigo-50" value={editForm?.priceNight} onChange={e => handleInlineChange('priceNight', parseFloat(e.target.value)||0)} /></div></td>
                        <td className="px-4 py-3 align-top"><div className="flex gap-2"><input type="number" placeholder="D" className="w-1/2 text-sm border-slate-300 rounded" value={editForm?.commissionDay} onChange={e => handleInlineChange('commissionDay', parseFloat(e.target.value)||0)} /><input type="number" placeholder="N" className="w-1/2 text-sm border-slate-300 rounded bg-indigo-50" value={editForm?.commissionNight} onChange={e => handleInlineChange('commissionNight', parseFloat(e.target.value)||0)} /></div></td>
                        <td className="px-6 py-3 align-middle text-right"><div className="flex justify-end gap-2"><button onClick={handleSaveEdit} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700">Save</button><button onClick={handleCancelEdit} className="p-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-100">Cancel</button></div></td>
                    </>
                ) : (
                    <>
                        <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}><span className="text-sm font-medium text-slate-700">{test.name}</span></td>
                        <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}><span className="text-sm text-slate-500">{test.subcategory || '-'}</span></td>
                        <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}><div className="text-sm"><span className="font-semibold text-slate-700">₹{test.price}</span>{test.priceNight ? <span className="text-xs text-indigo-600 ml-1 bg-indigo-50 px-1 rounded">N: {test.priceNight}</span> : null}</div></td>
                        <td className="px-6 py-4 cursor-pointer" onClick={(e) => handleStartEdit(test, e)}><div className="text-sm text-slate-500"><span>{test.commissionDay || 0}</span><span className="mx-1">/</span><span className={test.commissionNight ? 'text-indigo-600' : ''}>{test.commissionNight || 0}</span></div></td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button onClick={(e) => handleStartEdit(test, e)} className="text-slate-400 hover:text-blue-600 p-1 mr-2">✎</button>
                            <button onClick={(e) => handleDeleteTest(catIndex, testIndex, e)} className="text-slate-400 hover:text-red-500 p-1">🗑</button>
                        </td>
                    </>
                )}
            </tr>
        );
    };

    return (
        <div className="space-y-6 pb-24 relative max-w-7xl mx-auto">
            {addingCategoryIndex !== null && <AddTestModal />}

            {/* Header and Tabs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Manage Tests & Nicknames</h2>
                        <p className="text-slate-500 text-sm mt-1">Configure lab tests, pricing, and bundle nicknames.</p>
                    </div>
                    <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold shadow-sm text-sm border border-slate-200">
                        Back to Dashboard
                    </button>
                </div>
                
                {/* Main Tab Navigation */}
                <div className="flex gap-4 border-b border-slate-200">
                    <button 
                        onClick={() => setActiveTab('tests')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tests' ? 'border-[#143A78] text-[#143A78]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Tests & Prices
                    </button>
                    <button 
                        onClick={() => setActiveTab('nicknames')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'nicknames' ? 'border-[#143A78] text-[#143A78]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Manage Nicknames
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: TESTS */}
            {activeTab === 'tests' && (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setViewMode('category')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'category' ? 'bg-white text-[#143A78] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Category View
                            </button>
                            <button 
                                onClick={() => setViewMode('price')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'price' ? 'bg-white text-[#143A78] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Price Group View
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                             <p className="text-slate-400 text-xs hidden md:block mr-2">
                                Tip: Click <span className="inline-block bg-blue-50 text-blue-600 px-1 rounded font-bold">✎</span> to edit.
                            </p>
                            {viewMode === 'category' && (
                                <button onClick={handleAddCategory} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold shadow-sm text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    New Category
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Category View Render */}
                        {viewMode === 'category' && testData.map((category, catIndex) => {
                            const isAllCatSelected = category.tests.length > 0 && category.tests.every(t => selectedTestIds.has(t.id));
                            return (
                                <div key={catIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-3 flex justify-between items-center border-b border-slate-200">
                                        <div className="flex items-center gap-4">
                                             <input type="checkbox" checked={isAllCatSelected} onChange={() => toggleGroupSelection(category.tests)}
                                                className="h-5 w-5 rounded border-slate-300 text-[#143A78] focus:ring-[#143A78] cursor-pointer" title="Select all in category" />
                                            <input type="text" className="text-lg font-bold text-slate-800 bg-transparent border-none focus:ring-0 px-0 py-1 cursor-text w-full hover:bg-white hover:px-2 transition-all rounded"
                                                value={category.category} onChange={(e) => handleCategoryNameChange(catIndex, e.target.value)} placeholder="Category Name" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setAddingCategoryIndex(catIndex)} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">+ Add Test</button>
                                            <button onClick={() => handleDeleteCategory(catIndex)} className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Delete</button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-100">
                                            <thead className="bg-white text-xs font-semibold text-slate-500 uppercase">
                                                <tr>
                                                    <th className="w-12 px-6 py-3 text-center"></th>
                                                    <th className="px-6 py-3 text-left w-[30%]">Test Name</th>
                                                    <th className="px-6 py-3 text-left w-[15%]">Subcategory</th>
                                                    <th className="px-6 py-3 text-left w-[20%]">Price (D/N)</th>
                                                    <th className="px-6 py-3 text-left w-[20%]">Comm (D/N)</th>
                                                    <th className="px-6 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {category.tests.length === 0 && ( <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm italic">No tests in this category.</td></tr> )}
                                                {category.tests.map((test, testIndex) => (
                                                     renderTestRow({ ...test, category: category.category, catIndex, testIndex }, catIndex, testIndex)
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Price Group View Render */}
                        {viewMode === 'price' && groupedData.map((group) => {
                             const isAllGroupSelected = group.tests.length > 0 && group.tests.every(t => selectedTestIds.has(t.id));
                             return (
                                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                     <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center border-b border-indigo-100">
                                        <div className="flex items-center gap-4">
                                            <input type="checkbox" checked={isAllGroupSelected} onChange={() => toggleGroupSelection(group.tests)}
                                                className="h-5 w-5 rounded border-slate-300 text-[#143A78] focus:ring-[#143A78] cursor-pointer" title="Select all in group" />
                                            <div>
                                                <h3 className="text-base font-bold text-indigo-900">{group.label}</h3>
                                                <span className="text-xs text-indigo-600 font-medium">{group.tests.length} Tests</span>
                                            </div>
                                        </div>
                                     </div>
                                     <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-100">
                                            <tbody className="divide-y divide-slate-100">
                                                {group.tests.map((test) => (
                                                    renderTestRow(test, test.catIndex, test.testIndex)
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </>
            )}

            {/* TAB CONTENT: NICKNAMES */}
            {activeTab === 'nicknames' && (
                <div className="space-y-6">
                    {/* Header / Create Toggle */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Existing Nicknames</h3>
                            <p className="text-slate-500 text-sm">Create shorthand bundles to quickly add multiple tests with a specific commission.</p>
                        </div>
                        {!isCreatingNickname && (
                            <button 
                                onClick={() => setIsCreatingNickname(true)}
                                className="px-4 py-2 bg-[#143A78] text-white rounded-lg hover:bg-blue-900 font-semibold shadow-sm text-sm"
                            >
                                + Create New Nickname
                            </button>
                        )}
                    </div>

                    {/* Create Nickname Form */}
                    {isCreatingNickname && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
                            <h3 className="text-lg font-bold text-[#143A78] mb-4 pb-2 border-b">New Nickname Bundle</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nickname (Shortcut)</label>
                                    <input 
                                        type="text" 
                                        value={nicknameForm.name}
                                        onChange={e => setNicknameForm({...nicknameForm, name: e.target.value})}
                                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2"
                                        placeholder="e.g. ct50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Commission (₹)</label>
                                    <input 
                                        type="number" 
                                        value={nicknameForm.commission}
                                        onChange={e => setNicknameForm({...nicknameForm, commission: e.target.value})}
                                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 p-2"
                                        placeholder="e.g. 50"
                                    />
                                </div>
                            </div>

                            {/* Enhanced Test Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Tests to Include</label>
                                
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    {/* Selector Tabs */}
                                    <div className="flex border-b border-slate-200 bg-slate-50 items-center justify-between pr-4">
                                        <div className="flex flex-1">
                                            <button 
                                                onClick={() => setNicknameSelectionMode('search')}
                                                className={`flex-1 py-2 text-sm font-medium transition-colors ${nicknameSelectionMode === 'search' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                List View (All Tests)
                                            </button>
                                            <button 
                                                onClick={() => setNicknameSelectionMode('group')}
                                                className={`flex-1 py-2 text-sm font-medium transition-colors ${nicknameSelectionMode === 'group' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Browse by Price Group
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Day/Night View Toggle */}
                                    <div className="bg-slate-50 px-4 py-2 flex justify-end items-center gap-2 border-b border-slate-200">
                                         <span className="text-xs font-semibold text-slate-500 uppercase">View Prices:</span>
                                         <div className="flex bg-white rounded-md border border-slate-300 overflow-hidden">
                                            <button 
                                                onClick={() => setNicknamePreviewShift('Day')}
                                                className={`px-3 py-1 text-xs font-bold transition-colors ${nicknamePreviewShift === 'Day' ? 'bg-yellow-400 text-yellow-900' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                Day
                                            </button>
                                            <button 
                                                onClick={() => setNicknamePreviewShift('Night')}
                                                className={`px-3 py-1 text-xs font-bold transition-colors ${nicknamePreviewShift === 'Night' ? 'bg-indigo-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                Night
                                            </button>
                                         </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 min-h-[300px] max-h-[500px] overflow-y-auto">
                                        
                                        {/* MODE: LIST / SEARCH (Modified to show all tests in tree) */}
                                        {nicknameSelectionMode === 'search' && (
                                            <div className="space-y-4">
                                                <div className="relative mb-2">
                                                    <input 
                                                        type="text" 
                                                        value={testSearchTerm}
                                                        onChange={e => setTestSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="Search by test name or category (optional)..."
                                                    />
                                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                    </div>
                                                </div>
                                                
                                                {filteredCategoriesForNickname.length === 0 ? (
                                                     <p className="text-center text-slate-500 py-8 italic">No tests found matching "{testSearchTerm}".</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {filteredCategoriesForNickname.map((cat, idx) => (
                                                            <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                                                    <h4 className="font-bold text-slate-700 text-sm">{cat.category}</h4>
                                                                </div>
                                                                <div className="divide-y divide-slate-100">
                                                                    {cat.tests.map(test => {
                                                                        const isAdded = nicknameForm.selectedTests.some(t => t.id === test.id);
                                                                        const displayPrice = nicknamePreviewShift === 'Night' && test.priceNight ? test.priceNight : test.price;
                                                                        const displayComm = nicknamePreviewShift === 'Night' ? (test.commissionNight || 0) : (test.commissionDay || 0);

                                                                        return (
                                                                            <button 
                                                                                key={test.id}
                                                                                onClick={() => handleAddTestToNickname(test)}
                                                                                disabled={isAdded}
                                                                                className={`w-full text-left px-4 py-2 flex justify-between items-center group transition-colors ${isAdded ? 'bg-blue-50 cursor-default' : 'hover:bg-slate-50'}`}
                                                                            >
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`text-sm font-medium ${isAdded ? 'text-blue-800' : 'text-slate-800'}`}>{test.name}</span>
                                                                                        {test.subcategory && <span className="text-xs text-slate-400 bg-slate-100 px-1.5 rounded">{test.subcategory}</span>}
                                                                                    </div>
                                                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                                                        Price: ₹{displayPrice} <span className="text-slate-300">|</span> Comm: ₹{displayComm}
                                                                                    </div>
                                                                                </div>
                                                                                {isAdded ? (
                                                                                     <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Added</span>
                                                                                ) : (
                                                                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-700">Add +</span>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* MODE: GROUP BY PRICE */}
                                        {nicknameSelectionMode === 'group' && (
                                            <div className="space-y-3">
                                                <p className="text-xs text-slate-500 mb-2">Groups with identical price & commission structure.</p>
                                                {groupedData.map(group => (
                                                    <div key={group.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                                        <div className="bg-indigo-50/50 px-4 py-2 flex justify-between items-center border-b border-indigo-100">
                                                            <div>
                                                                <span className="text-sm font-bold text-indigo-900 block">{group.label}</span>
                                                                <span className="text-xs text-indigo-500">{group.tests.length} Tests Available</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleAddGroupToNickname(group.tests)}
                                                                className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 shadow-sm"
                                                            >
                                                                Add All
                                                            </button>
                                                        </div>
                                                        <div className="max-h-40 overflow-y-auto p-2">
                                                            {group.tests.map(test => {
                                                                 const isAdded = nicknameForm.selectedTests.some(t => t.id === test.id);
                                                                 return (
                                                                    <div key={test.id} className="flex justify-between items-center py-1.5 px-2 hover:bg-slate-50 rounded">
                                                                        <span className="text-sm text-slate-700">{test.name}</span>
                                                                        {!isAdded && (
                                                                            <button onClick={() => handleAddTestToNickname(test)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Add</button>
                                                                        )}
                                                                        {isAdded && <span className="text-xs text-green-600 font-medium">Added</span>}
                                                                    </div>
                                                                 );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Selected Tests Footer */}
                                    <div className="bg-white p-4 border-t border-slate-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Selected ({nicknameForm.selectedTests.length})</span>
                                            {nicknameForm.selectedTests.length > 0 && (
                                                <button onClick={() => setNicknameForm({...nicknameForm, selectedTests: []})} className="text-xs text-red-500 hover:text-red-700">Clear All</button>
                                            )}
                                        </div>
                                        {nicknameForm.selectedTests.length === 0 ? (
                                            <p className="text-slate-400 text-sm italic">No tests selected yet.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                                {nicknameForm.selectedTests.map(test => (
                                                    <div key={test.id} className="bg-blue-50 border border-blue-200 rounded-md shadow-sm pl-3 pr-2 py-1 flex items-center gap-2">
                                                        <span className="text-sm font-medium text-blue-800">{test.name}</span>
                                                        <button onClick={() => handleRemoveTestFromNickname(test.id)} className="text-red-400 hover:text-red-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setIsCreatingNickname(false)}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateNickname}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md"
                                >
                                    Create Nickname
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nicknames List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nicknames.map(nick => {
                            // Recover full test objects from IDs for display
                            const fullTests = nick.testIds.map(id => allTestsFlattened.find(t => t.id === id)).filter(Boolean);
                            
                            return (
                                <div key={nick.id} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeleteNickname(nick.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-full">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-1">{nick.name}</h4>
                                    <p className="text-sm font-semibold text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded mb-4">Commission: ₹{nick.commission}</p>
                                    
                                    <div className="space-y-2 border-t pt-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Includes {fullTests.length} Tests</p>
                                        <div className="flex flex-wrap gap-1">
                                            {fullTests.slice(0, 5).map((t, idx) => (
                                                <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 truncate max-w-[150px]">
                                                    {t?.name}
                                                </span>
                                            ))}
                                            {fullTests.length > 5 && (
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                                    +{fullTests.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {nicknames.length === 0 && !isCreatingNickname && (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                <p className="text-lg">No nicknames created yet.</p>
                                <p className="text-sm">Click "Create New Nickname" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sticky Bulk Action Bar (Only for Tests Tab) */}
            {activeTab === 'tests' && selectedTestIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl z-50">
                    <div className="bg-slate-800 text-white rounded-xl shadow-2xl p-4 flex flex-col md:flex-row items-center gap-4 border border-slate-700 ring-4 ring-slate-800/20">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start border-b md:border-b-0 border-slate-700 pb-2 md:pb-0">
                            <span className="font-bold whitespace-nowrap text-lg text-white flex items-center gap-2"><span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">{selectedTestIds.size}</span> Selected</span>
                            <button onClick={clearSelection} className="text-xs text-slate-400 hover:text-white underline">Cancel</button>
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                            <div className="relative"><span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">D-Price</span><input type="number" className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500" value={bulkValues.price} onChange={e => setBulkValues({...bulkValues, price: e.target.value})} /></div>
                             <div className="relative"><span className="absolute left-2 top-1.5 text-xs text-indigo-300 font-bold">N-Price</span><input type="number" className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500" value={bulkValues.priceNight} onChange={e => setBulkValues({...bulkValues, priceNight: e.target.value})} /></div>
                             <div className="relative"><span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">D-Comm</span><input type="number" className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500" value={bulkValues.commissionDay} onChange={e => setBulkValues({...bulkValues, commissionDay: e.target.value})} /></div>
                             <div className="relative"><span className="absolute left-2 top-1.5 text-xs text-indigo-300 font-bold">N-Comm</span><input type="number" className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 rounded text-sm px-3 pt-5 pb-1 w-full focus:ring-blue-500" value={bulkValues.commissionNight} onChange={e => setBulkValues({...bulkValues, commissionNight: e.target.value})} /></div>
                        </div>
                        <button onClick={handleBulkUpdate} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg">Update All</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTests;
