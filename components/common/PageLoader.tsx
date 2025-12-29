import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-brand-primary rounded-lg shadow-lg shadow-brand-primary/30 flex items-center justify-center text-white font-black text-xs">eS</div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Establishing Secure Session</p>
          <p className="text-xs font-bold text-gray-500 italic">Optimizing assets...</p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;