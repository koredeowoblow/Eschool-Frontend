
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Shield, Mail, Lock, LogOut, Camera, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Profile Header Card */}
      <div className="card-premium overflow-hidden border-none shadow-2xl shadow-brand-primary/10">
        <div className="h-32 bg-gradient-to-r from-brand-primary to-blue-800 relative">
           <div className="absolute -bottom-12 left-8 group">
              <div className="relative">
                <img src={user.avatar} className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl bg-white object-cover" alt="" />
                <button className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={20} />
                </button>
              </div>
           </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{user.name}</h2>
              <p className="text-sm font-bold text-brand-primary uppercase tracking-[0.15em]">{user.role.replace('_', ' ')}</p>
           </div>
           <button onClick={logout} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
              <LogOut size={16} /> Logout Securely
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Personal Info */}
        <div className="md:col-span-8 space-y-8">
          <div className="card-premium p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
              <UserIcon className="text-brand-primary" size={20} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" defaultValue={user.name} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-300" size={16} />
                  <input type="email" readOnly defaultValue={user.email} className="w-full p-3 pl-10 bg-gray-100 border border-gray-100 rounded-xl text-gray-500 font-medium outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input type="text" defaultValue="+1 000 000 000" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gender</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="px-8 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Update Profile
              </button>
            </div>
          </div>

          <div className="card-premium p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
              <Shield className="text-emerald-500" size={20} /> Security Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                   <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
                   <p className="text-xs text-gray-400 font-medium">Add an extra layer of security to your account.</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-black transition-all">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats */}
        <div className="md:col-span-4 space-y-8">
           <div className="card-premium p-6 bg-gradient-to-br from-brand-secondary to-orange-600 text-white border-none shadow-xl shadow-brand-secondary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <h4 className="font-bold">System Status</h4>
              </div>
              <p className="text-orange-50 text-sm font-medium leading-relaxed">
                Your account is currently in good standing. Last login was from IP: 192.168.1.1 in Lagos, Nigeria.
              </p>
           </div>
           
           <div className="card-premium p-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-6">Account Activity</h4>
              <div className="space-y-6">
                {[
                  { action: 'Profile Updated', time: '2 days ago' },
                  { action: 'Password Changed', time: '1 month ago' },
                  { action: 'Login from Chrome', time: 'Just now' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 ring-4 ring-blue-50"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{act.action}</p>
                      <p className="text-[10px] font-bold text-gray-400">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
