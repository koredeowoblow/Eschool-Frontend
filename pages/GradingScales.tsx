import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const GradingScales: React.FC = () => {
  const [scales, setScales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScales = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/grading-scales');
        setScales(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load grading scales", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScales();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Grading Scales</h2>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg">
          <Plus size={18} /> Add Grade
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
        ) : scales.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-4">Grade</th>
                <th className="px-8 py-4">Min Score</th>
                <th className="px-8 py-4">Max Score</th>
                <th className="px-8 py-4">Remark</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scales.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/20 transition-colors">
                  <td className="px-8 py-5"><span className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center font-black text-xs">{row.grade || row.name}</span></td>
                  <td className="px-8 py-5 font-bold text-gray-700">{row.min_score}</td>
                  <td className="px-8 py-5 font-bold text-gray-700">{row.max_score}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500 uppercase tracking-tighter">{row.remark}</td>
                  <td className="px-8 py-5 text-right"><button className="text-red-300 hover:text-red-500 p-2"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
             <Inbox size={48} strokeWidth={1} />
             <p className="font-bold">No grading scales defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingScales;