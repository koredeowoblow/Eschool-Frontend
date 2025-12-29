import React, { useState, useEffect } from 'react';
import { Heart, User, ArrowRight, TrendingUp, AlertCircle, CreditCard, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const GuardianPortal: React.FC = () => {
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWards = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/guardian/children');
        setWards(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load guardian wards", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWards();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <Heart className="fill-white" />
          <h2 className="text-2xl font-bold">Guardian Dashboard</h2>
        </div>
        <p className="text-orange-50 font-medium">Monitoring the academic success of your loved ones.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-secondary" size={32} /></div>
      ) : wards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {wards.map(child => (
            <div key={child.id} className="card-premium overflow-hidden group hover:shadow-2xl transition-all">
              <div className="p-6 flex items-center gap-6 bg-gray-50/50">
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-md bg-gray-200 flex items-center justify-center">
                  {child.avatar ? <img src={child.avatar} className="w-full h-full object-cover" alt="" /> : <User size={32} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{child.full_name}</h3>
                  <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">{child.class_room?.name || 'Class Unassigned'}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    child.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${child.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    {child.status ? 'In School' : 'Closed'}
                  </span>
                </div>
                <button className="p-3 bg-white text-gray-400 group-hover:text-brand-primary rounded-2xl shadow-sm transition-all">
                  <ArrowRight size={24} />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-3 gap-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Attendance</p>
                  <p className="text-sm font-black text-gray-800">{child.attendance_rate || 0}%</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-50 text-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-2">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Results</p>
                  <p className="text-sm font-black text-gray-800">{child.last_grade || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                    child.fees_status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <CreditCard size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Fees</p>
                  <p className={`text-sm font-black ${child.fees_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{child.fees_status || 'Unpaid'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No linked children found for this account.</p>
        </div>
      )}
    </div>
  );
};

export default GuardianPortal;