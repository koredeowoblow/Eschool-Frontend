
import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, Filter, CheckCircle2, UserCheck, Search, Users, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';
import { useSelectOptions } from '../hooks/useSelectOptions';

const Promotions: React.FC = () => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic Options from API
  const { options: classOptions, isLoading: isLoadingClasses } = useSelectOptions('/classes');

  const [promotionConfig, setPromotionConfig] = useState({
    source_class: '',
    target_class: ''
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
      console.error("Failed to load eligible students", err);
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

  const toggleSelect = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePromote = async () => {
    if (selectedStudents.length === 0 || !promotionConfig.target_class) return;
    try {
      await api.post('/promotions', {
        student_ids: selectedStudents,
        target_class_id: promotionConfig.target_class
      });
      alert(`Successfully promoted ${selectedStudents.length} students!`);
      setSelectedStudents([]);
      fetchEligibleStudents(promotionConfig.source_class);
    } catch (err) {
      console.error("Promotion failed", err);
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
          <p className="text-sm text-gray-500 font-medium tracking-tight">Advance students to the next academic level based on criteria</p>
        </div>
        <button 
          onClick={handlePromote}
          className="flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-primary/20 hover:bg-blue-700 transition-all disabled:opacity-50" 
          disabled={selectedStudents.length === 0 || !promotionConfig.target_class}
        >
          <UserCheck size={18} />
          Promote Selected ({selectedStudents.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card-premium p-6 bg-blue-50/30 border-blue-100 border">
          <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.15em] mb-4 block">Current Level (Source)</label>
          <div className="relative">
            <select 
              value={promotionConfig.source_class}
              onChange={(e) => setPromotionConfig({...promotionConfig, source_class: e.target.value})}
              className="w-full bg-white border border-gray-100 rounded-xl py-3.5 px-4 font-bold text-gray-700 outline-none focus:ring-4 ring-brand-primary/5 transition-all appearance-none"
            >
              <option value="">Select Source Class</option>
              {classOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {isLoadingClasses && <Loader2 className="absolute right-4 top-3.5 animate-spin text-brand-primary" size={20} />}
          </div>
        </div>
        
        <div className="card-premium p-6 bg-orange-50/30 border-orange-100 border">
          <label className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.15em] mb-4 block">Target Level (Destination)</label>
          <div className="relative">
            <select 
              value={promotionConfig.target_class}
              onChange={(e) => setPromotionConfig({...promotionConfig, target_class: e.target.value})}
              className="w-full bg-white border border-gray-100 rounded-xl py-3.5 px-4 font-bold text-gray-700 outline-none focus:ring-4 ring-brand-secondary/5 transition-all appearance-none"
            >
              <option value="">Select Destination Class</option>
              {classOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {isLoadingClasses && <Loader2 className="absolute right-4 top-3.5 animate-spin text-brand-secondary" size={20} />}
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
           <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Filter roster..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs font-medium outline-none" />
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
            Total Eligible: {students.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Evaluating Performance...</p>
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
                  <th className="px-6 py-4 text-center">AI Recommendation</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr key={s.id} className={`transition-colors ${selectedStudents.includes(s.id) ? 'bg-blue-50/30' : 'hover:bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 rounded-md border-gray-300 text-brand-primary focus:ring-brand-primary/20" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-800">{s.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-sm text-gray-600">{s.avg_score || '0'}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.recommendation === 'Promote' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.recommendation || 'Evaluation Required'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-brand-primary hover:underline">View History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
               <Inbox size={48} strokeWidth={1} />
               <p className="font-bold">
                 {promotionConfig.source_class 
                   ? "No students currently match the promotion criteria for this class." 
                   : "Select a source class to view eligible students."}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Promotions;
