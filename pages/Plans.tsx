
import React, { useState, useEffect } from 'react';
import { Package, Plus, Check, Loader2, Inbox, Edit2, Zap, Shield, Users, UserCheck } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { Plan } from '../types';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    no_of_students: '',
    no_of_teachers: '',
    no_of_staff: '',
    no_of_guardians: '',
    is_active: true
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/plans');
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

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: String(plan.price),
      description: plan.description || '',
      no_of_students: String(plan.no_of_students || 0),
      no_of_teachers: String(plan.no_of_teachers || 0),
      no_of_staff: String(plan.no_of_staff || 0),
      no_of_guardians: String(plan.no_of_guardians || 0),
      is_active: plan.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const formatLimit = (v: any) => {
    const num = Number(v);
    return num === 0 ? 'Unlimited' : num.toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Membership Plans</h2>
          <p className="text-sm text-gray-500 font-medium">Manage institutional subscription tiers and pricing strategies</p>
        </div>
        <button 
          onClick={() => { setSelectedPlan(null); setFormData({ name: '', price: '', description: '', no_of_students: '', no_of_teachers: '', no_of_staff: '', no_of_guardians: '', is_active: true }); setIsModalOpen(true); }} 
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all"
        >
          <Plus size={18} /> New Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Master Tiers...</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isEnterprise = plan.name.toLowerCase().includes('enterprise') || plan.name.toLowerCase().includes('gold');
            
            return (
              <div 
                key={plan.id} 
                className={`card-premium p-8 relative flex flex-col group ${isEnterprise ? 'border-2 border-brand-primary ring-8 ring-brand-primary/5' : 'hover:border-brand-primary/20'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isEnterprise ? 'bg-blue-50 text-brand-primary' : 'bg-gray-50 text-gray-400'}`}>
                    {isEnterprise ? <Zap size={28} /> : <Shield size={28} />}
                  </div>
                  <button onClick={() => handleEdit(plan)} className="p-2 text-gray-300 hover:text-brand-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-3xl font-black text-gray-900 mt-2 mb-6">
                  ${Number(plan.price).toLocaleString()}<span className="text-sm text-gray-400 font-bold uppercase tracking-widest">/yr</span>
                </p>
                
                <div className="space-y-4 flex-1 border-t border-gray-50 pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold"><Users size={14} className="text-brand-primary" /> Students</div>
                    <span className="font-black text-gray-800">{formatLimit(plan.no_of_students)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold"><UserCheck size={14} className="text-brand-secondary" /> Teachers</div>
                    <span className="font-black text-gray-800">{formatLimit(plan.no_of_teachers)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold"><Users size={14} className="text-emerald-500" /> Staff</div>
                    <span className="font-black text-gray-800">{formatLimit(plan.no_of_staff)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleEdit(plan)}
                  className={`w-full mt-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    isEnterprise 
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Adjust Parameters
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
           <Package size={48} strokeWidth={1} />
           <p className="font-bold">No membership plans identified.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPlan ? "Update Tier Definition" : "Initialize New Tier"}>
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Plan Identification</label>
            <input 
              required type="text" value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              placeholder="e.g. Enterprise Pro"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price ($)</label>
              <input 
                required type="number" value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Students</label>
              <input 
                required type="number" value={formData.no_of_students}
                onChange={e => setFormData({...formData, no_of_students: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Teachers</label>
              <input 
                required type="number" value={formData.no_of_teachers}
                onChange={e => setFormData({...formData, no_of_teachers: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Staff</label>
              <input 
                required type="number" value={formData.no_of_staff}
                onChange={e => setFormData({...formData, no_of_staff: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Authorize Tier Schema"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;
