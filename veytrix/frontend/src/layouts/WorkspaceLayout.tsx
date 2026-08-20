import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HomeSidebar } from '../components/homepage/sidebar/HomeSidebar';
import { HomeTopbar } from '../components/homepage/HomeTopbar';

export function WorkspaceLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#FAFAFC]">
      <HomeSidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
        <HomeTopbar onMobileMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
