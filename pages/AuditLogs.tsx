
import React, { useState } from 'react';
import { History, Info, Search, Loader2, Inbox, ChevronRight, User, Clock, Terminal } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';

const fetchAuditLogsApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/audit', { params: { page, search } }); // Matching provided routes
  return response.data;
};

const AuditLogs: React.FC = () => {
  const { data, isLoading, search, setSearch } = useDataTable(fetchAuditLogsApi);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const columns = [
    { 
      header: 'Platform Action', 
      key: 'action',
      render: (log: any) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
            log.level === 'danger' ? 'bg-red-50 text-red-500 border-red-100' : 
            'bg-blue-50 text-brand-primary border-blue-100'
          }`}>
            <Info size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{log.action}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.school?.name || 'SYSTEM CORE'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Actor', 
      key: 'user_name', 
      render: (log: any) => (
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">{log.user?.name?.[0] || 'U'}</div>
           <span className="text-sm font-bold text-gray-600">{log.user?.name || log.user_name}</span>
        </div>
      )
    },
    { header: 'IP Address', key: 'ip_address', className: 'text-xs font-mono text-gray-400' },
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
            <History className="text-gray-400" />
            Immutable Audit Trail
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Security logging for all administrative events</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input 
            type="text" placeholder="Search system events..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <DataTable 
        columns={columns} data={data} isLoading={isLoading} 
        onRowClick={(log) => setSelectedLog(log)}
      />

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Event Trace">
        {selectedLog && (
          <div className="space-y-6">
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-primary">
                 <Terminal size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-gray-800">{selectedLog.action}</h4>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedLog.target || 'Resource Operation'}</p>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Payload</label>
               <div className="p-4 bg-gray-900 rounded-2xl overflow-x-auto text-xs font-mono text-emerald-400 custom-scrollbar">
                 <pre>{JSON.stringify(selectedLog.properties || selectedLog.payload || { info: "No details" }, null, 2)}</pre>
               </div>
            </div>

            <button onClick={() => setSelectedLog(null)} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg">
              Close Detail
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
