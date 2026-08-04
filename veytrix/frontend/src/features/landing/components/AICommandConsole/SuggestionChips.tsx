import React from 'react';

interface SuggestionChipsProps {
  onChipClick: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onChipClick, disabled }: SuggestionChipsProps) {
  const chips = [
    "Auto Cut Clips",
    "Smart Color Match",
    "Audio Cleanup",
    "B-Roll Generator",
    "Voiceover Captions",
    "Transitions Match"
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-2 justify-center">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={() => onChipClick(c)}
          disabled={disabled}
          className="bg-white border border-[#1D2B64]/5 text-[#1D2B64]/70 px-3.5 py-2 rounded-full text-xs shadow-sm hover:border-[#3B6CE7]/20 hover:text-[#3B6CE7] hover:-translate-y-0.5 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
