import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#1D2B64]/5 bg-white/80 hover:bg-[#3B6CE7] hover:text-white hover:border-[#3B6CE7]/20 hover:shadow-[0_2px_12px_rgba(59,108,231,0.15)] px-4 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none"
    >
      <ChevronLeft size={14} />
      <span>Back</span>
    </button>
  );
}
export default BackButton;
