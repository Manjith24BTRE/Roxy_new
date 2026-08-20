import React, { useState } from 'react';
import ReportProblemForm from '../../../components/landing/modals/resources/ReportProblemForm';

export function ReportProblemPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-3xl mx-auto flex flex-col h-full">
      <h1 className="text-2xl md:text-[32px] font-display font-bold text-[#1D2B64] mb-2">Report a Problem</h1>
      <p className="text-sm text-[#1D2B64]/60 mb-8">We'll look into it right away. Please provide as much detail as possible.</p>
      
      <div className="bg-white border border-[#1D2B64]/10 rounded-2xl p-6 md:p-8 shadow-sm">
        {submitted ? (
          <div className="text-center py-12 px-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#E6F2F8] text-[#3B6CE7] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1D2B64] mb-3 uppercase tracking-widest text-sm">Report Received</h3>
            <p className="text-[15px] text-[#1D2B64]/80 mb-8 max-w-sm">
              Thanks for letting us know. Your report has been submitted to the VEYTRIX team.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-[#FAFAFC] border border-[#1D2B64]/10 hover:bg-[#E6F2F8] text-[#1D2B64] font-medium rounded-lg transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <ReportProblemForm onSuccess={() => setSubmitted(true)} />
        )}
      </div>
    </div>
  );
}
