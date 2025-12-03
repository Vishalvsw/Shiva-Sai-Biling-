
import React, { useState } from 'react';
import { TestCategory, Test } from '../types';

interface ManageTestsProps {
    testData: TestCategory[];
    setTestData: React.Dispatch<React.SetStateAction<TestCategory[]>>;
    onBack: () => void;
}

const ManageTests: React.FC<ManageTestsProps> = ({ testData, setTestData, onBack }) => {
    const [editingTest, setEditingTest] = useState<{ catIndex: number; testIndex: number; test: Test } | null>(null);
    const [isCreatingTest, setIsCreatingTest] = useState<number | null>(null);
    const [isQuickEditMode, setIsQuickEditMode] = useState(false);

    const handleCategoryChange = (index: number, newName: string) => {
        const newData = [...testData];
        newData[index].category = newName;
        setTestData(newData);
    };

    const handleAddCategory = () => {
        const newCategoryName = prompt('Enter new category name:');
        if (newCategoryName && newCategoryName.trim() !== '') {
            setTestData([...testData, { category: newCategoryName.trim(), tests: [] }]);
        }
    };
    
    const handleDeleteCategory = (index: number) => {
        if (window.confirm(`Are you sure you want to delete the category "${testData[index].category}" and all its tests?`)) {
            const newData = testData.filter((_, i) => i !== index);
            setTestData(newData);
        }
    };

    const handleSaveTest = (catIndex: number, originalTestId: string | undefined, updatedTest: Test) => {
        const newData = [...testData];
        if (originalTestId) { 
            const testIndex = newData[catIndex].tests.findIndex(t => t.id === originalTestId);
            if (testIndex !== -1) {
                newData[catIndex].tests[testIndex] = updatedTest;
                alert('Test updated successfully!');
            }
        } else {
            newData[catIndex].tests.push({ ...updatedTest, id: `custom-${Date.now()}` });
            alert('Test added successfully!');
        }
        setTestData(newData);
        setEditingTest(null);
        setIsCreatingTest(null);
    };
    
    const handleDeleteTest = (catIndex: number, testIndex: number) => {
        const testName = testData[catIndex].tests[testIndex].name;
        if (window.confirm(`Are you sure you want to delete the test "${testName}"?`)) {
             const newData = [...testData];
            newData[catIndex].tests = newData[catIndex].tests.filter((_, i) => i !== testIndex);
            setTestData(newData);
        }
    };

    // Quick Update Handler for Inline Edits
    const handleQuickUpdate = (catIndex: number, testIndex: number, field: keyof Test, value: number) => {
        const newData = [...testData];
        // Use type assertion or check to ensure we are setting the right fields
        if (field === 'price' || field === 'priceNight' || field === 'commissionDay' || field === 'commissionNight') {
             newData[catIndex].tests[testIndex] = {
                ...newData[catIndex].tests[testIndex],
                [field]: value
            };
            setTestData(newData);
        }
    };

    interface TestFormProps {
        categoryIndex: number;
        test?: Test;
        onSave: (catIndex: number, originalTestId: string | undefined, updatedTest: Test) => void;
        onCancel: () => void;
    }

    const TestForm: React.FC<TestFormProps> = ({ categoryIndex, test, onSave, onCancel }) => {
        const [name, setName] = useState(test?.name || '');
        const [price, setPrice] = useState(test?.price || 0);
        const [priceNight, setPriceNight] = useState(test?.priceNight || 0);
        const [subcategory, setSubcategory] = useState(test?.subcategory || '');
        const [commissionDay, setCommissionDay] = useState(test?.commissionDay || 0);
        const [commissionNight, setCommissionNight] = useState(test?.commissionNight || 0);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!name.trim() || price <= 0) {
                alert('Test name and a positive price are required.');
                return;
            }
            onSave(categoryIndex, test?.id, { ...test, name: name.trim(), price, priceNight, subcategory: subcategory.trim() || undefined, commissionDay, commissionNight } as Test);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold border-b pb-2">{test ? 'Edit Test' : 'Add New Test'}</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Test Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Day Price (₹)</label>
                            <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Night Price (₹)</label>
                            <input type="number" value={priceNight} onChange={e => setPriceNight(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Subcategory (Optional)</label>
                        <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Comm. Day (₹)</label>
                            <input type="number" value={commissionDay} onChange={e => setCommissionDay(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Comm. Night (₹)</label>
                            <input type="number" value={commissionNight} onChange={e => setCommissionNight(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] rounded-lg hover:bg-blue-900">Save Test</button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {(editingTest || isCreatingTest !== null) && (
                <TestForm 
                    categoryIndex={editingTest?.catIndex ?? isCreatingTest!}
                    test={editingTest?.test}
                    onSave={handleSaveTest}
                    onCancel={() => { setEditingTest(null); setIsCreatingTest(null); }}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Manage Tests</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsQuickEditMode(!isQuickEditMode)} 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${isQuickEditMode ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    >
                        {isQuickEditMode ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Done Editing
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Quick Price Edit
                            </>
                        )}
                    </button>
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                 <div className="flex justify-end">
                    <button onClick={handleAddCategory} className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] rounded-lg hover:bg-blue-900">Add New Category</button>
                </div>

                <div className="space-y-6">
                    {testData.map((category, catIndex) => (
                        <div key={catIndex} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-3">
                                <input 
                                    type="text"
                                    value={category.category}
                                    onChange={(e) => handleCategoryChange(catIndex, e.target.value)}
                                    className="text-lg font-bold text-slate-800 bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none"
                                />
                                <button onClick={() => handleDeleteCategory(catIndex)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete Category</button>
                            </div>
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div className="grid grid-cols-6 gap-2 p-2 bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    <span className="col-span-2">Test Name</span>
                                    <span>Price (D / N)</span>
                                    <span>Subcategory</span>
                                    <span>Comm. (D / N)</span>
                                    <span className="text-right">Actions</span>
                                </div>
                                {category.tests.map((test, testIndex) => (
                                    <div key={test.id} className="grid grid-cols-6 gap-2 p-2 border-t border-slate-100 items-center hover:bg-slate-50">
                                        <span className="col-span-2 text-sm font-medium text-slate-800">{test.name}</span>
                                        
                                        {/* Price Column */}
                                        {isQuickEditMode ? (
                                            <div className="flex flex-col gap-1">
                                                <input 
                                                    type="number" 
                                                    className="w-full text-xs p-1 border rounded focus:ring-1 focus:ring-blue-500" 
                                                    value={test.price} 
                                                    onChange={(e) => handleQuickUpdate(catIndex, testIndex, 'price', parseFloat(e.target.value) || 0)}
                                                    placeholder="Day"
                                                />
                                                <input 
                                                    type="number" 
                                                    className="w-full text-xs p-1 border rounded bg-indigo-50 focus:ring-1 focus:ring-indigo-500" 
                                                    value={test.priceNight || 0} 
                                                    onChange={(e) => handleQuickUpdate(catIndex, testIndex, 'priceNight', parseFloat(e.target.value) || 0)}
                                                    placeholder="Night"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm">₹{test.price} / <span className="text-indigo-600">₹{test.priceNight || test.price}</span></span>
                                        )}

                                        <span className="text-sm text-slate-500 truncate">{test.subcategory || '-'}</span>
                                        
                                        {/* Commission Column */}
                                        {isQuickEditMode ? (
                                            <div className="flex flex-col gap-1">
                                                <input 
                                                    type="number" 
                                                    className="w-full text-xs p-1 border rounded focus:ring-1 focus:ring-blue-500" 
                                                    value={test.commissionDay || 0} 
                                                    onChange={(e) => handleQuickUpdate(catIndex, testIndex, 'commissionDay', parseFloat(e.target.value) || 0)}
                                                    placeholder="Day"
                                                />
                                                <input 
                                                    type="number" 
                                                    className="w-full text-xs p-1 border rounded bg-indigo-50 focus:ring-1 focus:ring-indigo-500" 
                                                    value={test.commissionNight || 0} 
                                                    onChange={(e) => handleQuickUpdate(catIndex, testIndex, 'commissionNight', parseFloat(e.target.value) || 0)}
                                                    placeholder="Night"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm">₹{test.commissionDay} / <span className="text-indigo-600">₹{test.commissionNight}</span></span>
                                        )}

                                        <div className="flex justify-end gap-3">
                                            {!isQuickEditMode && (
                                                <button onClick={() => setEditingTest({ catIndex, testIndex, test })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                            )}
                                            <button onClick={() => handleDeleteTest(catIndex, testIndex)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-2 border-t border-slate-100 bg-slate-50">
                                    <button onClick={() => setIsCreatingTest(catIndex)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Add Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageTests;
