
import React from 'react';
import { Package, Plus, Check, MoreVertical } from 'lucide-react';

const Plans: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Subscription Plans</h2>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'Basic', price: '$99/mo', color: 'bg-gray-50 text-gray-600', features: ['Up to 500 Students', 'LMS Basic', 'Email Support'] },
          { name: 'Standard', price: '$199/mo', color: 'bg-blue-50 text-brand-primary', features: ['Up to 2000 Students', 'Finance Tools', '24/7 Support', 'Custom Branding'], popular: true },
          { name: 'Enterprise', price: '$499/mo', color: 'bg-purple-50 text-purple-600', features: ['Unlimited Students', 'Multi-Campus', 'Dedicated AM', 'API Access'] },
        ].map((plan, i) => (
          <div key={i} className={`card-premium p-8 relative flex flex-col ${plan.popular ? 'border-2 border-brand-primary shadow-2xl' : ''}`}>
            {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Most Popular</span>}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.color}`}>
              <Package size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
            <p className="text-3xl font-black text-gray-900 mt-2 mb-8">{plan.price}</p>
            <div className="space-y-4 flex-1">
              {plan.features.map((f, j) => (
                <div key={j} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <Check size={16} className="text-green-500" />
                  {f}
                </div>
              ))}
            </div>
            <button className={`w-full mt-10 py-3 rounded-xl font-bold text-sm transition-all ${plan.popular ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Edit Plan Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
