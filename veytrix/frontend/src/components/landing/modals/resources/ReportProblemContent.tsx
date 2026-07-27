import React, { useState } from 'react';
import { ModalHeader } from '../ModalHeader';
import ReportProblemForm from './ReportProblemForm';

interface Props {
  onClose: () => void;
}

export default function ReportProblemContent({ onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ModalHeader title="Report a Problem" onClose={onClose} />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
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
              onClick={onClose}
              className="px-6 py-2.5 bg-[#FAFAFC] border border-[#1D2B64]/10 hover:bg-[#E6F2F8] text-[#1D2B64] font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <ReportProblemForm onSuccess={() => setSubmitted(true)} />
        )}
        
      </div>
    </div>
  );
}
