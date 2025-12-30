
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Shield, Mail, Lock, LogOut, Camera, Save, Link as LinkIcon, Globe, Loader2, ExternalLink, MapPin, Smartphone, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'security'>('info');
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);

  const [infoData, setInfoData] = useState({ name: user?.name || '', email: user?.email || '', phone: '', gender: 'male', date_of_birth: '' });
  const [addressData, setAddressData] = useState({ address: '', city: '', state: '', zip: '', country: 'Nigeria' });
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

  const { submit: submitInfo, isSubmitting: isInfoSubmitting } = useFormSubmit(
    (data) => api.put('/profile', data),
    { successMessage: "Personal identity metadata synchronized." }
  );

  const { submit: submitAddress, isSubmitting: isAddressSubmitting } = useFormSubmit(
    (data) => api.put('/profile', data),
    { successMessage: "Geographic identifiers updated." }
  );

  const { submit: submitPassword, isSubmitting: isPassSubmitting } = useFormSubmit(
    (data) => api.put('/profile/password', data),
    { successMessage: "Access credentials successfully rotated.", onSuccess: () => setPasswordData({ current_password: '', password: '', password_confirmation: '' }) }
  );

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await api.get('/account/links');
        setLinkedAccounts(res.data.data || []);
      } catch (err) { console.warn("Identity links unavailable."); }
    };
    fetchLinks();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="card-premium overflow-hidden border-none shadow-2xl shadow-brand-primary/10">
        <div className="h-40 bg-gradient-to-r from-brand-primary to-blue-800 relative">
           <div className="absolute -bottom-12 left-10 group">
              <div className="relative">
                <img src={user.avatar} className="w-28 h-28 rounded-[2rem] border-4 border-white shadow-2xl bg-white object-cover" alt="" />
                <button className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={24} />
                </button>
              </div>
           </div>
        </div>
        <div className="pt-16 pb-10 px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">{user.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold text-brand-primary uppercase tracking-[0.15em] bg-blue-50 px-2 py-0.5 rounded-lg">{user.role.replace('_', ' ')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Authenticated Node</span>
              </div>
           </div>
           <button onClick={logout} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 border border-red-100">
              <LogOut size={16} /> Disconnect Session
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-2">
           {[
             { id: 'info', label: 'Identity & Info', icon: UserIcon },
             { id: 'address', label: 'Address & Contact', icon: MapPin },
             { id: 'security', label: 'Security & Token', icon: Lock },
           ].map((tab) => (
             <button 
               key={tab.id} onClick={() => setActiveTab(tab.id as any)}
               className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]' : 'text-gray-500 hover:bg-white hover:text-brand-primary'}`}
             >
               <tab.icon size={18} /> {tab.label}
             </button>
           ))}
        </div>

        <div className="lg:col-span-8">
           {activeTab === 'info' && (
             <div className="card-premium p-8 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-black text-gray-800 mb-8 border-b border-gray-50 pb-4">Personal Metadata</h3>
                <form onSubmit={e => { e.preventDefault(); submitInfo(infoData); }} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                    <input type="text" value={infoData.name} onChange={e => setInfoData({...infoData, name: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                      <select value={infoData.gender} onChange={e => setInfoData({...infoData, gender: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800">
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Birth Date</label>
                      <input type="date" value={infoData.date_of_birth} onChange={e => setInfoData({...infoData, date_of_birth: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button type="submit" disabled={isInfoSubmitting} className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                       {isInfoSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Parameters
                    </button>
                  </div>
                </form>
             </div>
           )}

           {activeTab === 'address' && (
             <div className="card-premium p-8 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-black text-gray-800 mb-8 border-b border-gray-50 pb-4">Geographic Identifiers</h3>
                <form onSubmit={e => { e.preventDefault(); submitAddress(addressData); }} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                    <input type="text" value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" placeholder="123 Academic Drive" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Region</label>
                      <input type="text" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / Province</label>
                      <input type="text" value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code (ZIP)</label>
                      <input type="text" value={addressData.zip} onChange={e => setAddressData({...addressData, zip: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nation / Country</label>
                      <input type="text" value={addressData.country} onChange={e => setAddressData({...addressData, country: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button type="submit" disabled={isAddressSubmitting} className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                       {isAddressSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update Address
                    </button>
                  </div>
                </form>
             </div>
           )}

           {activeTab === 'security' && (
             <div className="card-premium p-8 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-black text-gray-800 mb-8 border-b border-gray-50 pb-4">Security Protocol rotation</h3>
                <form onSubmit={e => { e.preventDefault(); submitPassword(passwordData); }} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Master Token</label>
                    <input type="password" required value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Secure Key</label>
                      <input type="password" required value={passwordData.password} onChange={e => setPasswordData({...passwordData, password: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Key</label>
                      <input type="password" required value={passwordData.password_confirmation} onChange={e => setPasswordData({...passwordData, password_confirmation: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800" />
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                    <Shield size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 font-medium leading-relaxed">Ensure your new password contains at least 8 characters, including symbols and numerics for institutional compliance.</p>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button type="submit" disabled={isPassSubmitting} className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                       {isPassSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Rotate Credentials
                    </button>
                  </div>
                </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
