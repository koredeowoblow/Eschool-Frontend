
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Plus, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load subjects", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Academic Subjects</h2>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-brand-primary/20 transition-all">
          <Plus size={18} />
          Create Subject
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className="card-premium p-6 group cursor-pointer hover:border-brand-primary/30 border border-transparent transition-all">
              <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{sub.name}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{sub.code}</p>
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Users size={16} className="text-brand-primary" />
                  {sub.teacher || 'No Head Assigned'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Clock size={16} className="text-brand-secondary" />
                  {sub.classes_count || 0} Active Classes
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No subjects defined in the curriculum yet.</p>
        </div>
      )}
    </div>
  );
};

export default Subjects;
