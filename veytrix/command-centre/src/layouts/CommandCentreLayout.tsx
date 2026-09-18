import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Outlet } from 'react-router-dom';
import { ControlCentreAuthProvider } from '../context/ControlCentreAuthContext';

export const CommandCentreLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ControlCentreAuthProvider>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-[#0A102A]/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ControlCentreAuthProvider>
  );
};
