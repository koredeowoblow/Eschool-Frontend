
import React, { useState } from 'react';
import { History, Info, Search, Loader2, Inbox, ChevronRight, User, Clock, Terminal, ShieldAlert, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';

const fetchAuditLogsApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/audit', { params: { page, search } });
  return response.data;
};

const AuditLogs: React.FC = () => {
  const { data, isLoading, search, setSearch } = useDataTable(fetchAuditLogsApi);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const getActionBadge = (action: string) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('create') || act.includes('store')) {
      return <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100"><PlusCircle size={10}/> Create</span>;
    }
    if (act.includes('update') || act.includes('edit')) {
      return <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100"><RefreshCw size={10}/> Update</span>;
    }
    if (act.includes('delete') || act.includes('remove') || act.includes('destroy')) {
      return <span className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-100"><Trash2 size={10}/> Delete</span>;
    }
    return <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-100"><Info size={10}/> Action</span>;
  };

  const columns = [
    { 
      header: 'Operation', 
      key: 'action',
      render: (log: any) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
            <Terminal size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-gray-800">{log.action}</p>
              {getActionBadge(log.action)}
            </div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">{log.school?.name || 'Platform Core'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Administrative Actor', 
      key: 'user_name', 
      render: (log: any) => (
        <div className="flex items-center gap-3">
           <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-black text-brand-primary border border-brand-primary/10">{(log.user?.name || log.user_name || 'U')[0]}</div>
           <span className="text-xs font-bold text-gray-600">{log.user?.name || log.user_name || 'System Admin'}</span>
        </div>
      )
    },
    { header: 'Source IP', key: 'ip_address', className: 'text-[10px] font-mono text-gray-400 font-bold' },
    { 
      header: 'Timestamp', 
      key: 'created_at', 
      className: 'text-right',
      render: (log: any) => (
        <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-400">
          <Clock size={12}/> {log.created_at}
          <ChevronRight size={14} className="text-gray-300" />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-brand-primary" />
            Security Audit Trail
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Real-time immutable monitoring of all institutional mutations</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input 
            type="text" placeholder="Filter by event or actor..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <DataTable 
        columns={columns} data={data} isLoading={isLoading} 
        onRowClick={(log) => setSelectedLog(log)}
      />

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Context Analysis">
        {selectedLog && (
          <div className="space-y-6">
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-primary">
                    <Terminal size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{selectedLog.action}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedLog.target || 'Database Mutation'}</p>
                  </div>
               </div>
               {getActionBadge(selectedLog.action)}
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metadata Payload</label>
                 <span className="text-[9px] font-mono text-brand-primary font-bold">JSON V1.0</span>
               </div>
               <div className="p-5 bg-gray-900 rounded-3xl overflow-x-auto text-[11px] font-mono text-emerald-400 custom-scrollbar leading-relaxed shadow-2xl border border-white/5">
                 <pre>{JSON.stringify(selectedLog.properties || selectedLog.payload || { info: "No additional metadata captured for this operation." }, null, 3)}</pre>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
               <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Request Origin</p>
                  <p className="text-xs font-bold text-gray-700">{selectedLog.ip_address || 'Internal'}</p>
               </div>
               <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Auth Token ID</p>
                  <p className="text-xs font-bold text-gray-700">{selectedLog.id?.substring(0, 8)}...</p>
               </div>
            </div>

            <button onClick={() => setSelectedLog(null)} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
              Acknowledge Record
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
