import React, { useRef } from 'react';
import { PromptRenderer } from './PromptRenderer';

interface CommandInputProps {
  command: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function CommandInput({ command, onChange, disabled }: CommandInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContainerClick = () => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className="relative text-left mb-10 min-h-[70px] cursor-text"
      data-testid="command-input-container"
    >
      {/* Invisible interactive textarea to capture all user input methods */}
      <textarea
        ref={textareaRef}
        value={command}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none focus:outline-none bg-transparent border-none p-0 text-lg md:text-xl font-display font-medium leading-relaxed caret-transparent select-text z-10"
        aria-label="AI Command Input"
        placeholder="Type a command..."
      />

      {/* Styled visual presentation layer */}
      <PromptRenderer command={command} />
    </div>
  );
}
