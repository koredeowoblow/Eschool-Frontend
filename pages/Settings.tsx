
import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Globe, Save } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { label: 'General Info', icon: SettingsIcon, active: true },
            { label: 'Security', icon: Shield },
            { label: 'Notifications', icon: Bell },
            { label: 'Integrations', icon: Database },
            { label: 'School Portal', icon: Globe },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${item.active ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-500 hover:bg-white hover:text-brand-primary'}`}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card-premium p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">School Profile</h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">School Name</label>
                <input type="text" defaultValue="eSchool Premium International" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Contact Email</label>
                  <input type="email" defaultValue="admin@eschool.edu" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-primary transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Phone</label>
                  <input type="text" defaultValue="+1 999 000 111" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-primary transition-all" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Timezone</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-primary transition-all">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>GMT+1 (West Africa Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                </select>
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
