
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Globe, Server, Activity, Plus, ExternalLink, Loader2, Inbox, ArrowRight, ArrowLeft, CheckCircle2, School as SchoolIcon, Mail, Package, MapPin, Smartphone } from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import Modal from '../components/common/Modal';
import api from '../services/api';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useSelectOptions } from '../hooks/useSelectOptions';

const SuperAdmin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const { options: planOptions } = useSelectOptions('/plans');

  const [formData, setFormData] = useState({
    school_name: '',
    school_email: '',
    school_phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    plan_id: ''
  });

  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/create-school', data), // Using exact route from list
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setStep(1);
        fetchSuperAdminData();
      }
    }
  );

  const fetchSuperAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, schoolsRes] = await Promise.all([
        api.get('/dashboard/stats'), // Matching provided routes
        api.get('/schools')         // Matching provided routes
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setSchools(schoolsRes.data.data || schoolsRes.data || []);
    } catch (err) {
      console.error("Failed to load platform data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Schools" value={stats?.total_schools || 0} icon={Globe} color="bg-brand-primary" />
        <StatsCard label="Active Users" value={stats?.total_users?.toLocaleString() || 0} icon={Activity} color="bg-green-600" />
        <StatsCard label="System Health" value="Stable" icon={Server} color="bg-blue-800" />
        <StatsCard label="Annual Revenue" value={`$${(stats?.revenue || 0).toLocaleString()}`} icon={ShieldAlert} color="bg-orange-500" />
      </div>

      <div className="card-premium p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Platform Tenants</h2>
            <p className="text-sm text-gray-500 font-medium">Monitoring independent school instances</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
            <Plus size={18} /> Provision New School
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : schools.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <th className="px-4 py-4">Institution Name</th>
                  <th className="px-4 py-4">Admin Email</th>
                  <th className="px-4 py-4">Plan</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schools.map((school) => (
                  <tr key={school.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-5 font-bold text-gray-800">{school.name}</td>
                    <td className="px-4 py-5 text-sm text-gray-500">{school.email}</td>
                    <td className="px-4 py-5 font-black text-[10px] text-brand-primary uppercase tracking-widest">{school.plan?.name || 'Standard'}</td>
                    <td className="px-4 py-5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                        school.status === 'Active' || !school.is_suspended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {school.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors"><ExternalLink size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
              <Inbox size={48} strokeWidth={1} />
              <p className="font-bold">No tenants found.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Institution Provisioning">
        <div className="flex gap-1 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-brand-primary' : 'bg-gray-100'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-2">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Step 1: Identity</h3>
            <div className="space-y-3">
              <div className="relative">
                <SchoolIcon size={16} className="absolute left-4 top-4 text-gray-400" />
                <input 
                  type="text" placeholder="School Name" value={formData.school_name}
                  onChange={e => setFormData({...formData, school_name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-4 text-gray-400" />
                <input 
                  type="email" placeholder="Official Email" value={formData.school_email}
                  onChange={e => setFormData({...formData, school_email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
                />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-2">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Step 2: Admin Account</h3>
            <div className="space-y-3">
              <div className="relative">
                <Activity size={16} className="absolute left-4 top-4 text-gray-400" />
                <input 
                  type="text" placeholder="Admin Full Name" value={formData.admin_name}
                  onChange={e => setFormData({...formData, admin_name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-4 text-gray-400" />
                <input 
                  type="email" placeholder="Admin Email" value={formData.admin_email}
                  onChange={e => setFormData({...formData, admin_email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                Plans <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-2">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Step 3: Subscription Plan</h3>
            <div className="space-y-3">
              {planOptions.map(plan => (
                <label key={plan.value} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${formData.plan_id === String(plan.value) ? 'bg-blue-50 border-brand-primary' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <Package size={20} className={formData.plan_id === String(plan.value) ? 'text-brand-primary' : 'text-gray-400'} />
                    <span className="font-bold text-gray-800">{plan.label}</span>
                  </div>
                  <input 
                    type="radio" name="plan" value={plan.value}
                    checked={formData.plan_id === String(plan.value)}
                    onChange={e => setFormData({...formData, plan_id: e.target.value})}
                    className="hidden"
                  />
                  {formData.plan_id === String(plan.value) && <CheckCircle2 size={18} className="text-brand-primary" />}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => submit(formData)} disabled={isSubmitting || !formData.plan_id}
                className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /> Finish Provisioning</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdmin;
