import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CornerDownLeft } from 'lucide-react';
import { GlassCard } from '../../../../components/landing/GlassCard';
import { CommandInput } from './CommandInput';
import { ExecuteButton } from './ExecuteButton';
import { SuggestionChips } from './SuggestionChips';

export function AICommandConsole() {
  const [command, setCommand] = useState("Create a smooth cinematic intro using the b-roll from folder A...");
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleChipClick = (txt: string) => {
    setIsTyping(true);
    setCommand("");
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    let i = 0;
    typingIntervalRef.current = window.setInterval(() => {
      const charToAppend = txt.charAt(i);
      const isFirstChar = i === 0;

      setCommand((prev) => {
        const base = isFirstChar ? "" : prev;
        return base + charToAppend;
      });
      
      i++;
      if (i >= txt.length) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
      }
    }, 30);
  };

  const handleExecute = () => {
    console.log("Executing command:", command);
  };

  return (
    <div className="w-full max-w-2xl mt-8">
      <GlassCard className="border-[#3B6CE7]/10 p-6 md:p-8 shadow-[0_20px_50px_rgba(59,108,231,0.06)] relative group">
        {/* Top Prompt Info bar */}
        <div className="flex items-center gap-2 text-[#3B6CE7] font-mono text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-[#1D2B64]/5 pb-4 select-none">
          <Sparkles size={13} className="animate-pulse" />
          <span>AI Command Console</span>
        </div>

        {/* Command Input Area */}
        <CommandInput 
          command={command} 
          onChange={setCommand} 
          disabled={isTyping} 
        />

        {/* Action Bar */}
        <div className="flex justify-between items-center border-t border-[#1D2B64]/5 pt-4 select-none">
          <div className="flex gap-1 text-[10px] text-[#1D2B64]/40 font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-[#1D2B64]/10 bg-[#E6F2F8]/30 font-bold flex items-center gap-0.5">
              Enter <CornerDownLeft size={8} />
            </kbd>
          </div>
          <ExecuteButton disabled={isTyping} onClick={handleExecute} />
        </div>
      </GlassCard>

      {/* Suggestion Chips */}
      <SuggestionChips onChipClick={handleChipClick} disabled={isTyping} />
    </div>
  );
}
export default AICommandConsole;
