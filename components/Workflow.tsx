

import React from 'react';

// Reusable component for each step in the workflow
const WorkflowStep: React.FC<{
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ step, title, description, icon }) => (
  <div className="flex items-start">
    <div className="flex flex-col items-center mr-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
        {step}
      </div>
      <div className="w-px h-full bg-blue-300" />
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex-1 relative bottom-2">
      <div className="flex items-center gap-4 mb-2">
        <div className="bg-blue-100 text-[#143A78] p-3 rounded-full">{icon}</div>
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="text-slate-600">{description}</p>
    </div>
  </div>
);

// Arrow component to connect steps
const Arrow = () => (
    <div className="flex justify-start ml-5 h-16">
        <svg width="24" height="100%" viewBox="0 0 24 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-300">
            <path d="M12 0V56L20 48M12 56L4 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
);


const Workflow: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const steps = [
        {
            step: 1,
            title: "Priya Selects Tests",
            description: "The user selects all 4 tests for the patient. The system automatically calculates the total: ₹4,100.",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        },
        {
            step: 2,
            title: "Payment Validation",
            description: "Before saving, the system prompts for 'Amount Received'. Priya enters ₹4,100. The system verifies it matches the total, marking the bill as 'PAID'.",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            step: 3,
            title: "Bill Locking & Audit",
            description: "Once 'Save Bill' is clicked, the bill is locked from user edits. A unique Bill ID, timestamp, and user name are generated. An audit log entry is created instantly.",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        },
        {
            step: 4,
            title: "Admin Dashboard Alert",
            description: "The admin dashboard clearly shows the ₹4,100 transaction as 'Paid'. If Priya had entered only 2 tests (₹3,250), the system would flag it as a 'Partial' payment mismatch (₹4,100 collected vs. ₹3,250 billed).",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        },
        {
            step: 5,
            title: "Audit Trail Review",
            description: "The admin can review the un-editable activity log at any time, which shows every action Priya took, including the payment status calculation. This provides a clear, transparent record for investigation.",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Secure Billing Workflow</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
                <div className="max-w-3xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={step.step}>
                            <WorkflowStep {...step} />
                            {index < steps.length - 1 && <Arrow />}
                        </div>
                    ))}
                     <div className="flex items-start">
                        <div className="flex flex-col items-center mr-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                                ✅
                            </div>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200 flex-1 relative bottom-2">
                            <h3 className="text-xl font-semibold text-green-800">System Outcome</h3>
                            <p className="text-green-700">This automated workflow ensures 100% billing transparency, prevents staff from pocketing cash, and provides administrators with a complete, auditable trail of every transaction.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workflow;