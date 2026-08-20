import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, PlayCircle, MessageSquare } from 'lucide-react';

interface HelpCategoryCardProps {
  id: string;
  title: string;
  description: string;
}

export function HelpCategoryCard({ id, title, description }: HelpCategoryCardProps) {
  const navigate = useNavigate();

  const getIcon = (topicId: string) => {
    switch(topicId) {
      case 'getting-started': return <Book size={24} />;
      case 'troubleshooting': return <MessageSquare size={24} />;
      default: return <PlayCircle size={24} />;
    }
  };

  return (
    <div
      onClick={() => navigate(`/help/${id}`)}
      className="bg-white border border-[#1D2B64]/10 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform cursor-pointer text-left"
    >
      <div className="w-12 h-12 bg-[#E6F2F8] text-[#3B6CE7] rounded-xl flex items-center justify-center mb-4">
        {getIcon(id)}
      </div>
      <h3 className="text-lg font-semibold text-[#1D2B64] mb-2">{title}</h3>
      <p className="text-sm text-[#1D2B64]/60">{description}</p>
    </div>
  );
}

export default HelpCategoryCard;
