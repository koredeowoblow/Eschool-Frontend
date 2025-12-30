
import React, { useState, useEffect } from 'react';
import { Wallet, Plus, DollarSign, Loader2, Inbox, Save, Target } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';

const FeeStructures: React.FC = () => {
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeeTypes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/fee-types'); // Using GET api/v1/fee-types
      setFeeTypes(res.data.data || res.data || []);
    } catch (err) {
      console.warn("Fee types fetch failed", err);
      setFeeTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ name: '', description: '' });
  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/fee-types', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
        fetchFeeTypes();
      }
    }
  );

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee Classifications</h2>
          <p className="text-sm text-gray-500 font-medium">Managing institutional revenue categories</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Add Fee Type
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving Tariffs...</p>
        </div>
      ) : feeTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feeTypes.map((fee) => (
            <div key={fee.id} className="card-premium p-6 border-l-4 border-brand-primary group hover:bg-blue-50/20 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <h4 className="font-bold text-gray-800">{fee.name}</h4>
              </div>
              <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6">{fee.description || 'General fee classification for institutional billing.'}</p>
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Usage: {fee.usage_count || 0} Invoices</span>
                 <button className="text-xs font-bold text-brand-primary hover:underline">Configure Rates</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
           <Wallet size={32} strokeWidth={1} />
           <p className="font-bold">No fee categories established.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Fee Type">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee Label</label>
            <input 
              required type="text" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              placeholder="e.g. Tuition Fee"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contextual Description</label>
            <textarea 
              rows={3} value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium text-sm text-gray-800"
              placeholder="Optional notes regarding this fee..."
            />
          </div>
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Initialize Category</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructures;
