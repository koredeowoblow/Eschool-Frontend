
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, User as UserIcon, X, Clock, CheckCircle2, Loader2, GraduationCap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    const name = path.substring(1).charAt(0).toUpperCase() + path.slice(2);
    return name.split('/')[0].replace(/-/g, ' ');
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await api.get('/students', { params: { search: searchQuery, per_page: 5 } });
          setSearchResults(res.data.data || []);
        } catch (e) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight capitalize">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div ref={searchRef} className="hidden md:block relative">
          <div className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-full border border-transparent focus-within:border-brand-primary transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Jump to student record..." 
              className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 font-medium"
            />
            {isSearching && <Loader2 size={14} className="animate-spin text-brand-primary" />}
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => { navigate(`/students/${s.id}`); setSearchResults([]); setSearchQuery(''); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center"><GraduationCap size={16}/></div>
                  <div><p className="text-xs font-bold text-gray-800">{s.full_name}</p><p className="text-[10px] text-gray-400 uppercase font-black">{s.admission_number}</p></div>
                </button>
              ))}
            </div>
          )}
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
