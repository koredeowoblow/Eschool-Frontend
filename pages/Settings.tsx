
import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Globe, Save, School, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');

  const menuItems = [
    { id: 'general', label: 'General Info', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (user?.role === UserRole.SCHOOL_ADMIN) {
    menuItems.push(
      { id: 'school', label: 'School Profile', icon: School },
      { id: 'billing', label: 'Billing & Plan', icon: CreditCard }
    );
  }

  if (user?.role === UserRole.SUPER_ADMIN) {
    menuItems.push(
      { id: 'system', label: 'System Engine', icon: Database }
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeSection === item.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'text-gray-500 hover:bg-white hover:text-brand-primary'}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeSection === 'general' && (
            <div className="card-premium p-8 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Personal Configuration</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Display Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:border-brand-primary transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (System Fixed)</label>
                  <input type="email" readOnly defaultValue={user?.email} className="w-full bg-gray-100 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-400" />
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-end">
                  <button className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'school' && user?.role === UserRole.SCHOOL_ADMIN && (
            <div className="card-premium p-8 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Institution Profile</h3>
              <div className="space-y-6">
                 <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official School Name</label>
                  <input type="text" placeholder="e.g. Heritage International School" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">School Website</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold"></textarea>
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-end">
                  <button className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                    <Save size={16} /> Update Institutional Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card-premium p-8 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Access Security</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                       <p className="text-sm font-bold text-gray-700">Multi-Factor Authentication</p>
                       <p className="text-xs text-gray-400 font-medium">Verify login attempts via email or SMS.</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                 </div>
                 <div className="pt-6 border-t border-gray-50">
                    <button className="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline">Reset Account Credentials</button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
