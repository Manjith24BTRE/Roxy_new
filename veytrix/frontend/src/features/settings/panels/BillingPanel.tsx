import React, { useState } from 'react';
import { CreditCard, Plus, Calendar, FileText, RotateCcw } from 'lucide-react';

export function BillingPanel() {
  const [credits, setCredits] = useState(240);

  const handleBuyCredits = () => {
    setCredits(prev => prev + 100);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-200">
      <div>
        <h2 className="text-lg font-display font-bold text-[#1D2B64]">Billing & Plan Subscriptions</h2>
        <p className="text-xs text-[#1D2B64]/50 font-medium">Manage your credits, billing methods, and download invoices.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Current plan card */}
        <div className="p-4 bg-gradient-to-br from-[#1D2B64] to-[#3B6CE7] text-white rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/60">Subscription Plan</span>
            <span className="text-base font-display font-bold">Veytrix Creator Plus</span>
            <span className="text-[10px] text-white/70">Renews on September 5, 2026</span>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-white/20 text-[10px] font-bold backdrop-blur-md">Active</span>
        </div>

        {/* Credit balance */}
        <div className="p-4 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-2xl flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#1D2B64]/50 uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={12} /> Credit Balance</span>
            <span className="text-lg font-display font-bold text-[#1D2B64]">{credits} Credits</span>
          </div>
          <button
            type="button"
            onClick={handleBuyCredits}
            className="flex items-center gap-1 bg-[#1D2B64] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-[#3B6CE7] transition cursor-pointer"
          >
            <Plus size={10} /> Buy Credits
          </button>
        </div>

        {/* Invoices */}
        <div className="flex flex-col gap-2 mt-2">
          <h4 className="text-xs font-bold text-[#1D2B64] border-b border-[#1D2B64]/5 pb-1 flex items-center gap-1.5 font-bold"><FileText size={12} /> Billing History & Invoices</h4>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#3B6CE7]" />
                <div className="flex flex-col">
                  <span>August Invoice #0482</span>
                  <span className="text-[9px] text-[#1D2B64]/40">Paid via Card ending in 4242</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1D2B64]">$19.00</span>
                <button type="button" className="text-[10px] text-[#3B6CE7] font-bold hover:underline cursor-pointer">Download</button>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#FAFAFC] border border-[#1D2B64]/5 rounded-xl text-xs text-[#1D2B64] font-medium">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#3B6CE7]" />
                <div className="flex flex-col">
                  <span>July Invoice #0391</span>
                  <span className="text-[9px] text-[#1D2B64]/40">Paid via Card ending in 4242</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1D2B64]">$19.00</span>
                <button type="button" className="text-[10px] text-[#3B6CE7] font-bold hover:underline cursor-pointer">Download</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BillingPanel;
