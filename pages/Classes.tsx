
import React, { useState } from 'react';
import { School, Plus, Users, Book, Search, Edit2, Trash2, Loader2, UserCheck } from 'lucide-react';
import { ClassRoom } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import { useSelectOptions } from '../hooks/useSelectOptions';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchClassesApi = async ({ page, search }: { page: number, search: string }) => {
  const response = await api.get('/classes', { params: { page, search } });
  return response.data;
};

const Classes: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading, search, setSearch, refresh } = useDataTable<ClassRoom>(fetchClassesApi as any);
  
  // Dynamic Options from API
  const { options: sectionOptions, isLoading: isLoadingSections } = useSelectOptions('/sections');
  const { options: teacherOptions, isLoading: isLoadingTeachers } = useSelectOptions('/teachers');

  const [formData, setFormData] = useState({
    name: '',
    section_id: '',
    teacher_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/classes', formData);
      setIsModalOpen(false);
      setFormData({ name: '', section_id: '', teacher_id: '' });
      refresh();
    } catch (err) {
      console.error("Failed to create class", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Class Name', 
      key: 'name',
      render: (c: ClassRoom) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
            <School size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-800">{c.name}</p>
            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{c.section?.name || 'No Section'}</p>
          </div>
        </div>
      )
    },
    { header: 'Form Teacher', key: 'form_teacher', className: 'text-sm font-medium text-gray-500' },
    { 
      header: 'Statistics', 
      key: 'students_count',
      render: (c: ClassRoom) => (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <Users size={12}/> {c.students_count} Students
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <Book size={12}/> {c.subjects_count} Subjects
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (c: ClassRoom) => (
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
            placeholder="Filter class registry..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary shadow-sm transition-all"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Create Class
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define New Class">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Label</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Grade 10 Alpha" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Section</label>
            <div className="relative">
              <select 
                required
                value={formData.section_id}
                onChange={(e) => setFormData({...formData, section_id: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none transition-all"
              >
                <option value="">Select Section</option>
                {sectionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {isLoadingSections && <Loader2 className="absolute right-4 top-4 animate-spin text-gray-400" size={16} />}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Form Teacher</label>
            <div className="relative">
              <select 
                value={formData.teacher_id}
                onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none transition-all"
              >
                <option value="">Assign Teacher (Optional)</option>
                {teacherOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {isLoadingTeachers && <Loader2 className="absolute right-4 top-4 animate-spin text-gray-400" size={16} />}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Initialize Class Record"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;
