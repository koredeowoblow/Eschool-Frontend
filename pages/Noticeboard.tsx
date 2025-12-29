
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Bell, Calendar, Info, AlertTriangle, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Noticeboard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/noticeboard');
        setAnnouncements(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load noticeboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="text-brand-secondary" />
            School Noticeboard
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Official institutional updates and alerts</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg">
          <Plus size={18} /> Post Notice
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {announcements.map((note) => (
            <div key={note.id} className="card-premium p-8 relative overflow-hidden group border border-transparent hover:border-brand-primary/10 transition-all">
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 ${note.type === 'Urgent' ? 'text-red-500' : 'text-blue-500'}`}>
                {note.type === 'Urgent' ? <AlertTriangle size={128}/> : <Info size={128}/>}
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  note.type === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>{note.type}</span>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <Calendar size={12}/> {note.created_at}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-brand-primary transition-colors">{note.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">{note.content}</p>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-xs text-gray-400">{note.author_initials || 'S'}</div>
                   <span className="text-xs font-bold text-gray-400">{note.author_name}</span>
                 </div>
                 <button className="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline">Read Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No announcements posted on the noticeboard yet.</p>
        </div>
      )}
    </div>
  );
};

export default Noticeboard;
