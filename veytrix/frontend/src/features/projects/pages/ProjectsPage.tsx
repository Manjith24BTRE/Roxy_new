import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, Plus, Film, Clock, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectDB } from '../../../components/editor-main-screen/tools/project-save/ProjectDB';
import { ProjectSavePayload } from '../../../components/editor-main-screen/tools/project-save/projectSave.types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSavePayload[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ProjectDB.getAllProjects().then((list: ProjectSavePayload[]) => {
      if (isMounted) {
        setProjects(list);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-[32px] font-display font-bold text-[#1D2B64]">Projects</h1>
          <p className="text-[#1D2B64]/60 text-sm mt-1">Manage all your saved video editing projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D2B64]/40" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-[#1D2B64]/10 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:border-[#3B6CE7]/40 focus:ring-1 focus:ring-[#3B6CE7]/40 transition-shadow"
            />
          </div>
          <Link to="/upload" className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2555CC] transition-colors shadow-sm whitespace-nowrap">
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <div className="h-6 w-6 rounded-full border-2 border-[#3B6CE7]/20 border-t-[#3B6CE7] animate-spin mb-2" />
          <span className="text-xs text-[#1D2B64]/50 font-semibold">Loading projects...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const videoCount = p.timelineClips?.filter((c: any) => c.asset_type === 'VIDEO' || c.type === 'VIDEO' || !c.asset_type)?.length || 0;
            const textCount = (p.textOverlays?.length || 0) + (p.captions?.length || 0);

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/editor?project=${encodeURIComponent(p.id)}`)}
                className="group relative bg-white border border-[#1D2B64]/10 hover:border-[#3B6CE7]/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-[#1D2B64]/5 relative bg-slate-900/[0.03]">
                    {p.thumbnailUrl ? (
                      <img 
                        src={p.thumbnailUrl} 
                        alt={p.name || 'Untitled Project'} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-[1.03] duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E6F2F8] text-[#3B6CE7]">
                        <Film size={28} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-[#1D2B64]/40 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={11} />
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#1D2B64] group-hover:text-[#3B6CE7] transition-colors truncate mb-1">
                    {p.name || 'Untitled Project'}
                  </h3>
                  <p className="text-xs text-[#1D2B64]/50 font-medium line-clamp-1 mb-4">
                    {videoCount} Video Clip(s) · {textCount} Text Overlay(s)
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1D2B64]/5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#3B6CE7] flex items-center gap-1 group-hover:underline">
                    <Play size={12} fill="currentColor" /> Open in Editor
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${p.syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                    {p.syncStatus === 'synced' ? 'Cloud Synced' : 'IndexedDB Local'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#1D2B64]/10 rounded-2xl bg-white/50 p-8 text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-[#E6F2F8] flex items-center justify-center text-[#3B6CE7] mb-4">
            <FolderOpen size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[#1D2B64] mb-2">No projects found</h3>
          <p className="text-[#1D2B64]/60 max-w-sm mb-6">
            {searchQuery ? `No projects match "${searchQuery}".` : 'Your saved editing projects will appear here once you create them.'}
          </p>
          <Link to="/upload" className="flex items-center gap-2 bg-white border border-[#1D2B64]/10 text-[#1D2B64] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F8FBFD] transition-colors shadow-sm">
            <Plus size={16} /> Create New Project
          </Link>
        </div>
      )}
    </div>
  );
}
