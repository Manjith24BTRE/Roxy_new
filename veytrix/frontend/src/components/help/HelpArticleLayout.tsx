import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { HelpArticle } from '../../data/helpArticles';
import { HelpAccordion } from './HelpAccordion';
import { VeytrixLogo } from '../VeytrixLogo';

interface HelpArticleLayoutProps {
  article: HelpArticle;
}

export function HelpArticleLayout({ article }: HelpArticleLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1000px] mx-auto py-8 px-6 md:px-8">
      {/* Help Center Header */}
      <div className="flex items-center justify-between border-b border-[#1D2B64]/5 pb-4 mb-8">
        <div className="flex items-center gap-2">
          <VeytrixLogo className="h-6 w-6 text-[#1D2B64]" />
          <span className="font-display text-lg font-bold tracking-tight text-[#1D2B64]">VEYTRIX</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#1D2B64]/40 font-mono">
          Help Center
        </span>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/help')}
        className="flex items-center gap-2 text-xs font-semibold text-[#1D2B64]/60 hover:text-[#1D2B64] transition bg-white border border-[#1D2B64]/10 px-4 py-2 rounded-full shadow-sm cursor-pointer mb-8"
      >
        <ArrowLeft size={14} />
        Back to Help Center
      </button>

      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-display font-bold text-[#1D2B64] mb-3">{article.title}</h1>
        <p className="text-base text-[#1D2B64]/65 leading-relaxed">{article.subtitle}</p>
      </div>

      {/* Sections (Getting Started / Importing Media) */}
      {article.sections && article.sections.length > 0 && (
        <div className="space-y-8 text-left">
          {article.sections.map((section, idx) => (
            <section key={idx} className="border-b border-[#1D2B64]/5 pb-6 last:border-none">
              <h2 className="text-lg font-bold text-[#1D2B64] mb-3">{section.title}</h2>
              {section.type === 'text' && typeof section.content === 'string' && (
                <p className="text-sm text-[#1D2B64]/75 leading-relaxed">{section.content}</p>
              )}
              {section.type === 'list' && Array.isArray(section.content) && (
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#1D2B64]/75 leading-relaxed">
                  {section.content.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              )}
              {section.type === 'ordered-list' && Array.isArray(section.content) && (
                <ol className="list-decimal pl-5 space-y-2 text-sm text-[#1D2B64]/75 leading-relaxed">
                  {section.content.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      )}

      {/* FAQs (Troubleshooting) */}
      {article.faqs && article.faqs.length > 0 && (
        <div className="space-y-8 text-left">
          <HelpAccordion items={article.faqs} />

          {/* Still Need Help CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-[#E6F2F8]/60 border border-[#3B6CE7]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-bold text-[#1D2B64] mb-1">Still need help?</h3>
              <p className="text-xs text-[#1D2B64]/60">Our support team is ready to help resolve any account or technical issues.</p>
            </div>
            <button
              onClick={() => navigate('/report-problem')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D2B64] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#3B6CE7] transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquare size={14} />
              Report a Problem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpArticleLayout;
