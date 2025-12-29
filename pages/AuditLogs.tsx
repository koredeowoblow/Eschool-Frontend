
import React, { useState, useEffect } from 'react';
import { History, Shield, Info, AlertTriangle, Search, Filter, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';

const fetchAuditLogsApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/audit-logs', { params: { page, search } });
  return response.data;
};

const AuditLogs: React.FC = () => {
  const { data, isLoading, search, setSearch, page, lastPage } = useDataTable(fetchAuditLogsApi);

  const columns = [
    { 
      header: 'Action', 
      key: 'action',
      render: (log: any) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            log.level === 'danger' ? 'bg-red-50 text-red-500' : 
            log.level === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-brand-primary'
          }`}>
            <Info size={16} />
          </div>
          <span className="text-sm font-bold text-gray-700">{log.action}</span>
        </div>
      )
    },
    { header: 'User', key: 'user_name', className: 'text-sm font-medium text-gray-500' },
    { header: 'Resource', key: 'target', className: 'text-xs font-black text-gray-400 uppercase tracking-tight' },
    { header: 'Timestamp', key: 'created_at', className: 'text-right text-xs font-bold text-gray-400' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <History className="text-gray-400" />
            System Audit Logs
          </h2>
          <p className="text-sm text-gray-500 font-medium">Tracking all administrative actions for transparency</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all">
            Export Logs
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
           <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-medium outline-none focus:ring-2 ring-brand-primary/10 transition-all" 
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AuditLogs;
