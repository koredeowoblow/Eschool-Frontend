
import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Loader2, Inbox, Save, Info } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';

const GradingScales: React.FC = () => {
  const [scales, setScales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    min_score: '',
    max_score: '',
    remark: ''
  });

  const fetchScales = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/settings/grading-scale'); // Matching provided routes
      const data = res.data.data || res.data || [];
      setScales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load grading parameters", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/settings/grading-scale', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        fetchScales();
        setFormData({ name: '', min_score: '', max_score: '', remark: '' });
      }
    }
  );

  useEffect(() => {
    fetchScales();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Academic Grading</h2>
          <p className="text-sm text-gray-500 font-medium">Standardizing marks across the institution</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> New Grade Definition
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Scales...</p>
          </div>
        ) : scales.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-4">Symbol</th>
                <th className="px-8 py-4">Range</th>
                <th className="px-8 py-4">Institutional Remark</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scales.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center font-black text-sm border border-blue-100 group-hover:scale-110 transition-transform">
                      {row.name || row.grade}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-gray-700">
                    {row.min_score} - {row.max_score}%
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-tighter bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {row.remark}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-gray-300 hover:text-red-500 p-2.5 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4">
             <Calculator size={32} />
             <p className="font-bold">Scale is undefined.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Evaluation Tier">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Grade Symbol</label>
            <input 
              required type="text" value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-black text-gray-800"
              placeholder="e.g. A+"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Score</label>
              <input 
                required type="number" value={formData.min_score}
                onChange={e => setFormData({...formData, min_score: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Score</label>
              <input 
                required type="number" value={formData.max_score}
                onChange={e => setFormData({...formData, max_score: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commentary</label>
            <input 
              required type="text" value={formData.remark}
              onChange={e => setFormData({...formData, remark: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800"
              placeholder="e.g. High Distinction"
            />
          </div>
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Initialize Tier</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default GradingScales;
