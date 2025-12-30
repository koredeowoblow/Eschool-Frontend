
import React, { useState, useEffect } from 'react';
import { Package, Plus, Check, MoreVertical, Loader2, Inbox, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    max_students: '',
    is_active: true
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/plans');
      // Some APIs wrap in data.data, some just data
      const rawData = res.data.data || res.data || [];
      setPlans(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error("Failed to load plans", err);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const { submit, isSubmitting } = useFormSubmit(
    (data) => selectedPlan 
      ? api.put(`/plans/${selectedPlan.id}`, data) 
      : api.post('/plans', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
        fetchPlans();
      }
    }
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description || '',
      max_students: plan.max_students || '',
      is_active: plan.is_active ?? true
    });
    setIsModalOpen(true);
  };

  // Helper to parse features from description or use defaults
  const getFeatures = (plan: any) => {
    if (plan.features && Array.isArray(plan.features)) return plan.features;
    if (plan.description && plan.description.includes(',')) return plan.description.split(',');
    
    // Default fallback features based on common SaaS patterns
    return [
      `Up to ${plan.max_students || 'Unlimited'} Students`,
      plan.name.toLowerCase().includes('enterprise') ? 'Multi-Campus Support' : 'Single Campus Access',
      'Full LMS Engine',
      'Financial Management',
      'Institutional Audit Logs'
    ];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Membership Plans</h2>
          <p className="text-sm text-gray-500 font-medium">Control institutional subscription tiers and pricing</p>
        </div>
        <button 
          onClick={() => { setSelectedPlan(null); setFormData({ name: '', price: '', description: '', max_students: '', is_active: true }); setIsModalOpen(true); }} 
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all"
        >
          <Plus size={18} /> New Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Tiers...</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => {
            const features = getFeatures(plan);
            const isEnterprise = plan.name.toLowerCase().includes('enterprise');
            
            return (
              <div 
                key={plan.id} 
                className={`card-premium p-8 relative flex flex-col group ${isEnterprise ? 'border-2 border-brand-primary shadow-2xl' : 'hover:border-brand-primary/20'}`}
              >
                {isEnterprise && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Institutional Choice
                  </span>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isEnterprise ? 'bg-blue-50 text-brand-primary' : 'bg-gray-50 text-gray-400'}`}>
                    <Package size={28} />
                  </div>
                  <button onClick={() => handleEdit(plan)} className="p-2 text-gray-300 hover:text-brand-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-3xl font-black text-gray-900 mt-2 mb-4">
                  ${Number(plan.price).toLocaleString()}<span className="text-sm text-gray-400 font-bold uppercase tracking-widest">/yr</span>
                </p>
                
                <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed">
                  {plan.description || "Comprehensive platform access for growing educational institutions."}
                </p>

                <div className="space-y-4 flex-1">
                  {features.map((f: string, j: number) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-gray-600 font-semibold">
                      <Check size={16} className="text-green-500 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleEdit(plan)}
                  className={`w-full mt-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    isEnterprise 
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Modify Tier Schema
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
           <Package size={48} strokeWidth={1} />
           <div className="space-y-1">
             <p className="font-bold text-gray-600">No active plans found in registry.</p>
             <p className="text-xs font-medium">Provision a plan to start instituting tenant billing.</p>
           </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPlan ? "Update Tier Parameters" : "Define Subscription Tier"}>
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Plan Identification (Name)</label>
            <input 
              required type="text" value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:border-brand-primary"
              placeholder="e.g. Enterprise Gold"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (USD)</label>
              <input 
                required type="number" value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black"
                placeholder="999"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Students</label>
              <input 
                required type="number" value={formData.max_students}
                onChange={e => setFormData({...formData, max_students: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contextual Features (CSV)</label>
            <textarea 
              rows={3} value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
              placeholder="Enter features separated by commas..."
            />
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Finalize Tier Definition"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;
