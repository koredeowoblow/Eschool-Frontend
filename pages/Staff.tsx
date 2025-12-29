import React, { useState } from 'react';
import { Search, Plus, Mail, Shield, User, Edit2, Trash2, Loader2 } from 'lucide-react';
import { StaffMember } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import { useSelectOptions } from '../hooks/useSelectOptions';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchStaffApi = async (params: any) => {
  const response = await api.get('/staff', { params });
  return response.data;
};

const Staff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading, search, setSearch, refresh } = useDataTable<StaffMember>(fetchStaffApi);
  
  // Dynamic Options (Departments)
  const { options: deptOptions, isLoading: isLoadingDepts } = useSelectOptions('/departments');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    department_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/staff', formData);
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      console.error("Staff onboarding failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Staff Member', 
      key: 'name',
      render: (s: StaffMember) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center font-bold">
            <User size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-800">{s.name}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.employee_number || 'STF-REF'}</p>
          </div>
        </div>
      )
    },
    { header: 'Role', key: 'designation', className: 'text-sm font-medium text-gray-500' },
    { 
      header: 'Department', 
      key: 'department',
      render: (s: StaffMember) => (
        <span className="px-3 py-1 bg-blue-50 text-brand-primary text-[10px] font-bold rounded-lg uppercase">{s.department || 'N/A'}</span>
      )
    },
    { header: 'Email', key: 'email', className: 'text-sm text-gray-400' },
    { 
      header: 'Status', 
      key: 'status',
      render: (s: StaffMember) => (
        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-full ${
          s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {s.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: () => (
        <div className="flex items-center justify-end gap-1">
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
            placeholder="Search staff directory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary shadow-sm transition-all"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Onboard Staff
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Staff Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800" placeholder="e.g. Samuel Adewale" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
              <div className="relative">
                <select 
                  required
                  value={formData.department_id}
                  onChange={e => setFormData({...formData, department_id: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none"
                >
                  <option value="">Select Dept</option>
                  {deptOptions.length > 0 ? deptOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )) : (
                    <>
                      <option value="1">Registry</option>
                      <option value="2">Finance</option>
                      <option value="3">IT Support</option>
                    </>
                  )}
                </select>
                {isLoadingDepts && <Loader2 className="absolute right-3 top-3.5 animate-spin text-gray-400" size={16} />}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee No</label>
              <input type="text" placeholder="Auto-generated" disabled className="w-full p-3.5 bg-gray-100 border border-gray-100 rounded-xl font-bold text-gray-400 cursor-not-allowed" />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Initialize Account"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;