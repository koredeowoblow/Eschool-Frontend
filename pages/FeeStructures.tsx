import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Target, DollarSign, Clock, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const FeeStructures: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await api.get('/fee-structures');
        const data = res.data.data || res.data || [];
        setFees(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.warn("Fee structures endpoint 404/not available:", err.message);
        setError(true);
        setFees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee Structures</h2>
          <p className="text-sm text-gray-500 font-medium">Define billable components and class allocations</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> Add Fee Item
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving Tariffs...</p>
        </div>
      ) : fees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fees.map((fee) => (
            <div key={fee.id} className="card-premium p-6 border border-transparent hover:border-brand-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{fee.name || fee.title}</h4>
                  <p className="text-xl font-black text-brand-primary">${fee.amount?.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-tighter">Class Target</span>
                  <span className="text-gray-700 font-black">{fee.target_classes || 'All Levels'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-tighter">Billing Policy</span>
                  <span className="text-brand-secondary font-black">{fee.frequency || 'Per Term'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
             <Wallet size={32} strokeWidth={1} />
           </div>
           <div className="space-y-1">
             <p className="font-bold text-gray-600">No fee structures configured.</p>
             <p className="text-xs font-medium max-w-xs mx-auto">
               {error ? "The Finance Configuration endpoint is not responding. Contact system support." : "Establish your institution's billing rules by adding a new fee item."}
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructures;