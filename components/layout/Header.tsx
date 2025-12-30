
import React, { useState } from 'react';
import { Menu, Search, Bell, User as UserIcon, X, Clock, CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    const name = path.substring(1).charAt(0).toUpperCase() + path.slice(2);
    return name.split('/')[0];
  };

  const notifications = [
    { id: 1, title: 'New Assignment', text: 'Math 101 quiz posted.', time: '2m ago', icon: Clock, color: 'text-blue-500' },
    { id: 2, title: 'Payment Received', text: 'Invoice #882 paid.', time: '1h ago', icon: CheckCircle2, color: 'text-green-500' },
  ];

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
            className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-white'}`}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-secondary rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-4 w-80 card-premium glass-effect shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 ${n.color}`}>
                      <n.icon size={16}/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 font-medium">{n.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-gray-100 transition-colors">View All Alerts</button>
            </div>
          )}

          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1.5 md:px-3 text-gray-600 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
              <UserIcon size={18} />
            </div>
            <span className="hidden md:block text-sm font-bold">Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
