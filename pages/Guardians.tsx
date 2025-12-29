import React, { useState } from 'react';
import { UserCheck, Search, Mail, Phone, ExternalLink, Plus, Edit2, Trash2 } from 'lucide-react';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchGuardiansApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/guardians', { params: { page, search } });
  return { data: response.data.data, total: response.data.total };
};

const Guardians: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, search, setSearch } = useDataTable(fetchGuardiansApi);

  const columns = [
    { 
      header: 'Guardian Name', 
      key: 'name',
      render: (g: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 text-brand-secondary rounded-xl flex items-center justify-center font-bold">
            <UserCheck size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-800">{g.name}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{g.occupation}</p>
          </div>
        </div>
      )
    },
    { header: 'Contact Email', key: 'email', className: 'text-sm font-medium text-gray-500' },
    { header: 'Phone Number', key: 'phone', className: 'text-sm text-gray-400' },
    { 
      header: 'Linked Wards', 
      key: 'wardsCount',
      render: (g: any) => (
        <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg uppercase">
          {g.wardsCount} Students
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-lg transition-colors"><ExternalLink size={16}/></button>
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-lg transition-colors"><Edit2 size={16}/></button>
          <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
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
            placeholder="Search guardian records..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Add Guardian
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Parent/Guardian">
        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">Guardian Full Name</label>
            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Mobile Number</label>
              <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">Occupation</label>
              <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium" />
            </div>
          </div>
          <button className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-4">
            Create Profile
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Guardians;