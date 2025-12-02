

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TestCategory, Test, BillItem } from '../types';

interface TestSelectorProps {
    testData: TestCategory[];
    onAddTest: (test: Test) => void;
    onRemoveTest: (testId: string) => void;
    currentBillItems: BillItem[];
}

const TreeItem: React.FC<{
    category: TestCategory;
    onAddTest: (test: Test) => void;
    onRemoveTest: (testId: string) => void;
    currentBillItems: BillItem[];
    searchTerm: string;
    isInitiallyOpen: boolean;
    isDisabled: boolean;
}> = ({ category, onAddTest, onRemoveTest, currentBillItems, searchTerm, isInitiallyOpen, isDisabled }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const categoryCheckboxRef = useRef<HTMLInputElement>(null);

    const filteredTests = useMemo(() =>
        category.tests.filter(test =>
            test.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (test.subcategory && test.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [category.tests, searchTerm]);

    const categoryTestIds = useMemo(() => category.tests.map(t => t.id), [category.tests]);
    const billItemIds = useMemo(() => new Set(currentBillItems.map(item => item.id)), [currentBillItems]);

    const selectedInCategoryCount = useMemo(() =>
        categoryTestIds.reduce((count, id) => billItemIds.has(id) ? count + 1 : count, 0),
        [categoryTestIds, billItemIds]
    );

    const isAllSelected = categoryTestIds.length > 0 && selectedInCategoryCount === categoryTestIds.length;
    const isSomeSelected = selectedInCategoryCount > 0 && !isAllSelected;

    useEffect(() => {
        if (categoryCheckboxRef.current) {
            categoryCheckboxRef.current.indeterminate = isSomeSelected;
        }
    }, [isSomeSelected]);

    const categoryNameMatchesSearch = category.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    useEffect(() => {
        // If searching, open categories that have matching tests or category names
        if (searchTerm) {
            setIsOpen(categoryNameMatchesSearch || filteredTests.length > 0);
        } else {
            setIsOpen(isInitiallyOpen);
        }
    }, [searchTerm, filteredTests.length, categoryNameMatchesSearch, isInitiallyOpen]);

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (isAllSelected || isSomeSelected) {
            // Uncheck all -> remove all from this category that are in the bill
            category.tests.forEach(test => {
                if (billItemIds.has(test.id)) {
                    onRemoveTest(test.id)
                }
            });
        } else {
            // Check all -> add all from this category (onAddTest handles duplicates)
            category.tests.forEach(test => onAddTest(test));
        }
    };

    const handleTestToggle = (test: Test) => {
        if (billItemIds.has(test.id)) {
            onRemoveTest(test.id);
        } else {
            onAddTest(test);
        }
    };

    // Group filtered tests by subcategory
    const groupedItems = useMemo(() => {
        const noSub: Test[] = [];
        const subs: { [key: string]: Test[] } = {};
        
        filteredTests.forEach(test => {
            if (test.subcategory) {
                if (!subs[test.subcategory]) subs[test.subcategory] = [];
                subs[test.subcategory].push(test);
            } else {
                noSub.push(test);
            }
        });
        return { noSub, subs };
    }, [filteredTests]);


    const shouldCategoryRender = !searchTerm || categoryNameMatchesSearch || filteredTests.length > 0;

    if (!shouldCategoryRender) {
        return null;
    }

    const renderTestItem = (test: Test) => {
        const isSelected = billItemIds.has(test.id);
        return (
            <label key={test.id} className="flex items-center p-1.5 rounded-md hover:bg-orange-50 cursor-pointer ml-2">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={isSelected}
                    onChange={() => handleTestToggle(test)}
                />
                <span className="ml-2 text-base text-slate-700 font-medium select-none"> {/* Updated text size and weight */}
                    {test.name} <span className="text-slate-400 text-xs ml-1">(₹{test.price})</span>
                </span>
            </label>
        );
    };

    return (
        <div className={`py-1 ${isDisabled ? 'opacity-50' : ''}`}>
            <div
                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${isDisabled ? 'cursor-not-allowed bg-slate-100' : 'hover:bg-slate-100'}`}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                title={isDisabled ? "Cannot mix tests from different major departments or with standard tests." : ""}
            >
                <svg
                    className={`w-4 h-4 mr-2 flex-shrink-0 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <input
                    ref={categoryCheckboxRef}
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                    onClick={e => e.stopPropagation()}
                    disabled={isDisabled}
                    title={isDisabled ? "Category disabled" : `Select all ${category.tests.length} tests in this category`}
                />
                <span className={`ml-2 font-semibold select-none ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`}>{category.category} ({selectedInCategoryCount}/{categoryTestIds.length})</span>
            </div>
            {isOpen && !isDisabled && (
                <div className="pl-6 pt-1 space-y-1 border-l-2 border-slate-100 ml-4">
                    {/* Render Direct Tests */}
                    {groupedItems.noSub.map(renderTestItem)}

                    {/* Render Subcategories */}
                    {Object.entries(groupedItems.subs).map(([subName, tests]) => (
                        <div key={subName} className="mt-2">
                            <div className="text-sm font-semibold text-slate-600 mt-3 mb-1 pl-2 border-b border-slate-200 pb-1">{subName}</div> {/* Updated subcategory styling */}
                            {(tests as Test[]).map(renderTestItem)}
                        </div>
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
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Select Tests</h2>
            <input
                type="text"
                placeholder="Search by test name, subcategory, or category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="space-y-1 overflow-y-auto pr-2 flex-grow">
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
                        <TreeItem 
                            key={category.category} 
                            category={category} 
                            onAddTest={onAddTest}
                            onRemoveTest={onRemoveTest}
                            currentBillItems={currentBillItems}
                            searchTerm={searchTerm}
                            isInitiallyOpen={index < 3 && !searchTerm} // Only initially open first 3 if no search
                            isDisabled={isDisabled}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TestSelector;