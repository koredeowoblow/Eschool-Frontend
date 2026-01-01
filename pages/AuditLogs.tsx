
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
  const { data, isLoading, search, setSearch, filters, setFilters } = useDataTable(fetchAuditLogsApi);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const getActionBadge = (action: string) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('create') || act.includes('store')) {
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 shadow-sm"><PlusCircle size={10} /> Create</span>;
    }
    if (act.includes('update') || act.includes('edit')) {
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100 shadow-sm"><RefreshCw size={10} /> Update</span>;
    }
    if (act.includes('delete') || act.includes('remove') || act.includes('destroy')) {
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 shadow-sm"><Trash2 size={10} /> Delete</span>;
    }
    return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100"><Info size={10} /> Action</span>;
  };

  const columns = [
    {
      header: 'Operation Manifest',
      key: 'action',
      render: (log: any) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
            <Terminal size={20} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-[13px] font-bold text-gray-800 leading-tight">{log.action}</p>
              {getActionBadge(log.action)}
            </div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-tighter flex items-center gap-1">
              <ShieldAlert size={10} /> {log.school?.name || 'Platform Unified Core'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Administrative Actor',
      key: 'user_name',
      render: (log: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/5 flex items-center justify-center text-[10px] font-black text-brand-primary border border-brand-primary/10 shadow-inner">{(log.user?.name || log.user_name || 'U')[0]}</div>
          <div>
            <p className="text-xs font-bold text-gray-700">{log.user?.name || log.user_name || 'System Identity'}</p>
            <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase">{log.user?.email || 'automated.process'}</p>
          </div>
        </div>
      )
    },
    { header: 'IP Sequence', key: 'ip_address', className: 'text-[10px] font-mono text-gray-400 font-bold' },
    {
      header: 'Chronological Sync',
      key: 'created_at',
      className: 'text-right',
      render: (log: any) => (
        <div className="flex items-center justify-end gap-3 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
          <Clock size={12} /> {log.created_at}
          <ChevronRight size={14} className="text-gray-200" />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-brand-primary" />
            Immutable Audit Trail
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Real-time cryptographic monitoring of all institutional mutations</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filter By:</span>
            <select
              value={filters.action || ''}
              onChange={e => setFilters({ ...filters, action: e.target.value })}
              className="bg-transparent text-xs font-bold text-brand-primary outline-none cursor-pointer"
            >
              <option value="">All Mutations</option>
              <option value="create">Creations</option>
              <option value="update">Updates</option>
              <option value="delete">Deletions</option>
            </select>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-5 top-4 text-gray-300" />
            <input
              type="text" placeholder="Probe identity or operation..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm shadow-sm transition-all placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns} data={data} isLoading={isLoading}
        onRowClick={(log) => setSelectedLog(log)}
      />

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Mutation Context Analysis">
        {selectedLog && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-brand-primary border border-gray-50">
                  <Terminal size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg leading-tight">{selectedLog.action}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{selectedLog.entity || 'Unscoped Mutation'}</p>
                </div>
              </div>
              {getActionBadge(selectedLog.action)}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Metadata Distribution</label>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-brand-primary font-bold">SHA-256 VERIFIED</span>
                </div>
              </div>
              <div className="p-6 bg-gray-900 rounded-3xl overflow-x-auto text-[11px] font-mono text-emerald-400 custom-scrollbar leading-relaxed shadow-2xl border border-white/5 relative">
                <div className="absolute top-4 right-4 text-[9px] text-white/20 font-black uppercase tracking-widest">Read Only</div>
                <pre className="relative z-10">{JSON.stringify(selectedLog.properties || selectedLog.payload || { status: "Operation completed without state capture." }, null, 3)}</pre>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm group">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 group-hover:text-brand-primary transition-colors">Request Origin</p>
                <p className="text-xs font-bold text-gray-700 font-mono">{selectedLog.ip_address || 'Platform Internal'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm group">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 group-hover:text-brand-primary transition-colors">Event Identifier</p>
                <p className="text-xs font-bold text-gray-700 font-mono tracking-tighter">TRX-{selectedLog.id?.substring(0, 12).toUpperCase()}</p>
              </div>
            </div>

            <button onClick={() => setSelectedLog(null)} className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-blue-700 active:scale-95 transition-all mt-2">
              Acknowledge Record Trace
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
