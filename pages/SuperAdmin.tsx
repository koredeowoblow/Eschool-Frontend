
import React, { useState, useEffect } from 'react';
import { 
  Globe, Activity, Plus, ExternalLink, Loader2, Inbox, ArrowRight, ArrowLeft, 
  CheckCircle2, School as SchoolIcon, Mail, Package, MapPin, Smartphone, 
  Terminal, ShieldCheck, Users, Trash2, Power, PowerOff, Zap, Shield, User, GraduationCap,
  Wallet
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import Modal from '../components/common/Modal';
import api from '../services/api';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useNotification } from '../context/NotificationContext';
import { School, Plan } from '../types';

const SuperAdmin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    area: '',
    admin_name: '',
    admin_email: '',
    contact_person_phone: '',
    plan: '', 
    status: 'active'
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const fetchSuperAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, schoolsRes, plansRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/schools'),
        api.get('/plans')
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setSchools(schoolsRes.data.data || schoolsRes.data || []);
      setPlans(plansRes.data.data || plansRes.data || []);
    } catch (err) {
      console.error("Failed to load platform data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { submit, isSubmitting } = useFormSubmit(
    (data) => {
      const payload = {
        name: data.name,
        email: data.email,
        admin_email: data.admin_email,
        admin_name: data.admin_name,
        phone: data.phone,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        area: data.area,
        contact_person: data.admin_name,
        contact_person_phone: data.contact_person_phone,
        plan: data.plan, 
        status: data.status,
        slug: data.slug
      };
      return api.post('/create-school', payload);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setStep(1);
        fetchSuperAdminData();
        setFormData({
          name: '', slug: '', phone: '', email: '', website: '',
          address: '', city: '', state: '', area: '',
          admin_name: '', admin_email: '', contact_person_phone: '',
          plan: '', status: 'active'
        });
      }
    }
  );

  const handleToggleActivation = async (school: School) => {
    const actionText = school.is_active ? 'suspend' : 'approve';
    // Removed window.confirm due to sandbox restrictions
    setIsActionLoading(school.id);
    try {
      await api.put(`/schools/${school.id}`, { is_active: school.is_active ? 0 : 1 });
      showNotification(`${school.name} has been ${actionText}ed.`, 'success');
      fetchSuperAdminData();
    } catch (err: any) {
      showNotification("Update failed. Please try again.", 'error');
    } finally {
      setIsActionLoading(null);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Schools" value={stats?.platform?.total_schools || 0} icon={SchoolIcon} color="bg-brand-primary" />
        <StatsCard label="Users" value={stats?.platform?.total_users?.toLocaleString() || 0} icon={Users} color="bg-blue-500" />
        <StatsCard label="Status" value="Online" icon={Activity} color="bg-green-600" />
        <StatsCard label="Revenue" value={`$${(stats?.platform?.total_revenue || 0).toLocaleString()}`} icon={Wallet} color="bg-emerald-600" />
      </div>

      <div className="card-premium p-8 border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Schools</h2>
            <p className="text-sm text-gray-500">Manage all school accounts on the platform</p>
          </div>
          <button 
            onClick={() => { setStep(1); setIsModalOpen(true); }} 
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={18} /> Add School
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-4 py-4">School</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4 text-center">Stats</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schools.map((school) => (
                  <tr key={school.id} className="group hover:bg-gray-50/40 transition-colors text-sm">
                    <td className="px-4 py-5">
                      <p className="font-bold text-gray-800">{school.name}</p>
                      <p className="text-[10px] text-brand-primary font-bold">{school.email}</p>
                    </td>
                    <td className="px-4 py-5 text-gray-500">
                      {school.city}, {school.state}
                    </td>
                    <td className="px-4 py-5 text-center">
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Users: {school.users_count || 0}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Students: {school.students_count || 0}</span>
                       </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        school.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {school.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleToggleActivation(school)}
                          disabled={isActionLoading === school.id}
                          className={`p-2 rounded-xl transition-all ${school.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={school.is_active ? "Suspend" : "Approve"}
                        >
                          {isActionLoading === school.id ? <Loader2 size={18} className="animate-spin" /> : school.is_active ? <PowerOff size={18}/> : <Power size={18}/>}
                        </button>
                        <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors"><ExternalLink size={18}/></button>
                        <button className="p-2 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New School Registration">
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-primary' : 'bg-gray-100'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest">1. Basic Info</h3>
            <div className="space-y-3">
              <input 
                type="text" placeholder="School Name" value={formData.name}
                onChange={handleNameChange} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-brand-primary font-bold text-sm"
              />
              <input 
                type="email" placeholder="Contact Email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
              />
              <input 
                type="text" placeholder="Phone Number" value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
              />
              <input 
                type="text" placeholder="URL Slug" value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className="w-full p-3.5 bg-gray-100 border border-gray-100 rounded-xl outline-none font-mono text-xs font-bold text-gray-500"
              />
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={!formData.name || !formData.email || !formData.phone}
              className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest">2. Location</h3>
            <div className="space-y-3">
              <input 
                type="text" placeholder="Address" value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" placeholder="City" value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})} required
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                />
                <input 
                  type="text" placeholder="State" value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})} required
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                />
              </div>
              <input 
                type="text" placeholder="Area" value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!formData.address || !formData.city || !formData.state}
                className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest">3. Administrator</h3>
            <div className="space-y-3">
              <input 
                type="text" placeholder="Admin Name" value={formData.admin_name}
                onChange={e => setFormData({...formData, admin_name: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
              />
              <input 
                type="email" placeholder="Admin Email" value={formData.admin_email}
                onChange={e => setFormData({...formData, admin_email: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
              />
              <input 
                type="text" placeholder="Admin Phone" value={formData.contact_person_phone}
                onChange={e => setFormData({...formData, contact_person_phone: e.target.value})} required
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => setStep(4)} 
                disabled={!formData.admin_name || !formData.admin_email}
                className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest">4. Choose Plan</h3>
            <div className="grid grid-cols-1 gap-2">
              {plans.length > 0 ? plans.map(p => (
                <label key={p.id} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${formData.plan === String(p.id) ? 'bg-blue-50 border-brand-primary' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <Package size={20} className={formData.plan === String(p.id) ? 'text-brand-primary' : 'text-gray-400'} />
                    <span className="font-bold text-sm text-gray-700">{p.name}</span>
                  </div>
                  <input type="radio" name="plan" value={p.id} checked={formData.plan === String(p.id)} onChange={e => setFormData({...formData, plan: e.target.value})} className="hidden" />
                  {formData.plan === String(p.id) && <CheckCircle2 size={16} className="text-brand-primary" />}
                </label>
              )) : (
                <div className="p-8 text-center text-gray-400 font-bold italic text-xs">Loading plans...</div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => submit(formData)} disabled={isSubmitting || !formData.plan}
                className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> Create Account</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdmin;
