
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-orange-50 p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl mx-auto mb-6">eS</div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2 font-medium">Create a new secure password for your account</p>
        </div>

        <div className="card-premium p-8 glass-effect">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
              </div>
            </div>
            <button onClick={() => navigate('/login')} className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
              Save New Password <CheckCircle2 size={20} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-6">
            <ShieldCheck size={14} className="text-green-500" />
            Security Verified
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
