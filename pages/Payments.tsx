
import React, { useState } from 'react';
import { Receipt, Search, Filter, ArrowDownToLine, Download, Loader2, Inbox, MoreVertical, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import { useNotification } from '../context/NotificationContext';

const fetchPaymentsApi = async ({ page, search, filters }: any) => {
  const response = await api.get('/payments', { params: { page, search, ...filters } });
  return response.data;
};

const Payments: React.FC = () => {
  const { data, isLoading, search, setSearch, refresh } = useDataTable(fetchPaymentsApi);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const handleDownloadReceipt = async (id: string) => {
    setDownloadingId(id);
    try {
      const response = await api.get(`/payments/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Receipt generation failed", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      // POST api/v1/payments/{id}/verify
      await api.post(`/payments/${id}/verify`);
      showNotification("Payment reference verified and locked.", 'success');
      refresh();
    } catch (err: any) {
      showNotification(err.message || "Verification protocol failed.", 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const columns = [
    { 
      header: 'Receipt #', 
      key: 'id',
      render: (p: any) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${p.is_verified ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
            <CheckCircle2 size={16} />
          </div>
          <span className="font-black text-brand-primary">{p.receipt_number || `RCP-${p.id}`}</span>
        </div>
      )
    },
    { 
      header: 'Student Identity', 
      key: 'student_name',
      render: (p: any) => (
        <div>
          <p className="text-sm font-bold text-gray-800">{p.student_name}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{p.class_name || 'Individual Pay'}</p>
        </div>
      )
    },
    { header: 'Lump Sum', key: 'amount', render: (p: any) => <span className="font-black text-gray-800">${p.amount?.toLocaleString()}</span> },
    { header: 'Channel', key: 'method', className: 'text-xs font-bold text-gray-500 capitalize' },
    { 
      header: 'Audit Status', 
      key: 'is_verified',
      render: (p: any) => (
        <span className={`text-[9px] font-black uppercase tracking-widest ${p.is_verified ? 'text-green-600' : 'text-orange-500'}`}>
          {p.is_verified ? 'Verified' : 'Pending Audit'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (p: any) => (
        <div className="flex items-center justify-end gap-2">
          {!p.is_verified && (
             <button 
              onClick={() => handleVerify(p.id)}
              disabled={verifyingId === p.id}
              className="p-2 text-brand-primary hover:bg-blue-50 rounded-xl transition-all"
              title="Verify Transaction"
            >
              {verifyingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />}
            </button>
          )}
          <button 
            onClick={() => handleDownloadReceipt(p.id)}
            disabled={downloadingId === p.id}
            className="p-2 text-gray-400 hover:text-brand-primary rounded-xl transition-all"
            title="Download PDF"
          >
            {downloadingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
          </button>
          <button className="p-2 text-gray-300 hover:bg-gray-50 rounded-xl transition-all"><MoreVertical size={18}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Search payment references..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:border-brand-primary transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3.5 bg-gray-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-gray-800/20 hover:bg-black transition-all">
          <ArrowDownToLine size={18} /> Export Settlement Log
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
};

export default Payments;
