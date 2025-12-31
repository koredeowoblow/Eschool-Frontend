
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      // The message is now pre-normalized by the api service
      const message = err.message || 'Invalid credentials or connection error.';
      setError(message);
      console.error("Login component caught error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-orange-50 p-6 overflow-y-auto">
      <div className="max-w-md w-full py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-brand-primary/30 mx-auto mb-6">
            eS
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-outfit">eSchool Premium</h1>
          <p className="text-gray-500 mt-2 font-medium">Modern Education Management System</p>
        </div>

        <div className="card-premium p-8 glass-effect border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school-domain.com"
                  required
                  className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all font-semibold text-gray-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <Link to="/forgot-password" title="Recover account access" className="text-[10px] font-black text-brand-secondary uppercase hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all font-semibold text-gray-800 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-primary/30 hover:bg-blue-700 hover:shadow-brand-primary/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Secure Login
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-6">
            <ShieldCheck size={14} className="text-green-500" />
            Authenticated Production Session
          </div>
        </div>

        <div className="text-center mt-8">
            <p className="text-sm text-gray-400 font-medium">
              New institution? <Link to="/register" className="text-brand-secondary font-bold hover:underline">Onboard your school</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
