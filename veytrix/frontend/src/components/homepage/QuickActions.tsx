import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Star, TrendingUp, ArrowRight } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      to: "/upload",
      icon: FolderOpen,
      title: "New Project",
      desc: "Import media & start editing",
      color: "text-[#3B6CE7]"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-[20px] border border-[#1D2B64]/[0.08] shadow-[0_6px_24px_rgba(29,43,100,0.05)] p-4 md:p-6 lg:p-8">
      <h3 className="font-display text-lg font-bold text-[#1D2B64] mb-6">Quick Actions</h3>
      
      <div className="flex flex-col gap-3 flex-1 justify-between">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="group flex items-center justify-between p-4 rounded-xl border border-[#1D2B64]/5 hover:bg-[#E6F2F8] hover:border-[#3B6CE7]/20 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-white border border-[#1D2B64]/10 shadow-sm flex items-center justify-center ${action.color}`}>
                <action.icon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1D2B64]">{action.title}</h4>
                <p className="text-[11px] md:text-xs text-[#1D2B64]/60">{action.desc}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-[#1D2B64]/40 transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#3B6CE7]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
