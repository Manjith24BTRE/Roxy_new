import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface ShortcutItem {
  id: number;
  keys: string;
  action: string;
  category: string;
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  { id: 1, keys: 'Space', action: 'Play / Pause timeline playback', category: 'Playback' },
  { id: 2, keys: 'S', action: 'Split active clip at playhead', category: 'Editing' },
  { id: 3, keys: 'R', action: 'Enable rate stretch/speed tool', category: 'Editing' },
  { id: 4, keys: 'T', action: 'Add textual subtitle element', category: 'Overlay' },
  { id: 5, keys: 'M', action: 'Add timeline track marker marker', category: 'Navigation' },
  { id: 6, keys: 'Ctrl + C', action: 'Copy active timeline clip/layer', category: 'General' },
  { id: 7, keys: 'Ctrl + V', action: 'Paste clip at playhead position', category: 'General' },
  { id: 8, keys: 'Ctrl + Z', action: 'Undo last timeline transaction', category: 'History' },
  { id: 9, keys: 'Ctrl + Shift + Z', action: 'Redo undone timeline transaction', category: 'History' },
  { id: 10, keys: 'Delete', action: 'Remove active clip from timeline', category: 'Editing' }
];

export function KeyboardShortcutsPanel() {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(DEFAULT_SHORTCUTS);
  const [search, setSearch] = useState('');

  const filteredShortcuts = shortcuts.filter(s => 
    s.action.toLowerCase().includes(search.toLowerCase()) || 
    s.keys.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleReset = () => {
    setShortcuts(DEFAULT_SHORTCUTS);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Keyboard Shortcuts Map</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">View, search, and map key-combinations to control the VEYTRIX editor timeline.</p>
      </div>

      <div className="flex flex-col gap-4 h-full">
        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3.5 text-[#1D2B64]/40" />
          <input
            type="text"
            placeholder="Search shortcuts (e.g., Play, Split, Ctrl)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
          />
        </div>

        {/* Shortcuts Table */}
        <div className="border border-[#1D2B64]/5 rounded-2xl overflow-hidden bg-[#FAFAFC]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1D2B64]/5 border-b border-[#1D2B64]/5 font-mono text-[9px] text-[#1D2B64]/50 uppercase tracking-wider select-none">
                <th className="p-3 pl-4">Category</th>
                <th className="p-3">Action</th>
                <th className="p-3 pr-4 text-right">Key Combination</th>
              </tr>
            </thead>
            <tbody>
              {filteredShortcuts.map((s) => (
                <tr key={s.id} className="border-b border-[#1D2B64]/5 last:border-0 hover:bg-white transition font-medium">
                  <td className="p-3 pl-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F2F8]/50 text-[#1D2B64]/60 font-semibold text-[10px]">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-3 text-[#1D2B64]">{s.action}</td>
                  <td className="p-3 pr-4 text-right">
                    <kbd className="px-1.5 py-0.5 rounded border border-[#1D2B64]/10 bg-white font-mono text-[10px] text-[#1D2B64] font-bold shadow-sm">
                      {s.keys}
                    </kbd>
                  </td>
                </tr>
              ))}

              {filteredShortcuts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-[#1D2B64]/40 font-medium">
                    No shortcuts match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-[#1D2B64]/5 pt-4 mt-4 select-none">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1D2B64]/10 text-xs text-[#1D2B64]/60 hover:text-[#1D2B64] hover:bg-[#FAFAFC] transition cursor-pointer font-medium"
        >
          <RotateCcw size={12} /> Restore Defaults
        </button>
      </div>
    </div>
  );
}
export default KeyboardShortcutsPanel;
