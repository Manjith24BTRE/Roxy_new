import React, { useState, useEffect } from 'react';
import { Clock, Film, Play, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectDB } from '../editor-main-screen/tools/project-save/ProjectDB';
import { ProjectSavePayload } from '../editor-main-screen/tools/project-save/projectSave.types';

export function RecentProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSavePayload[]>([]);

  useEffect(() => {
    let isMounted = true;
    ProjectDB.getAllProjects().then((list: ProjectSavePayload[]) => {
      if (isMounted) {
        setProjects(list.slice(0, 3));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-[20px] border border-[#1D2B64]/[0.08] shadow-[0_6px_24px_rgba(29,43,100,0.05)] p-4 md:p-6 mb-4">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#1D2B64]/50" />
          <h3 className="font-display text-base font-bold text-[#1D2B64]">Recent Projects</h3>
        </div>
        {projects.length > 0 && (
          <Link to="/projects" className="text-xs font-semibold text-[#3B6CE7] hover:underline flex items-center gap-1">
            <span>View all</span>
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="space-y-2.5 flex-1">
          {projects.map((p) => {
            const videoCount = p.timelineClips?.filter((c: any) => c.asset_type === 'VIDEO' || c.type === 'VIDEO' || !c.asset_type)?.length || 0;
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/editor?project=${encodeURIComponent(p.id)}`)}
                className="group flex items-center justify-between p-3 rounded-xl bg-[#FAFAFC] hover:bg-[#F4F8FA] border border-[#1D2B64]/5 hover:border-[#3B6CE7]/30 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-[#E6F2F8] text-[#3B6CE7] flex-shrink-0">
                    <Film size={16} />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-[#1D2B64] group-hover:text-[#3B6CE7] transition-colors truncate">
                      {p.name || 'Untitled Project'}
                    </h4>
                    <p className="text-[10px] text-[#1D2B64]/50 font-medium">
                      {videoCount} Clip(s) · Updated {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#3B6CE7] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Play size={12} fill="currentColor" /> Open
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-[#1D2B64]/10 bg-[#FAFAFC] py-6 min-h-[100px]">
          <span className="text-sm font-semibold text-[#1D2B64]/70 mb-1">No projects yet</span>
          <span className="text-xs text-[#1D2B64]/50">Your projects will appear here once saved.</span>
        </div>
      )}
    </div>
  );
}
