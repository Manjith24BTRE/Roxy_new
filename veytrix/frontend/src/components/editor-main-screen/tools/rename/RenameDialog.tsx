import React, { useState, useEffect, useRef } from 'react';
import { Edit3, X, Check } from 'lucide-react';
import { RenameDialogProps } from './rename.types';
import { validateClipName } from './validation';

export function RenameDialog({
  isOpen,
  currentName,
  onRename,
  onCancel,
}: RenameDialogProps) {
  const [name, setName] = useState<string>(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validation = validateClipName(name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.isValid) {
      onRename(validation.sanitizedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Rename Clip</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Clip Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new clip name..."
              className={`w-full px-3 py-2 text-xs rounded-md bg-surface border transition-colors focus:outline-none ${
                !validation.isValid && name.trim().length === 0
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-border focus:border-primary'
              } text-foreground placeholder:text-muted-foreground`}
            />
            {!validation.isValid && validation.error && (
              <p className="text-[11px] text-red-400 font-medium">
                {validation.error}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validation.isValid}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                validation.isValid
                  ? 'bg-primary text-primary-foreground hover:bg-sky-400 shadow-sm'
                  : 'bg-primary/30 text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameDialog;
