import React, { useState } from 'react';
import { helpArticles } from '../../../data/helpArticles';
import { HelpSearch } from '../../../components/help/HelpSearch';
import { HelpCategoryCard } from '../../../components/help/HelpCategoryCard';

export function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = helpArticles.filter((art) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check title/subtitle
    if (art.title.toLowerCase().includes(query) || art.subtitle.toLowerCase().includes(query)) {
      return true;
    }
    
    // Check keywords mapping
    const extraKeywords: Record<string, string[]> = {
      'getting-started': ['create project', 'editor', 'timeline', 'AI command', 'export', 'basics', 'getting started'],
      'importing-media': ['upload', 'import', 'video', 'image', 'audio', 'timeline', 'upload failed'],
      'troubleshooting': ['login', 'export failed', 'editor not loading', 'video is not uploading', 'AI command', 'preview', 'troubleshoot']
    };
    
    const artKeywords = extraKeywords[art.id] || [];
    if (artKeywords.some(kw => kw.toLowerCase().includes(query) || query.includes(kw.toLowerCase()))) {
      return true;
    }

    // Check sections content
    if (art.sections?.some(sec => 
      sec.title.toLowerCase().includes(query) || 
      (typeof sec.content === 'string' && sec.content.toLowerCase().includes(query)) ||
      (Array.isArray(sec.content) && sec.content.some(item => item.toLowerCase().includes(query)))
    )) {
      return true;
    }

    // Check FAQs
    if (art.faqs?.some(faq => 
      faq.question.toLowerCase().includes(query) || 
      (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(query)) ||
      (Array.isArray(faq.answer) && faq.answer.some(ans => ans.toLowerCase().includes(query)))
    )) {
      return true;
    }

    return false;
  });

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-4xl mx-auto flex flex-col h-full">
      <div className="text-center max-w-2xl mx-auto mb-12 mt-4">
        <h1 className="text-3xl md:text-[40px] font-display font-bold text-[#1D2B64] mb-4">How can we help?</h1>
        <HelpSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <HelpCategoryCard 
              key={article.id}
              id={article.id}
              title={article.title}
              description={article.subtitle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-base text-[#1D2B64]/50">No matching help articles found.</p>
        </div>
      )}
    </div>
  );
}

export default HelpCenterPage;
