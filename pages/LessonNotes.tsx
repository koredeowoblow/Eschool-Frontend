import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, XCircle, Clock, Download, MoreVertical, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const LessonNotes: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/lesson-notes');
        setNotes(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load lesson notes", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lesson Notes</h2>
          <p className="text-sm text-gray-500 font-medium">Curriculum planning and administrative approval</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Submit New Note
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="card-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-transparent hover:border-brand-primary/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-brand-primary transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{note.subject_name || note.subject?.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">
                    <span>{note.teacher_name || note.user?.name}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Week {note.week_number}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                    note.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                    note.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {note.status === 'Approved' ? <CheckCircle size={12}/> : note.status === 'Pending' ? <Clock size={12}/> : <XCircle size={12}/>}
                    {note.status || 'Pending'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">Uploaded {note.created_at}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"><Download size={18} /></button>
                  <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No lesson notes submitted yet.</p>
        </div>
      )}
    </div>
  );
};

export default LessonNotes;