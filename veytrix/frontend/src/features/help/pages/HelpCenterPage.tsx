import React from 'react';
import { Search, Book, PlayCircle, MessageSquare } from 'lucide-react';
import { helpTopics } from '../../../data/helpTopics';

export function HelpCenterPage() {
  const getIcon = (id: string) => {
    switch(id) {
      case 'getting-started': return <Book size={24} />;
      case 'troubleshooting': return <MessageSquare size={24} />;
      default: return <PlayCircle size={24} />;
    }
  };

  const popularTopics = helpTopics.filter(t => ['getting-started', 'troubleshooting', 'importing-media'].includes(t.id));

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-4xl mx-auto flex flex-col h-full">
      <div className="text-center max-w-2xl mx-auto mb-12 mt-4">
        <h1 className="text-3xl md:text-[40px] font-display font-bold text-[#1D2B64] mb-4">How can we help?</h1>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1D2B64]/40" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, or troubleshooting..." 
            className="pl-12 pr-4 py-4 bg-white border border-[#1D2B64]/10 rounded-2xl text-base w-full focus:outline-none focus:border-[#3B6CE7]/40 focus:ring-4 focus:ring-[#3B6CE7]/10 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popularTopics.map(topic => (
          <div key={topic.id} className="bg-white border border-[#1D2B64]/10 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="w-12 h-12 bg-[#E6F2F8] text-[#3B6CE7] rounded-xl flex items-center justify-center mb-4">
              {getIcon(topic.id)}
            </div>
            <h3 className="text-lg font-semibold text-[#1D2B64] mb-2">{topic.title}</h3>
            <p className="text-sm text-[#1D2B64]/60">{topic.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
