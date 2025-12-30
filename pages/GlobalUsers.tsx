
import React from 'react';
import { Globe, Search, User, Shield, Mail, Trash2, Edit2, Loader2, Inbox } from 'lucide-react';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import api from '../services/api';

const fetchGlobalUsersApi = async (params: any) => {
  const response = await api.get('/users', { params }); // Matching provided routes
  return response.data;
};

const GlobalUsers: React.FC = () => {
  const { data, isLoading, search, setSearch } = useDataTable(fetchGlobalUsersApi);

  const columns = [
    { 
      header: 'Identity', 
      key: 'name',
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 overflow-hidden">
            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0] || 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-800">{u.name}</p>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{u.role}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Organization', 
      key: 'school_name',
      render: (u: any) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
           <Shield size={14} className="text-brand-primary" /> {u.school?.name || u.school_name || 'System Level'}
        </div>
      )
    },
    { header: 'Email Address', key: 'email', className: 'text-sm text-gray-400' },
    { 
      header: 'Status', 
      key: 'status',
      render: (u: any) => (
        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
          u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {u.is_active !== false ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-gray-300 hover:text-brand-primary transition-all"><Edit2 size={16}/></button>
          <button className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Globe className="text-brand-primary" />
            Global User Registry
          </h2>
          <p className="text-sm text-gray-500 font-medium">Monitoring all accounts across the platform</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input 
            type="text" placeholder="Search global registry..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
};

export default GlobalUsers;
