import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, MoreVertical, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const AcademicSessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await api.get('/academic-sessions');
        const data = res.data.data || res.data || [];
        setSessions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.warn("Academic sessions endpoint 404/not available:", err.message);
        setError(true);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sessions & Terms</h2>
          <p className="text-sm text-gray-500 font-medium">Manage the school academic calendar</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg">
          <Plus size={18} /> New Session
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Reading Calendar...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className={`card-premium p-8 border ${session.is_current ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.is_current ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{session.name} Session</h3>
                    {session.is_current && <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Current Active</span>}
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><MoreVertical size={20}/></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {session.terms?.map((term: any) => (
                  <div key={term.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">{term.name} {term.is_current ? '(Active)' : ''}</span>
                    {term.is_current && <CheckCircle2 className="text-green-500" size={16}/>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
             <Calendar size={32} strokeWidth={1} />
           </div>
           <div className="space-y-1">
             <p className="font-bold text-gray-600">No active sessions found.</p>
             <p className="text-xs font-medium max-w-xs mx-auto">
               {error ? "The Academic Session endpoint is temporarily unavailable. Check back later." : "Click 'New Session' to begin scheduling for the new year."}
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSessions;