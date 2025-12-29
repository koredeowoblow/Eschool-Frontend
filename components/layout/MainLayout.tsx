import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-light-noise overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className={`transition-all duration-300 ease-in-out lg:ml-64 ${isSidebarOpen ? 'translate-x-64 lg:translate-x-0' : 'translate-x-0'}`}>
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto min-h-[70vh]">
            <Suspense fallback={
              <div className="w-full space-y-6 animate-pulse">
                <div className="h-40 bg-gray-200/50 rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-32 bg-gray-200/50 rounded-2xl"></div>
                  <div className="h-32 bg-gray-200/50 rounded-2xl"></div>
                  <div className="h-32 bg-gray-200/50 rounded-2xl"></div>
                </div>
              </div>
            }>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
              </div>
            </Suspense>
          </div>
        </main>

        <footer className="p-8 mt-12 border-t border-gray-100/50 text-center">
           <div className="flex flex-col items-center gap-2">
             <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs grayscale mb-2 opacity-50">eS</div>
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
               &copy; 2024 eSchool Premium ERP &bull; Production Stable v2.5.0
             </p>
           </div>
        </footer>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;