
import React, { useState } from 'react';
import { Wallet, Plus, Target, Users, Loader2, Inbox, Save, ShieldCheck, CheckSquare, Calendar, FileText } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const fetchFeesApi = async (params: any) => {
  const res = await api.get('/fees', { params });
  return res.data;
};

const Fees: React.FC = () => {
  const { data, isLoading, refresh } = useDataTable(fetchFeesApi);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const { options: feeTypeOptions } = useSelectOptions('/fee-types');
  const { options: sessionOptions } = useSelectOptions('/school-sessions');
  const { options: termOptions } = useSelectOptions('/terms');
  const { options: classOptions } = useSelectOptions('/classes');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    fee_type: '',
    session_id: '',
    term_id: '',
    class_id: '',
    due_date: '',
    is_mandatory: '1',
    description: ''
  });

  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/fees', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        refresh();
      }
    }
  );

  const columns = [
    { 
      header: 'Institutional Item', 
      key: 'title',
      render: (f: any) => (
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center"><Wallet size={18} /></div>
           <div><p className="font-bold text-gray-800">{f.title}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{f.fee_type}</p></div>
        </div>
      )
    },
    { header: 'Lump Sum', key: 'amount', render: (f: any) => <span className="font-black text-gray-800">${f.amount?.toLocaleString()}</span> },
    { header: 'Due Date', key: 'due_date', className: 'text-xs font-bold text-red-500' },
    { 
      header: 'Status', 
      key: 'is_mandatory',
      render: (f: any) => <span className={`text-[10px] font-black uppercase ${f.is_mandatory ? 'text-orange-500' : 'text-gray-400'}`}>{f.is_mandatory ? 'Mandatory' : 'Optional'}</span>
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financial Fees Registry</h2>
          <p className="text-sm text-gray-500 font-medium">Standardized institutional billing schedules</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg">
          <Plus size={18} /> Define Fee Cycle
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initialize Fee Schedule">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee Narrative (Title)</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" placeholder="e.g. First Term Tuition 2024" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee Type</label>
                <select required value={formData.fee_type} onChange={e => setFormData({...formData, fee_type: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                  <option value="">Select Type</option>
                  {feeTypeOptions.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                  <option value="">All Classes</option>
                  {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session</label>
                <select required value={formData.session_id} onChange={e => setFormData({...formData, session_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                  <option value="">Select Session</option>
                  {sessionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Term</label>
                <select required value={formData.term_id} onChange={e => setFormData({...formData, term_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                  <option value="">Select Term</option>
                  {termOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount ($)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                <input required type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
              </div>
           </div>
           <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
             {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Commit Fee Definition</>}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
