import React, { useState, useMemo } from 'react';
import { ModalHeader } from '../ModalHeader';
import { Search } from 'lucide-react';
import { helpTopics } from '../../../../data/helpTopics';

interface Props {
  onClose: () => void;
}

export default function HelpCenterContent({ onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return helpTopics;
    const lowerQuery = searchQuery.toLowerCase();
    return helpTopics.filter(topic => 
      topic.title.toLowerCase().includes(lowerQuery) || 
      topic.description.toLowerCase().includes(lowerQuery) ||
      topic.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery]);

  const activeTopic = useMemo(() => helpTopics.find(t => t.id === selectedTopic), [selectedTopic]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ModalHeader 
        title={activeTopic ? activeTopic.title : "Help Center"} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTopic ? (
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedTopic(null)}
              className="text-sm font-medium text-[#3B6CE7] hover:underline"
            >
              ← Back to Help Center
            </button>
            <div className="text-[15px] leading-relaxed text-[#1D2B64]/90 space-y-4">
              {activeTopic.content}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1D2B64]/40" />
              <input 
                type="text" 
                placeholder="Search help topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 rounded-xl pl-12 pr-4 py-3 text-[15px] text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7] transition-colors"
              />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8] mb-4">
                {searchQuery ? "Search Results" : "Popular Topics"}
              </h3>
              
              {filteredTopics.length > 0 ? (
                <div className="grid gap-3">
                  {filteredTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="text-left w-full p-4 bg-white border border-[#1D2B64]/10 rounded-xl hover:border-[#3B6CE7]/40 hover:bg-[#FAFAFC] transition-colors"
                    >
                      <h4 className="font-semibold text-[#1D2B64] mb-1">{topic.title}</h4>
                      <p className="text-sm text-[#1D2B64]/60">{topic.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#1D2B64]/60 text-center py-8">
                  No topics found for "{searchQuery}".
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
