
import React from 'react';
import { Menu, Search, Bell, User as UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    const name = path.substring(1).charAt(0).toUpperCase() + path.slice(2);
    // Handle nested paths like students/1
    return name.split('/')[0];
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 glass-effect border-b border-gray-200/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 hover:bg-white rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-full border border-transparent focus-within:border-brand-primary transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm w-48 lg:w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 text-gray-600 hover:bg-white rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-secondary rounded-full ring-2 ring-white"></span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1.5 md:px-3 text-gray-600 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
              <UserIcon size={18} />
            </div>
            <span className="hidden md:block text-sm font-semibold">Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
