
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserCircle, Mail, Phone, Edit2, Trash2, Loader2, Link as LinkIcon } from 'lucide-react';
import { Teacher } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import { useSelectOptions } from '../hooks/useSelectOptions';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchTeachersApi = async (params: any) => {
  const response = await api.get('/teachers', { params });
  return response.data;
};

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading, search, setSearch, refresh } = useDataTable<Teacher>(fetchTeachersApi);
  
  const { options: subjectOptions, isLoading: isLoadingSubjects } = useSelectOptions('/subjects');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: 'Lead Teacher',
    subject_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/teachers', formData);
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      console.error("Failed to hire teacher", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Staff Member', 
      key: 'name',
      render: (t: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center font-bold">
            {t.name?.[0] || 'T'}
          </div>
          <div>
            <p className="font-bold text-gray-800">{t.name}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.employee_number || 'STF-NEW'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Department Info', 
      key: 'designation', 
      render: (t: Teacher) => (
        <div>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase mr-2">{t.designation}</span>
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">{t.qualification || 'Certified'}</span>
        </div>
      )
    },
    { header: 'Email', key: 'email', className: 'text-sm text-gray-400' },
    { 
      header: 'Status', 
      key: 'status',
      render: (t: Teacher) => (
        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-full ${
          t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {t.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (t: Teacher) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/subject-assignments?teacher_id=${t.id}`); }}
            className="p-2 text-gray-400 hover:text-brand-primary rounded-lg transition-colors"
            title="View Subject Assignments"
          >
            <LinkIcon size={16}/>
          </button>
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
            placeholder="Search academic staff registry..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision Academic Staff">
        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
             <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800" placeholder="e.g. Dr. Jane Smith" />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
             <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800" placeholder="jane.smith@school.edu" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Subject</label>
                <div className="relative">
                  <select 
                    value={formData.subject_id} 
                    onChange={e => setFormData({...formData, subject_id: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800 outline-none focus:border-brand-primary appearance-none"
                  >
                    <option value="">Select Domain</option>
                    {subjectOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {isLoadingSubjects && <Loader2 className="absolute right-3 top-3.5 animate-spin text-gray-400" size={16} />}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee Number</label>
                <input type="text" placeholder="Auto-gen" disabled className="w-full p-3.5 bg-gray-100 border border-gray-100 rounded-xl font-bold text-gray-400 cursor-not-allowed" />
              </div>
           </div>
           <button 
             type="submit" 
             disabled={isSubmitting}
             className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-4 flex items-center justify-center gap-2"
           >
             {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Authorize Appointment"}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
