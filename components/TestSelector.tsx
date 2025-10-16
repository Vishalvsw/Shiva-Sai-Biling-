import React, { useState, useMemo } from 'react';
import { TestCategory, Test } from '../types';

interface TestSelectorProps {
    testData: TestCategory[];
    onAddTest: (test: Test) => void;
}

const AccordionItem: React.FC<{
    category: TestCategory;
    onAddTest: (test: Test) => void;
    searchTerm: string;
    isInitiallyOpen: boolean;
}> = ({ category, onAddTest, searchTerm, isInitiallyOpen }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);

    const filteredTests = useMemo(() =>
        category.tests.filter(test =>
            test.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [category.tests, searchTerm]);

    if (searchTerm && filteredTests.length === 0) {
        return null;
    }
    
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex justify-between items-center transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-semibold text-slate-700">{category.category}</h3>
                <svg
                    className={`w-5 h-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
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

const TestSelector: React.FC<TestSelectorProps> = ({ testData, onAddTest }) => {
    const [searchTerm, setSearchTerm] = useState('');

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
                {testData.map((category, index) => (
                    <AccordionItem 
                        key={category.category} 
                        category={category} 
                        onAddTest={onAddTest}
                        searchTerm={searchTerm}
                        isInitiallyOpen={index < 3 && !searchTerm}
                    />
                ))}
            </div>
        </div>
    );
};

export default TestSelector;