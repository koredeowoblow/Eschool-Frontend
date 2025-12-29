import React, { useState } from 'react';
import { Receipt, Search, Plus, Filter, Download, MoreVertical, CreditCard } from 'lucide-react';
import { Invoice } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import api from '../services/api';

const fetchInvoicesApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/invoices', { params: { page, search } });
  return { data: response.data.data, total: response.data.total };
};

const Invoices: React.FC = () => {
  const { data, isLoading, search, setSearch } = useDataTable(fetchInvoicesApi);

  const columns = [
    { 
      header: 'Invoice Reference', 
      key: 'id',
      render: (inv: Invoice) => (
        <div>
          <p className="font-bold text-sm text-brand-primary">{inv.id}</p>
          <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5">{inv.type} Billing</p>
        </div>
      )
    },
    { 
      header: 'Recipient', 
      key: 'student_name',
      render: (inv: Invoice) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
           {/* Fix: Changed studentName to student_name */}
           <CreditCard size={14} className="text-gray-400"/> {inv.student_name}
        </div>
      )
    },
    { 
      header: 'Amount', 
      key: 'amount', 
      render: (inv: Invoice) => (
        <span className="font-black text-gray-800">${inv.amount.toLocaleString()}</span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (inv: Invoice) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
          inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {inv.status}
        </span>
      )
    },
    { header: 'Due Date', key: 'dueDate', className: 'text-sm font-medium text-gray-400' },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (inv: Invoice) => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-lg"><Download size={18}/></button>
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-lg"><MoreVertical size={18}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by student or invoice..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Generate Invoices
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
};

export default Invoices;