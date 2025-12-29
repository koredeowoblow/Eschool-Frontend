import React, { useState } from 'react';
import { Search, Plus, UserCircle, Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import { Teacher } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchTeachersApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/teachers', { params: { page, search } });
  return { data: response.data.data, total: response.data.total };
};

const Teachers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, search, setSearch } = useDataTable(fetchTeachersApi);

  const columns = [
    { 
      header: 'Staff Member', 
      key: 'name',
      render: (t: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center font-bold">
            {t.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-gray-800">{t.name}</p>
            {/* Fix: Changed employeeNo to employee_number to match Teacher type */}
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.employee_number}</p>
          </div>
        </div>
      )
    },
    { header: 'Designation', key: 'designation', className: 'text-sm font-medium text-gray-500' },
    { header: 'Email', key: 'email', className: 'text-sm text-gray-400' },
    { 
      header: 'Status', 
      key: 'status',
      render: (t: Teacher) => (
        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-full ${
          t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {t.status}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (t: Teacher) => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-lg"><Edit2 size={16}/></button>
          <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={16}/></button>
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
            placeholder="Search academic staff..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary transition-all"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Hire Teacher
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Academic Staff">
        <form className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase">Full Name</label>
             <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Designation</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Employee ID</label>
                <input type="text" placeholder="TCH-XXX" disabled className="w-full p-3 bg-gray-100 border border-gray-100 rounded-xl font-medium" />
              </div>
           </div>
           <button className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-4">
             Add Staff Member
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;