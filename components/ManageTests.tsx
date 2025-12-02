import React, { useState } from 'react';
import { TestCategory, Test } from '../types';

interface ManageTestsProps {
    testData: TestCategory[];
    setTestData: React.Dispatch<React.SetStateAction<TestCategory[]>>;
    onBack: () => void;
}

const ManageTests: React.FC<ManageTestsProps> = ({ testData, setTestData, onBack }) => {
    const [editingTest, setEditingTest] = useState<{ catIndex: number; testIndex: number; test: Test } | null>(null);
    const [isCreatingTest, setIsCreatingTest] = useState<number | null>(null); // Index of category to add test to

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
        if (originalTestId) { // Editing existing test
            const testIndex = newData[catIndex].tests.findIndex(t => t.id === originalTestId);
            if (testIndex !== -1) {
                newData[catIndex].tests[testIndex] = updatedTest;
                alert('Test updated successfully!');
            }
        } else { // Adding new test
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

    interface TestFormProps {
        categoryIndex: number;
        test?: Test; // Optional, if editing an existing test
        onSave: (catIndex: number, originalTestId: string | undefined, updatedTest: Test) => void;
        onCancel: () => void;
    }

    const TestForm: React.FC<TestFormProps> = ({ categoryIndex, test, onSave, onCancel }) => {
        const [name, setName] = useState(test?.name || '');
        const [price, setPrice] = useState(test?.price || 0);
        const [subcategory, setSubcategory] = useState(test?.subcategory || '');
        const [commissionDay, setCommissionDay] = useState(test?.commissionDay || 0);
        const [commissionNight, setCommissionNight] = useState(test?.commissionNight || 0);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!name.trim() || price <= 0) {
                alert('Test name and a positive price are required.');
                return;
            }
            onSave(categoryIndex, test?.id, { ...test, name: name.trim(), price, subcategory: subcategory.trim() || undefined, commissionDay, commissionNight } as Test);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
                    <h3 className="text-xl font-bold">{test ? 'Edit Test' : 'Add New Test'}</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Test Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" required aria-label="Test Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Price (₹)</label>
                        <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0.01" step="0.01" required aria-label="Test Price" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Subcategory (Optional)</label>
                        <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" aria-label="Test Subcategory" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Commission Day (₹)</label>
                        <input type="number" value={commissionDay} onChange={e => setCommissionDay(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0" step="1" aria-label="Commission Day" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Commission Night (₹)</label>
                        <input type="number" value={commissionNight} onChange={e => setCommissionNight(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" min="0" step="1" aria-label="Commission Night" />
                    </div>
                    <div className="flex justify-end gap-2">
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
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                    aria-label="Back to Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                 <div className="flex justify-end">
                    <button onClick={handleAddCategory} className="px-4 py-2 text-sm font-medium text-white bg-[#143A78] rounded-lg hover:bg-blue-900" aria-label="Add new test category">
                        Add New Category
                    </button>
                </div>

                <div className="space-y-4">
                    {testData.map((category, catIndex) => (
                        <div key={catIndex} className="border border-slate-200 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <input 
                                    type="text"
                                    value={category.category}
                                    onChange={(e) => handleCategoryChange(catIndex, e.target.value)}
                                    className="text-xl font-bold text-slate-800 border-b-2 border-transparent focus:border-blue-500 outline-none"
                                    aria-label={`Category name: ${category.category}`}
                                />
                                <button onClick={() => handleDeleteCategory(catIndex)} className="text-red-500 hover:text-red-700 text-sm" aria-label={`Delete category ${category.category}`}>Delete Category</button>
                            </div>
                            <div className="pl-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2 font-semibold text-slate-700">
                                    <span className="md:col-span-2 lg:col-span-2">Test Name</span>
                                    <span>Price</span>
                                    <span>Subcategory</span>
                                    <span>Comm. Day</span>
                                    <span>Comm. Night</span>
                                    <span className="sr-only">Actions</span>
                                </div>
                                {category.tests.map((test, testIndex) => (
                                    <div key={test.id} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2 py-1 border-t">
                                        <span className="md:col-span-2 lg:col-span-2 truncate text-sm">{test.name}</span>
                                        <span className="text-sm">₹{test.price.toFixed(2)}</span>
                                        <span className="text-sm truncate">{test.subcategory || '-'}</span>
                                        <span className="text-sm">₹{test.commissionDay?.toFixed(2) || '0.00'}</span>
                                        <span className="text-sm">₹{test.commissionNight?.toFixed(2) || '0.00'}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingTest({ catIndex, testIndex, test })} className="text-orange-600 hover:text-orange-800 text-sm" aria-label={`Edit test ${test.name}`}>Edit</button>
                                            <button onClick={() => handleDeleteTest(catIndex, testIndex)} className="text-red-500 hover:text-red-700 text-sm" aria-label={`Delete test ${test.name}`}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setIsCreatingTest(catIndex)} className="mt-2 text-sm text-orange-600 hover:text-orange-800" aria-label={`Add new test to ${category.category}`}>+ Add Test</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageTests;