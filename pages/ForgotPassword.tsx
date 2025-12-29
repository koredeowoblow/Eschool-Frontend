
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl mx-auto mb-6">eS</div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 font-medium">Enter your email to receive recovery instructions</p>
        </div>

        <div className="card-premium p-8 glass-effect">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input type="email" placeholder="email@eschool.edu" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
              </div>
            </div>
            <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
              Send Instructions <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center">
            <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-all">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
