
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Globe, Server, Activity, Plus, ExternalLink, Loader2, Inbox, ArrowRight, ArrowLeft, 
  CheckCircle2, School as SchoolIcon, Mail, Package, MapPin, Smartphone, 
  Terminal, ShieldCheck as ShieldIcon, Users, Trash2, Power, PowerOff, Zap, Shield, User, GraduationCap
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import Modal from '../components/common/Modal';
import api from '../services/api';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useNotification } from '../context/NotificationContext';
import { School } from '../types';

const SuperAdmin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const { options: planOptions } = useSelectOptions('/plans');

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

  const getPlanBadge = (school: School) => {
    const planName = school.school_plan?.name || school.plan || 'Trial';
    const name = planName.toLowerCase();
    if (name.includes('gold')) return <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black uppercase rounded-lg border border-orange-200 flex items-center gap-1"><Zap size={10}/> Gold</span>;
    if (name.includes('silver')) return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-lg border border-slate-200 flex items-center gap-1"><Shield size={10}/> Silver</span>;
    return <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] font-black uppercase rounded-lg border border-blue-100 flex items-center gap-1"><Activity size={10}/> {planName}</span>;
  };

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

  const fetchSuperAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, schoolsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/schools')
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setSchools(schoolsRes.data.data || schoolsRes.data || []);
    } catch (err) {
      console.error("Failed to load platform data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActivation = async (school: School) => {
    const action = school.is_active ? 'suspend' : 'approve';
    if (!confirm(`Are you sure you want to ${action} this school?`)) return;
    
    setIsActionLoading(school.id);
    try {
      // SYNCED WITH LEGACY SNIPPET: PUT /api/v1/schools/${id} with { is_active: 1/0 }
      await api.put(`/schools/${school.id}`, { is_active: school.is_active ? 0 : 1 });
      showNotification(`${school.name} status updated successfully.`, 'success');
      fetchSuperAdminData();
    } catch (err: any) {
      showNotification(err.message || "Institutional update rejected by server.", 'error');
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
        <StatsCard label="Total Schools" value={stats?.platform?.total_schools || stats?.total_schools || 0} icon={Globe} color="bg-brand-primary" />
        <StatsCard label="Active Users" value={stats?.platform?.total_users?.toLocaleString() || stats?.total_users || 0} icon={Activity} color="bg-green-600" />
        <StatsCard label="System Health" value="Stable" icon={Server} color="bg-blue-800" />
        <StatsCard label="Global Revenue" value={`$${(stats?.platform?.total_revenue || stats?.revenue || 0).toLocaleString()}`} icon={ShieldAlert} color="bg-orange-500" />
      </div>

      <div className="card-premium p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Institution Registry</h2>
            <p className="text-sm text-gray-500 font-medium">Tenant isolation and instance control panel</p>
          </div>
          <button 
            onClick={() => { setStep(1); setIsModalOpen(true); }} 
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={18} /> Provision Institution
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : schools.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <th className="px-4 py-4">School / Email</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Contact Authority</th>
                  <th className="px-4 py-4 text-center">Stats</th>
                  <th className="px-4 py-4">Subscription</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schools.map((school) => (
                  <tr key={school.id} className="group hover:bg-gray-50/40 transition-colors text-sm">
                    <td className="px-4 py-5">
                      <p className="font-bold text-gray-800">{school.name}</p>
                      <p className="text-[11px] text-brand-primary font-bold uppercase">{school.slug}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{school.email}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-xs font-semibold text-gray-600 line-clamp-1 max-w-[150px]">{school.address}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{school.city}, {school.state}</p>
                    </td>
                    <td className="px-4 py-5">
                       <p className="font-bold text-gray-700">{school.contact_person || 'N/A'}</p>
                       <p className="text-[11px] text-gray-400 font-medium">{school.contact_person_phone || ''}</p>
                    </td>
                    <td className="px-4 py-5 text-center">
                       <div className="flex flex-col gap-1 items-center">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                            <Users size={12} className="text-brand-primary" /> {school.users_count || 0}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                            <GraduationCap size={12} className="text-brand-secondary" /> {school.students_count || 0}
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-5">
                      {getPlanBadge(school)}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        school.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {school.status_label || (school.is_active ? 'Active' : 'Suspended')}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleToggleActivation(school)}
                          disabled={isActionLoading === school.id}
                          className={`p-2 rounded-xl transition-all ${school.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={school.is_active ? "Suspend School" : "Approve School"}
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
          ) : (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4 border border-dashed border-gray-100 rounded-3xl">
              <Inbox size={48} strokeWidth={1} />
              <div className="space-y-1">
                <p className="font-bold text-gray-600">Registry Isolated.</p>
                <p className="text-xs font-medium">Onboard your first institutional tenant to begin platform scale.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Institution Onboarding Protocol">
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 space-y-2">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-primary' : 'bg-gray-100'}`} />
              <p className={`text-[8px] font-black uppercase tracking-widest text-center ${step === i ? 'text-brand-primary' : 'text-gray-300'}`}>
                {i === 1 ? 'Identity' : i === 2 ? 'Locale' : i === 3 ? 'Authority' : 'Tier'}
              </p>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">1</div> Primary Institution Identity
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Name</label>
                <div className="relative">
                  <SchoolIcon size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text" placeholder="e.g. Royal Academy" value={formData.name}
                    onChange={handleNameChange} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-brand-primary font-bold text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">School Email (Required)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-3.5 text-gray-400" />
                    <input 
                      type="email" placeholder="info@school.com" value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})} required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">School Phone (Required)</label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-4 top-3.5 text-gray-400" />
                    <input 
                      type="text" placeholder="+1..." value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})} required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subdomain / Slug</label>
                <div className="relative">
                  <Terminal size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text" placeholder="royal-academy" value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-mono text-xs font-bold text-gray-500"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={!formData.name || !formData.email || !formData.phone} 
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              Define Geography <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
             <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">2</div> Geographical Mapping
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text" placeholder="Street Address" value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                  <input 
                    type="text" placeholder="City" value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})} required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                  <input 
                    type="text" placeholder="State" value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})} required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Administrative Area (Required)</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text" placeholder="e.g. Central District" value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!formData.address || !formData.city || !formData.state || !formData.area}
                className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Authority Setup <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
             <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">3</div> Administrative Authority
            </h3>
            <div className="space-y-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text" placeholder="Principal / Registrar Name" value={formData.admin_name}
                    onChange={e => setFormData({...formData, admin_name: e.target.value})} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Admin Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="email" placeholder="admin@school.edu" value={formData.admin_email}
                    onChange={e => setFormData({...formData, admin_email: e.target.value})} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Contact Phone</label>
                <div className="relative">
                  <Smartphone size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text" placeholder="+1..." value={formData.contact_person_phone}
                    onChange={e => setFormData({...formData, contact_person_phone: e.target.value})} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => setStep(4)} 
                disabled={!formData.admin_name || !formData.admin_email || !formData.contact_person_phone}
                className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Select Tier <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">4</div> Subscription Matrix
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {planOptions.map(p => (
                <label key={p.value} className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.plan === String(p.value) ? 'bg-blue-50 border-brand-primary ring-4 ring-brand-primary/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <Package size={20} className={formData.plan === String(p.value) ? 'text-brand-primary' : 'text-gray-400'} />
                    <span className="font-bold text-sm text-gray-700">{p.label}</span>
                  </div>
                  <input type="radio" name="plan" value={p.value} checked={formData.plan === String(p.value)} onChange={e => setFormData({...formData, plan: e.target.value})} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.plan === String(p.value) ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-200'}`}>
                    {formData.plan === String(p.value) && <CheckCircle2 size={12} />}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => submit(formData)} disabled={isSubmitting || !formData.plan}
                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><ShieldIcon size={18} /> Deploy Node</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdmin;
