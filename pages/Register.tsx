
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, User, Package, ArrowRight, ArrowLeft, CheckCircle2, Globe, Mail, MapPin } from 'lucide-react';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">School Information</h3>
              <div className="space-y-3">
                <div className="relative">
                  <School className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" placeholder="School Name" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" placeholder="Website (Optional)" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" placeholder="Full Address" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
              Next Step <ArrowRight size={20} />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Administrative Contact</h3>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" placeholder="Admin Full Name" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="email" placeholder="Admin Email" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all text-sm font-medium" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={20} /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Choose Subscription</h3>
              <div className="space-y-3">
                {['Basic', 'Standard', 'Enterprise'].map(p => (
                  <label key={p} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-brand-primary transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-lg flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-gray-700">{p} Plan</span>
                    </div>
                    <input type="radio" name="plan" className="w-5 h-5 text-brand-primary" />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={20} /> Back
              </button>
              <button onClick={() => navigate('/login')} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                Complete Setup <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl mx-auto mb-6">eS</div>
          <h1 className="text-3xl font-bold text-gray-900">Create School Account</h1>
          <p className="text-gray-500 mt-2 font-medium">Join 500+ premium educational institutions</p>
        </div>

        <div className="card-premium p-8 glass-effect relative">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
          {renderStep()}
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
