import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, User as UserIcon, X, Clock, 
  Loader2, GraduationCap, Inbox, Wallet, Trophy, MessageSquare 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    const name = path.substring(1).charAt(0).toUpperCase() + path.slice(2);
    return name.split('/')[0].replace(/-/g, ' ');
  };

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await api.get('/notifications');
      // Fix: Ensure we extract an array even if the API returns a metadata wrapper or single object
      const rawData = res.data?.data ?? res.data;
      setNotifications(Array.isArray(rawData) ? rawData : []);
    } catch (e: any) {
      setNotifications([]); // Fallback to empty array on error
      if (e.status !== 404) {
        console.warn("Notification ledger sync issue:", e.message);
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-as-read');
      setNotifications(prev => Array.isArray(prev) ? prev.map(n => ({ ...n, read_at: new Date().toISOString() })) : []);
    } catch (e) {
      console.error("Failed to update notification status.");
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Real-time Notification Listener (Via Echo Private Channel)
    if ((window as any).Echo && user) {
      const channel = (window as any).Echo.private(`App.Models.User.${user.id}`)
        .notification((notification: any) => {
          setNotifications(prev => {
            const current = Array.isArray(prev) ? prev : [];
            // Deduplicate incoming real-time notifications
            if (current.find(n => n.id === notification.id)) return current;
            return [notification, ...current];
          });
        });

      return () => {
        (window as any).Echo.leave(`App.Models.User.${user.id}`);
      };
    }
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

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

  const getNotificationIcon = (n: any) => {
    const title = (n.title || n.data?.title || '').toLowerCase();
    if (title.includes('payment') || title.includes('invoice') || title.includes('fee')) return { icon: Wallet, color: 'text-emerald-500' };
    if (title.includes('assignment') || title.includes('exam')) return { icon: Clock, color: 'text-blue-500' };
    if (title.includes('result') || title.includes('grade')) return { icon: Trophy, color: 'text-orange-500' };
    if (title.includes('message') || title.includes('chat')) return { icon: MessageSquare, color: 'text-indigo-500' };
    return { icon: Bell, color: 'text-gray-400' };
  };

  // Fix: Safeguard unreadCount calculation against non-array notifications state
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read_at).length : 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 glass-effect border-b border-gray-200/50">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 text-gray-600 hover:bg-white rounded-lg lg:hidden"><Menu size={24} /></button>
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
            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
            className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-600 hover:bg-white'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-secondary text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-4 w-80 md:w-96 card-premium glass-effect shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-800">Alert Center</span>
                  {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-brand-primary text-white text-[8px] font-black rounded-md">{unreadCount} New</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={markAllAsRead} className="text-[9px] font-black text-brand-primary uppercase hover:underline">Mark all read</button>
                  <button onClick={() => setShowNotifications(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"><X size={14}/></button>
                </div>
              </div>
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {isLoadingNotifications ? (
                  <div className="p-12 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-brand-primary" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Querying Cloud Alerts...</p>
                  </div>
                ) : (Array.isArray(notifications) && notifications.length > 0) ? (
                  notifications.map(n => {
                    const { icon: Icon, color } = getNotificationIcon(n);
                    const isUnread = !n.read_at;
                    return (
                      <div key={n.id} className={`p-4 hover:bg-gray-50/80 transition-colors flex gap-4 border-b border-gray-50 last:border-0 relative ${isUnread ? 'bg-blue-50/20' : ''}`}>
                        {isUnread && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-primary rounded-r-full"></div>}
                        <div className={`w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 ${color}`}><Icon size={20}/></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{n.title || n.data?.title || 'System Update'}</p>
                          <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-0.5">{n.message || n.body || n.data?.message || 'New institutional update received.'}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"><Clock size={10} /> {n.created_at_human || n.time || 'Just now'}</p>
                            {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-200"><Inbox size={32} strokeWidth={1} /></div>
                    <p className="text-sm font-bold text-gray-400">All caught up!</p>
                    <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest mt-1">No new notifications</p>
                  </div>
                )}
              </div>
              <button className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-t border-gray-50 hover:bg-gray-50 hover:text-brand-primary transition-all">View All Activity Logs</button>
            </div>
          )}
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 p-1.5 md:px-3 text-gray-600 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
            <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white"><UserIcon size={18} /></div>
            <span className="hidden md:block text-sm font-bold">Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;