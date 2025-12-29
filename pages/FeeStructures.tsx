import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Target, DollarSign, Clock, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const FeeStructures: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/fee-structures');
        setFees(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load fee structures", err);
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
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
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
                  <span className="text-gray-400 uppercase">Target</span>
                  <span className="text-gray-700">{fee.target_classes || 'All Classes'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase">Policy</span>
                  <span className="text-brand-secondary">{fee.frequency || 'Mandatory'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No fee structures defined yet.</p>
        </div>
      )}
    </div>
  );
};

export default FeeStructures;