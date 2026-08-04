import React from 'react';
import { 
  CheckCircle2, 
  ShieldAlert, 
  FileWarning, 
  Sparkles, 
  Copyright, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';
import { TERMS_CONTENT } from './LegalContent';

// Map sections to icons for a premium look
const sectionIcons = [
  <CheckCircle2 size={16} className="text-[#3B6CE7]" />,
  <ShieldAlert size={16} className="text-[#3B6CE7]" />,
  <FileWarning size={16} className="text-[#3B6CE7]" />,
  <Sparkles size={16} className="text-[#3B6CE7]" />,
  <Copyright size={16} className="text-[#3B6CE7]" />,
  <AlertTriangle size={16} className="text-[#3B6CE7]" />,
  <Activity size={16} className="text-[#3B6CE7]" />
];

export function TermsOfServiceModal() {
  return (
    <div className="flex flex-col gap-4 py-4 pr-1">
      {TERMS_CONTENT.map((section, idx) => (
        <div 
          key={section.id}
          className="p-4 bg-[#E6F2F8]/30 border border-[#1D2B64]/5 rounded-2xl flex flex-col gap-2 transition hover:bg-[#E6F2F8]/50"
        >
          <div className="flex items-center gap-2 border-b border-[#1D2B64]/5 pb-1.5">
            {sectionIcons[idx]}
            <h3 className="font-display font-bold text-xs text-[#1D2B64] tracking-tight">{section.title}</h3>
          </div>
          
          {section.content && (
            <p className="text-[11px] text-[#1D2B64]/70 leading-relaxed font-medium">{section.content}</p>
          )}

          {section.bullets && (
            <ul className="list-disc pl-4 flex flex-col gap-1 text-[11px] text-[#1D2B64]/70 leading-relaxed font-medium">
              {section.bullets.map((bullet, bulletIdx) => (
                <li key={bulletIdx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
