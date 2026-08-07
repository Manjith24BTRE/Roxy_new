import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string | string[];
}

interface HelpAccordionProps {
  items: AccordionItem[];
}

export function HelpAccordion({ items }: HelpAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border border-[#1D2B64]/10 rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-200"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-[#1D2B64] hover:bg-slate-50 transition-colors"
            >
              <span>{item.question}</span>
              {isOpen ? (
                <ChevronUp size={16} className="text-[#3B6CE7]" />
              ) : (
                <ChevronDown size={16} className="text-[#1D2B64]/40" />
              )}
            </button>
            {isOpen && (
              <div className="px-6 pb-4 pt-2 border-t border-[#1D2B64]/5 text-sm text-[#1D2B64]/70 leading-relaxed">
                {Array.isArray(item.answer) ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {item.answer.map((ans, aIdx) => (
                      <li key={aIdx}>{ans}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{item.answer}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HelpAccordion;
