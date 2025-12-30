
import React, { useState, useEffect } from 'react';
import { Heart, User, ArrowRight, TrendingUp, AlertCircle, CreditCard, Loader2, Inbox, CalendarCheck, Trophy, UserPlus, Save } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';

const GuardianPortal: React.FC = () => {
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [childStats, setChildStats] = useState<any>(null);
  const [isChildLoading, setIsChildLoading] = useState(false);

  const fetchWards = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/guardian/children'); // GET api/v1/guardian/children
      setWards(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load guardian wards", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const [linkData, setLinkData] = useState({ ward_code: '' });
  const { submit: submitLink, isSubmitting: isLinking } = useFormSubmit(
    (data) => api.post('/guardian/link-ward', data), // POST api/v1/guardian/link-ward
    {
      onSuccess: () => {
        setIsLinkModalOpen(false);
        fetchWards();
      }
    }
  );

  const handleViewChildDetails = async (child: any) => {
    setSelectedChild(child);
    setIsChildLoading(true);
    try {
      const [attRes, feeRes, resRes] = await Promise.all([
        api.get(`/guardian/children/${child.id}/attendance`),
        api.get(`/guardian/children/${child.id}/fees`),
        api.get(`/guardian/children/${child.id}/results`)
      ]);
      setChildStats({
        attendance: attRes.data.data || attRes.data,
        fees: feeRes.data.data || feeRes.data,
        results: resRes.data.data || resRes.data
      });
    } catch (err) {
      console.error("Failed to fetch ward telemetry", err);
    } finally {
      setIsChildLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-500 to-orange-600 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Heart className="fill-white" />
            <h2 className="text-2xl font-bold tracking-tight">Parental Oversight Console</h2>
          </div>
          <p className="text-orange-50 font-medium">Real-time academic telemetry for linked wards.</p>
        </div>
        <button onClick={() => setIsLinkModalOpen(true)} className="px-6 py-3.5 bg-white text-orange-600 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-orange-50 transition-all">
          <UserPlus size={18} /> Link New Child
        </button>
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
                </div>
                <button 
                  onClick={() => handleViewChildDetails(child)}
                  className="p-3 bg-white text-gray-400 group-hover:text-brand-primary rounded-2xl shadow-sm transition-all"
                >
                  <ArrowRight size={24} />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-3 gap-4 border-t border-gray-100">
                <div className="text-center">
                  <TrendingUp size={18} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Attendance</p>
                  <p className="text-sm font-black text-gray-800">{child.attendance_rate || 0}%</p>
                </div>
                <div className="text-center">
                  <AlertCircle size={18} className="text-orange-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Rank</p>
                  <p className="text-sm font-black text-gray-800">#{child.position || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <CreditCard size={18} className="text-green-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Balance</p>
                  <p className="text-sm font-black text-gray-800">${child.balance?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No linked children found for this account.</p>
           <button onClick={() => setIsLinkModalOpen(true)} className="text-brand-primary font-bold hover:underline">Click here to link a child using their school code</button>
        </div>
      )}

      <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Link New Ward">
        <form onSubmit={e => { e.preventDefault(); submitLink(linkData); }} className="space-y-4">
           <p className="text-xs text-gray-500 font-medium">Please enter the unique **Ward Access Code** provided by the school registry to link your child's profile.</p>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Token / Code</label>
              <input 
                required type="text" value={linkData.ward_code} onChange={e => setLinkData({ward_code: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-black text-center tracking-[0.5em] text-lg uppercase"
                placeholder="XXXX-XXXX"
              />
           </div>
           <button type="submit" disabled={isLinking} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
             {isLinking ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Link Profile</>}
           </button>
        </form>
      </Modal>

      <Modal isOpen={!!selectedChild} onClose={() => setSelectedChild(null)} title={`${selectedChild?.full_name} - Detailed Performance`}>
        {isChildLoading ? (
           <div className="flex flex-col items-center py-10 gap-4">
             <Loader2 className="animate-spin text-brand-primary" size={32} />
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Querying Global Ledger...</p>
           </div>
        ) : childStats && (
           <div className="space-y-6">
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <CalendarCheck className="text-brand-primary" />
                   <div><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Attendance Health</p><p className="font-black text-blue-900">{childStats.attendance?.rate || '0'}% Current Term</p></div>
                </div>
                <div className="w-1.5 h-10 bg-blue-200 rounded-full overflow-hidden"><div className="bg-brand-primary h-full" style={{height: `${childStats.attendance?.rate}%`}}></div></div>
              </div>

              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                 <Trophy className="text-green-600" />
                 <div><p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Top Subject</p><p className="font-black text-green-900">{childStats.results?.top_subject || 'Academic Excellence'}</p></div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Financial Settlement Status</h4>
                 <div className="p-4 border border-gray-100 rounded-2xl space-y-2">
                    <div className="flex justify-between text-sm font-bold"><span className="text-gray-400">Total Billed</span><span className="text-gray-800">${childStats.fees?.total_billed?.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm font-bold"><span className="text-gray-400">Amount Paid</span><span className="text-green-600">${childStats.fees?.total_paid?.toLocaleString()}</span></div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-black"><span className="text-gray-800">Outstanding</span><span className="text-red-600">${childStats.fees?.outstanding?.toLocaleString()}</span></div>
                 </div>
              </div>

              <button onClick={() => setSelectedChild(null)} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg">Close Warden View</button>
           </div>
        )}
      </Modal>
    </div>
  );
};

export default GuardianPortal;
