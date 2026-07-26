import React from 'react';
import { Paperclip, Send } from 'lucide-react';

export function ReportProblemPage() {
  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-3xl mx-auto flex flex-col h-full">
      <h1 className="text-2xl md:text-[32px] font-display font-bold text-[#1D2B64] mb-2">Report a Problem</h1>
      <p className="text-sm text-[#1D2B64]/60 mb-8">We'll look into it right away. Please provide as much detail as possible.</p>
      
      <div className="bg-white border border-[#1D2B64]/10 rounded-2xl p-6 md:p-8 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#1D2B64] mb-2">Category</label>
              <select className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] transition-colors">
                <option value="" disabled selected>Select issue type...</option>
                <option value="bug">Bug Report</option>
                <option value="editor">Editor Issue</option>
                <option value="export">Export Issue</option>
                <option value="account">Account Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#1D2B64] mb-2">Subject</label>
              <input 
                type="text" 
                placeholder="Brief summary of the issue"
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1D2B64] mb-2">Describe the problem</label>
            <textarea 
              rows={5}
              placeholder="What happened? What did you expect to happen?"
              className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] transition-colors resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1D2B64] mb-2">Screenshot / Attachment</label>
            <div className="border-2 border-dashed border-[#1D2B64]/20 rounded-xl p-8 flex flex-col items-center justify-center bg-[#FAFAFC] hover:bg-[#F8FBFD] transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1D2B64]/40 group-hover:text-[#3B6CE7] shadow-sm mb-3 transition-colors">
                <Paperclip size={18} />
              </div>
              <span className="text-sm font-medium text-[#1D2B64]/60 group-hover:text-[#1D2B64]">Click to attach files</span>
              <span className="text-xs text-[#1D2B64]/40 mt-1">PNG, JPG, MP4 up to 10MB</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1D2B64]/10 flex justify-end">
            <button type="button" className="flex items-center gap-2 bg-[#3B6CE7] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2555CC] transition-colors shadow-sm">
              <Send size={16} /> Submit Report
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
