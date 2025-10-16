
import React, { useState } from 'react';
import { TestCategory, Test } from '../types';

interface ManageTestsProps {
    testData: TestCategory[];
    setTestData: React.Dispatch<React.SetStateAction<TestCategory[]>>;
    onBack: () => void;
}

const ManageTests: React.FC<ManageTestsProps> = ({ testData, setTestData, onBack }) => {

    const handleCategoryChange = (index: number, newName: string) => {
        const newData = [...testData];
        newData[index].category = newName;
        setTestData(newData);
    };

    const handleAddCategory = () => {
        const newCategoryName = prompt('Enter new category name:');
        if (newCategoryName && newCategoryName.trim() !== '') {
            setTestData([...testData, { category: newCategoryName, tests: [] }]);
        }
    };
    
    const handleDeleteCategory = (index: number) => {
        if (window.confirm(`Are you sure you want to delete the category "${testData[index].category}" and all its tests?`)) {
            const newData = testData.filter((_, i) => i !== index);
            setTestData(newData);
        }
    };

    const handleTestChange = (catIndex: number, testIndex: number, updatedTest: Test) => {
        const newData = [...testData];
        newData[catIndex].tests[testIndex] = updatedTest;
        setTestData(newData);
    };

    const handleAddTest = (catIndex: number) => {
        const name = prompt('Enter new test name:');
        const priceStr = prompt('Enter test price:');
        if (name && priceStr && !isNaN(parseFloat(priceStr))) {
            const newTest: Test = {
                id: `custom-${Date.now()}`,
                name,
                price: parseFloat(priceStr)
            };
            const newData = [...testData];
            newData[catIndex].tests.push(newTest);
            setTestData(newData);
        }
    };
    
    const handleDeleteTest = (catIndex: number, testIndex: number) => {
        if (window.confirm(`Are you sure you want to delete this test?`)) {
             const newData = [...testData];
            newData[catIndex].tests = newData[catIndex].tests.filter((_, i) => i !== testIndex);
            setTestData(newData);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Manage Tests</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                 <div className="flex justify-end">
                    <button onClick={handleAddCategory} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">
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
                                    className="text-xl font-bold text-slate-800 border-b-2 border-transparent focus:border-teal-500 outline-none"
                                />
                                <button onClick={() => handleDeleteCategory(catIndex)} className="text-red-500 hover:text-red-700 text-sm">Delete Category</button>
                            </div>
                            <div className="pl-4">
                                {category.tests.map((test, testIndex) => (
                                    <div key={test.id} className="flex items-center gap-2 py-1 border-b last:border-b-0">
                                        <input 
                                            type="text" 
                                            value={test.name}
                                            onChange={(e) => handleTestChange(catIndex, testIndex, { ...test, name: e.target.value })}
                                            className="flex-grow p-1 rounded border border-slate-200"
                                        />
                                        <input 
                                            type="number" 
                                            value={test.price}
                                            onChange={(e) => handleTestChange(catIndex, testIndex, { ...test, price: parseFloat(e.target.value) || 0 })}
                                            className="w-24 p-1 rounded border border-slate-200"
                                        />
                                        <button onClick={() => handleDeleteTest(catIndex, testIndex)} className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddTest(catIndex)} className="mt-2 text-sm text-teal-600 hover:text-teal-800">+ Add Test</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageTests;
