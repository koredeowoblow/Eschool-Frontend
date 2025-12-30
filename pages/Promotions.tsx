import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, Filter, CheckCircle2, UserCheck, Search, Users, Loader2, Inbox, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useNotification } from '../context/NotificationContext';

const Promotions: React.FC = () => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Fixed: Correctly destructure showNotification from useNotification hook
  const { showNotification } = useNotification();
  
  const { options: classOptions } = useSelectOptions('/classes');
  const { options: sessionOptions } = useSelectOptions('/school-sessions');
  const { options: sectionOptions } = useSelectOptions('/sections');

  const [promotionConfig, setPromotionConfig] = useState({
    source_class: '',
    to_class_id: '',
    to_session_id: '',
    to_section_id: '',
    type: 'promote' as 'promote' | 'repeat'
  });

  const fetchEligibleStudents = async (classId: string) => {
    if (!classId) return;
    setIsLoading(true);
    try {
      const res = await api.get('/students/eligible-for-promotion', {
        params: { class_id: classId }
      });
      setStudents(res.data.data || res.data || []);
    } catch (err) {
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (promotionConfig.source_class) {
      fetchEligibleStudents(promotionConfig.source_class);
    }
  }, [promotionConfig.source_class]);

  const handlePromote = async () => {
    if (selectedStudents.length === 0 || !promotionConfig.to_class_id) return;
    try {
      // Specialized Workflow Payload mapping
      await api.post('/promotions', {
        student_ids: selectedStudents,
        to_class_id: promotionConfig.to_class_id,
        to_session_id: promotionConfig.to_session_id,
        to_section_id: promotionConfig.to_section_id,
        type: promotionConfig.type
      });
      showNotification(`Successfully ${promotionConfig.type}d ${selectedStudents.length} students.`, 'success');
      setSelectedStudents([]);
      fetchEligibleStudents(promotionConfig.source_class);
    } catch (err: any) {
      showNotification(err.message || "Bulk operation failed.", 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ArrowUpCircle className="text-brand-primary" />
            Class Promotions
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Institutional cohort advancement matrix</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={promotionConfig.type} 
            onChange={e => setPromotionConfig({...promotionConfig, type: e.target.value as any})}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 outline-none"
          >
            <option value="promote">Standard Promotion</option>
            <option value="repeat">Academic Repeat</option>
          </select>
          <button 
            onClick={handlePromote}
            className="flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50" 
            disabled={selectedStudents.length === 0 || !promotionConfig.to_class_id}
          >
            <UserCheck size={18} />
            Commit ({selectedStudents.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium p-4 space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Source Class</label>
          <select value={promotionConfig.source_class} onChange={e => setPromotionConfig({...promotionConfig, source_class: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold">
            <option value="">Select Level</option>
            {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="card-premium p-4 space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
          <select value={promotionConfig.to_class_id} onChange={e => setPromotionConfig({...promotionConfig, to_class_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold">
            <option value="">Select Target</option>
            {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="card-premium p-4 space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">New Session</label>
          <select value={promotionConfig.to_session_id} onChange={e => setPromotionConfig({...promotionConfig, to_session_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold">
            <option value="">Select Session</option>
            {sessionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="card-premium p-4 space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">New Section</label>
          <select value={promotionConfig.to_section_id} onChange={e => setPromotionConfig({...promotionConfig, to_section_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold">
            <option value="">Select Section</option>
            {sectionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evaluating Eligibility...</p>
            </div>
          ) : students.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      onChange={(e) => setSelectedStudents(e.target.checked ? students.map(s => s.id) : [])}
                      className="w-4 h-4 rounded-md border-gray-300 text-brand-primary"
                    />
                  </th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Current Avg</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr key={s.id} className={`transition-colors ${selectedStudents.includes(s.id) ? 'bg-blue-50/30' : 'hover:bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                        className="w-4 h-4 rounded-md border-gray-300 text-brand-primary" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-800">{s.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-sm text-gray-600">{s.avg_score || '0'}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.avg_score >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.avg_score >= 50 ? 'Pass' : 'Probation'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
               <Inbox size={48} strokeWidth={1} />
               <p className="font-bold">No candidate students found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Promotions;