import React, { useState, useEffect } from 'react';
import { ListChecks, Plus, Book, Calendar, Settings, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      try {
        const [assessRes, templatesRes] = await Promise.all([
          api.get('/assessments'),
          api.get('/assessments/templates')
        ]);
        setAssessments(assessRes.data.data || assessRes.data || []);
        setTemplates(templatesRes.data.data || templatesRes.data || []);
      } catch (err) {
        console.error("Failed to load assessments", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Academic Assessments</h2>
          <p className="text-sm text-gray-500 font-medium">Configure exams, tests, and marking schemes</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="text-brand-primary" size={20} />
            Active Assessments
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" size={24} /></div>
            ) : assessments.length > 0 ? (
              assessments.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.title || item.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Weight: {item.weight}% &bull; Due: {item.due_date}</p>
                  </div>
                  <button className="text-brand-primary p-2 hover:bg-white rounded-lg transition-all"><Settings size={16}/></button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">No active assessments found.</div>
            )}
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Book className="text-brand-secondary" size={20} />
            Assessment Templates
          </h3>
          <p className="text-sm text-gray-500 mb-6">Standardized marking structures for different grade levels.</p>
          <div className="grid grid-cols-2 gap-3">
             {templates.length > 0 ? templates.map((t) => (
               <div key={t.id} className="p-4 border border-dashed border-gray-200 rounded-2xl text-center">
                 <p className="text-xs font-bold text-gray-400 uppercase">{t.name}</p>
                 <p className="text-[10px] text-gray-400 mt-1">{t.description}</p>
               </div>
             )) : (
               <div className="col-span-2 text-center py-4 text-xs font-bold text-gray-300 uppercase tracking-widest">No templates defined</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;