import React, { useState, useEffect } from 'react';
import {
  Globe, Activity, Plus, ExternalLink, Loader2, Inbox, ArrowRight, ArrowLeft,
  CheckCircle2, School as SchoolIcon, Mail, Package, MapPin, Smartphone,
  ShieldCheck, Users, Trash2, Power, PowerOff, Zap, Shield, GraduationCap,
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
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

      setStats(statsRes.data?.data || statsRes.data);

      const schoolsData = schoolsRes.data?.data || schoolsRes.data;
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);

      const plansData = plansRes.data?.data || plansRes.data;
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (err) {
      console.warn("Platform registry limited sync.");
      setSchools([]);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (school: School) => {
    setIsEditMode(true);
    setEditingSchool(school);
    setFormData({
      name: school.name || '',
      slug: school.slug || '',
      phone: school.phone || '',
      email: school.email || '',
      website: '',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      area: school.area || '',
      admin_name: school.contact_person || '',
      admin_email: school.email || '',
      contact_person_phone: school.contact_person_phone || '',
      plan: school.school_plan?.id ? String(school.school_plan.id) : '',
      status: school.is_active ? 'active' : 'pending'
    });
    setStep(1);
    setIsModalOpen(true);
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
        slug: data.slug,
        is_active: data.status === 'active' ? 1 : 0
      };

      if (isEditMode && editingSchool) {
        return api.put(`/schools/${editingSchool.id}`, payload);
      }
      return api.post('/create-school', payload);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingSchool(null);
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
    setIsActionLoading(school.id);
    try {
      await api.put(`/schools/${school.id}`, { is_active: school.is_active ? 0 : 1 });
      showNotification(`${school.name} has been ${actionText}ed.`, 'success');
      fetchSuperAdminData();
    } catch (err: any) {
      showNotification("Update failed. Institutional lock active.", 'error');
    } finally {
      setIsActionLoading(null);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const safeSchools = Array.isArray(schools) ? schools.filter(Boolean) : [];
  const safePlans = Array.isArray(plans) ? plans.filter(Boolean) : [];

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
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Institutional Registry</h2>
            <p className="text-sm text-gray-500 font-medium">Manage all school node accounts on the global platform</p>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingSchool(null);
              setFormData({
                name: '', slug: '', phone: '', email: '', website: '',
                address: '', city: '', state: '', area: '',
                admin_name: '', admin_email: '', contact_person_phone: '',
                plan: '', status: 'active'
              });
              setStep(1);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={18} /> Provision Node
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Querying Cloud Registry...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-4 py-4">Institution Identity</th>
                  <th className="px-4 py-4">Geographic Node</th>
                  <th className="px-4 py-4 text-center">Load Factor</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {safeSchools.map((school) => (
                  <tr key={school.id} className="group hover:bg-gray-50/40 transition-colors text-sm">
                    <td className="px-4 py-5">
                      <p className="font-bold text-gray-800">{school.name}</p>
                      <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{school.email}</p>
                    </td>
                    <td className="px-4 py-5 text-gray-500 font-medium">
                      {school.city}, {school.state}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black text-gray-400 uppercase">Users: {school.users_count || 0}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">Students: {school.students_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${school.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {school.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(school)}
                          className="p-2 text-gray-300 hover:text-brand-primary transition-colors rounded-xl hover:bg-blue-50"
                          title="Edit School"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        </button>
                        <button
                          onClick={() => handleToggleActivation(school)}
                          disabled={isActionLoading === school.id}
                          className={`p-2 rounded-xl transition-all ${school.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={school.is_active ? "Suspend Node" : "Authorize Node"}
                        >
                          {isActionLoading === school.id ? <Loader2 size={18} className="animate-spin" /> : school.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                        <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors"><ExternalLink size={18} /></button>
                        <button className="p-2 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {safeSchools.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400 font-bold italic">Registry empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Update Node Configuration" : "New Node Registration"}>
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-gray-100'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">1. Institutional Metadata</h3>
            <div className="space-y-3">
              <input
                type="text" placeholder="Institution Name" value={formData.name}
                onChange={handleNameChange} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-brand-primary font-bold text-sm"
              />
              <input
                type="email" placeholder="Institutional Gateway Email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm"
              />
              <input
                type="text" placeholder="Emergency Phone" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm"
              />
              <input
                type="text" placeholder="URL slug-identifier" value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full p-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none font-mono text-[10px] font-black text-gray-500"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.email || !formData.phone}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Configure Location <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">2. Geographic Coordinates</h3>
            <div className="space-y-3">
              <input
                type="text" placeholder="Primary Physical Address" value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" placeholder="City" value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })} required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
                />
                <input
                  type="text" placeholder="State/Region" value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })} required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
                />
              </div>
              <input
                type="text" placeholder="Zone / Area" value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Previous
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.address || !formData.city || !formData.state}
                className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">3. Lead Administrator</h3>
            <div className="space-y-3">
              <input
                type="text" placeholder="Full Administrative Name" value={formData.admin_name}
                onChange={e => setFormData({ ...formData, admin_name: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
              />
              <input
                type="email" placeholder="Direct Personal Email" value={formData.admin_email}
                onChange={e => setFormData({ ...formData, admin_email: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
              />
              <input
                type="text" placeholder="Direct Contact No" value={formData.contact_person_phone}
                onChange={e => setFormData({ ...formData, contact_person_phone: e.target.value })} required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Previous
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.admin_name || !formData.admin_email}
                className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">4. Select Subscription Tier</h3>
            <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {safePlans.length > 0 ? safePlans.map(p => (
                <label key={p.id} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${formData.plan === String(p.id) ? 'bg-blue-50 border-brand-primary ring-4 ring-brand-primary/5' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.plan === String(p.id) ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <span className="font-black text-sm text-gray-800 uppercase tracking-tight">{p.name}</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${p.price}/year</p>
                    </div>
                  </div>
                  <input type="radio" name="plan" value={p.id} checked={formData.plan === String(p.id)} onChange={e => setFormData({ ...formData, plan: e.target.value })} className="hidden" />
                  {formData.plan === String(p.id) && <div className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white"><CheckCircle2 size={14} /></div>}
                </label>
              )) : (
                <div className="p-12 text-center text-gray-400 font-bold italic text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">No active plans discovered in catalog.</div>
              )}
            </div>
            <div className="flex gap-3 pt-6 border-t border-gray-50">
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Previous
              </button>
              <button
                onClick={() => submit(formData)} disabled={isSubmitting || !formData.plan}
                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-600/20 flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> {isEditMode ? 'Update Node' : 'Provision Node'}</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdmin;