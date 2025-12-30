
import React, { useState, useEffect } from 'react';
import { Receipt, Search, Plus, Download, MoreVertical, CheckCircle2, Loader2, Layers, Save, School, Calendar, User, Trash2, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { Invoice } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import StatsCard from '../components/common/StatsCard';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';
import api from '../services/api';

const fetchInvoicesApi = async ({ page, search, filters }: any) => {
  const response = await api.get('/invoices', { params: { page, search, ...filters } });
  return response.data;
};

const Invoices: React.FC = () => {
  const { data, isLoading, search, setSearch, refresh } = useDataTable<Invoice>(fetchInvoicesApi);
  const [stats, setStats] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const { options: studentOptions } = useSelectOptions('/students');
  const { options: classOptions } = useSelectOptions('/classes');
  const { options: sessionOptions } = useSelectOptions('/school-sessions');
  const { options: termOptions } = useSelectOptions('/terms');

  useEffect(() => {
    api.get('/finance/overview').then(res => setStats(res.data.data || res.data));
  }, []);

  const [manualInvoice, setManualInvoice] = useState({
    student_id: '',
    due_date: new Date().toISOString().split('T')[0],
    session_id: '',
    term_id: '',
    notes: '',
    items: [{ name: '', amount: '' }]
  });

  const [bulkData, setBulkData] = useState({ session_id: '', term_id: '', class_id: '' });

  const { submit: submitBulk, isSubmitting: isBulkSubmitting } = useFormSubmit(
    (data) => api.post('/invoices/bulk-generate', data),
    { onSuccess: () => { setIsBulkModalOpen(false); refresh(); } }
  );

  const { submit: submitManual, isSubmitting: isManualSubmitting } = useFormSubmit(
    (data) => api.post('/invoices', data),
    { onSuccess: () => { setIsManualModalOpen(false); refresh(); setManualInvoice({ student_id: '', due_date: '', session_id: '', term_id: '', notes: '', items: [{ name: '', amount: '' }] }); } }
  );

  const handleMarkAsPaid = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/invoices/${id}/mark-as-paid`);
      refresh();
    } catch (err) { console.error(err); } finally { setProcessingId(null); }
  };

  const addItem = () => setManualInvoice({...manualInvoice, items: [...manualInvoice.items, { name: '', amount: '' }]});
  const removeItem = (index: number) => setManualInvoice({...manualInvoice, items: manualInvoice.items.filter((_, i) => i !== index)});
  const updateItem = (index: number, field: 'name' | 'amount', value: string) => {
    const newItems = [...manualInvoice.items];
    newItems[index][field] = value;
    setManualInvoice({...manualInvoice, items: newItems});
  };

  const columns = [
    { 
      header: 'Reference', 
      key: 'id',
      render: (inv: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100"><Receipt size={18} /></div>
          <div>
            <p className="font-bold text-sm text-brand-primary">{inv.id}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{inv.type || 'Institutional'} Billing</p>
          </div>
        </div>
      )
    },
    { header: 'Student Identity', key: 'student_name', render: (inv: Invoice) => <span className="font-bold text-gray-700">{inv.student_name}</span> },
    { header: 'Lump Sum', key: 'amount', render: (inv: Invoice) => <span className="font-black text-gray-800">${inv.amount?.toLocaleString()}</span> },
    { 
      header: 'Settlement', 
      key: 'status',
      render: (inv: Invoice) => (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
          inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
          inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {inv.status}
        </span>
      )
    },
    { header: 'Maturity', key: 'due_date', className: 'text-xs font-bold text-gray-400' },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (inv: Invoice) => (
        <div className="flex items-center justify-end gap-2">
          {inv.status !== 'Paid' && (
            <button onClick={() => handleMarkAsPaid(inv.id)} disabled={processingId === inv.id} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all">
              {processingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18}/>}
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-xl transition-all"><Download size={18}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards Required by Specification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Total Invoiced" value={`$${(stats?.total_billed || 0).toLocaleString()}`} icon={DollarSign} color="bg-brand-primary" />
        <StatsCard label="Total Collected" value={`$${(stats?.total_paid || 0).toLocaleString()}`} icon={Wallet} color="bg-green-600" />
        <StatsCard label="Total Outstanding" value={`$${(stats?.total_outstanding || 0).toLocaleString()}`} icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Filter financial ledger..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsBulkModalOpen(true)} className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
             <Layers size={18} /> Bulk Run
           </button>
           <button onClick={() => setIsManualModalOpen(true)} className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Bulk Billing Protocol">
         <form onSubmit={(e) => { e.preventDefault(); submitBulk(bulkData); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
              <select required value={bulkData.class_id} onChange={e => setBulkData({...bulkData, class_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                 <option value="">Select Level</option>
                 {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session</label>
                 <select required value={bulkData.session_id} onChange={e => setBulkData({...bulkData, session_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                   <option value="">Select Cycle</option>
                   {sessionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Term</label>
                 <select required value={bulkData.term_id} onChange={e => setBulkData({...bulkData, term_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                   <option value="">Select Term</option>
                   {termOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
               </div>
            </div>
            <button type="submit" disabled={isBulkSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
              {isBulkSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Initiate Bulk Run</>}
            </button>
         </form>
      </Modal>

      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Manual Billing Artifact">
         <form onSubmit={(e) => { e.preventDefault(); submitManual(manualInvoice); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Student</label>
              <select required value={manualInvoice.student_id} onChange={e => setManualInvoice({...manualInvoice, student_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Lookup Student...</option>
                {studentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ledger Items</label>
                <button type="button" onClick={addItem} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">+ Add Row</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {manualInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-right-2">
                    <input required placeholder="Item Narrative" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold" />
                    <input required type="number" placeholder="Amt" value={item.amount} onChange={e => updateItem(idx, 'amount', e.target.value)} className="w-20 p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-black text-center" />
                    {manualInvoice.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cycle (Session)</label>
                 <select required value={manualInvoice.session_id} onChange={e => setManualInvoice({...manualInvoice, session_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                   <option value="">Select Cycle</option>
                   {sessionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                 <input type="date" value={manualInvoice.due_date} onChange={e => setManualInvoice({...manualInvoice, due_date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
               </div>
            </div>
            
            <button type="submit" disabled={isManualSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2 mt-4">
              {isManualSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Commit to Ledger</>}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default Invoices;
