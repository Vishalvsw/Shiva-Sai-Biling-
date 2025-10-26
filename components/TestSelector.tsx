import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TestCategory, Test, BillItem } from '../types';

interface TestSelectorProps {
    testData: TestCategory[];
    onAddTest: (test: Test) => void;
    onRemoveTest: (testId: string) => void;
    currentBillItems: BillItem[];
}

const AccordionItem: React.FC<{
    category: TestCategory;
    onAddTest: (test: Test) => void;
    onRemoveTest: (testId: string) => void;
    currentBillItems: BillItem[];
    searchTerm: string;
    isInitiallyOpen: boolean;
    isDisabled: boolean;
}> = ({ category, onAddTest, onRemoveTest, currentBillItems, searchTerm, isInitiallyOpen, isDisabled }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const checkboxRef = useRef<HTMLInputElement>(null);

    const filteredTests = useMemo(() =>
        category.tests.filter(test =>
            test.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [category.tests, searchTerm]);

    const categoryTestIds = useMemo(() => category.tests.map(t => t.id), [category.tests]);
    const billItemIds = useMemo(() => currentBillItems.map(item => item.id), [currentBillItems]);

    const selectedInCategoryCount = useMemo(() =>
        categoryTestIds.reduce((count, id) => billItemIds.includes(id) ? count + 1 : count, 0),
        [categoryTestIds, billItemIds]
    );

    const isAllSelected = categoryTestIds.length > 0 && selectedInCategoryCount === categoryTestIds.length;
    const isSomeSelected = selectedInCategoryCount > 0 && !isAllSelected;

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isSomeSelected;
        }
    }, [isSomeSelected]);

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (isAllSelected) {
            // Uncheck all -> remove all from this category
            category.tests.forEach(test => onRemoveTest(test.id));
        } else {
            // Check all -> add all from this category (onAddTest handles duplicates)
            category.tests.forEach(test => onAddTest(test));
        }
    };


    if (searchTerm && filteredTests.length === 0) {
        return null;
    }
    
    return (
        <div className={`border rounded-lg overflow-hidden ${isDisabled ? 'bg-slate-100 opacity-60' : 'border-slate-200'}`}>
            <button
                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex justify-between items-center transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
                title={isDisabled ? "Cannot mix tests from different major departments or with standard tests." : ""}
            >
                <div className="flex items-center gap-3">
                    <input
                        ref={checkboxRef}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={isAllSelected}
                        onChange={handleToggleAll}
                        onClick={e => e.stopPropagation()} // Prevent accordion toggle on checkbox click
                        disabled={isDisabled}
                        title={isDisabled ? "Category disabled" : `Select all ${category.tests.length} tests in this category`}
                    />
                    <h3 className={`font-semibold ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`}>{category.category}</h3>
                </div>
                <svg
                    className={`w-5 h-5 transform transition-transform ${isDisabled ? 'text-slate-400' : 'text-slate-500'} ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && !isDisabled && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-white">
                    {filteredTests.map(test => (
                        <button
                            key={test.id}
                            onClick={() => onAddTest(test)}
                            className="text-sm text-left p-2 rounded-md bg-white border border-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                        >
                            {test.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const TestSelector: React.FC<TestSelectorProps> = ({ testData, onAddTest, onRemoveTest, currentBillItems }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const activeBillCategoryInfo = useMemo(() => {
        if (currentBillItems.length === 0) {
            return null;
        }
        const firstItem = currentBillItems[0];
        const category = testData.find(cat => cat.tests.some(t => t.id === firstItem.id));
        return category ? { name: category.category, isMajor: !!category.isMajor } : null;
    }, [currentBillItems, testData]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 h-full">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Select Tests</h2>
            <input
                type="text"
                placeholder="Search for a test..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {testData.map((category, index) => {
                    let isDisabled = false;
                    if (activeBillCategoryInfo) {
                        if (activeBillCategoryInfo.isMajor) {
                            // If a major category item is selected, disable all other categories
                            isDisabled = category.category !== activeBillCategoryInfo.name;
                        } else {
                            // If a standard item is selected, disable all major categories
                            isDisabled = !!category.isMajor;
                        }
                    }

                    return (
                        <AccordionItem 
                            key={category.category} 
                            category={category} 
                            onAddTest={onAddTest}
                            onRemoveTest={onRemoveTest}
                            currentBillItems={currentBillItems}
                            searchTerm={searchTerm}
                            isInitiallyOpen={index < 3 && !searchTerm}
                            isDisabled={isDisabled}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TestSelector;