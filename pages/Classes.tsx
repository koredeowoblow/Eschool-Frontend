
import React, { useState } from 'react';
import { School, Plus, Users, Book, Search, Edit2, Trash2, Loader2, UserCheck, Settings, Save } from 'lucide-react';
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
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  
  const { data, isLoading, search, setSearch, refresh } = useDataTable<ClassRoom>(fetchClassesApi as any);
  const { options: sectionOptions } = useSelectOptions('/sections');
  const { options: teacherOptions } = useSelectOptions('/teachers');
  const { options: subjectOptions } = useSelectOptions('/subjects');

  const [formData, setFormData] = useState({ name: '', section_id: '', teacher_id: '' });
  const [subjectMapping, setSubjectMapping] = useState({ teacher_id: '', subject_id: '' });

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

  const handleManageSubjects = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Specialized sync endpoint from spec
      await api.post('/teacher-subjects', {
        ...subjectMapping,
        class_id: selectedClass.id
      });
      setIsManageSubjectsOpen(false);
      refresh();
    } catch (err) {
      console.error("Subject mapping failed", err);
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
            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{c.section?.name || 'Academic Unit'}</p>
          </div>
        </div>
      )
    },
    { header: 'Form Teacher', key: 'form_teacher', className: 'text-sm font-bold text-gray-600' },
    { 
      header: 'Nested Statistics', 
      key: 'students_count',
      render: (c: ClassRoom) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg border border-gray-100 flex items-center gap-1">
            <Users size={10} className="text-brand-primary" /> {c.students_count || 0}
          </span>
          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg border border-gray-100 flex items-center gap-1">
            <Book size={10} className="text-orange-500" /> {c.subjects_count || 0}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (c: any) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedClass(c); setIsManageSubjectsOpen(true); }}
            className="p-2 text-gray-400 hover:text-brand-primary rounded-lg transition-colors"
            title="Manage Faculty Mapping"
          >
            <Settings size={16}/>
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
            placeholder="Search institutional units..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Create Class
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Institutional Unit">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Label</label>
            <input 
              required type="text" placeholder="e.g. Grade 10 Alpha" value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Section</label>
            <select 
              required value={formData.section_id}
              onChange={(e) => setFormData({...formData, section_id: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none transition-all"
            >
              <option value="">Select Division</option>
              {sectionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lead Authority (Form Teacher)</label>
            <select 
              value={formData.teacher_id}
              onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none transition-all"
            >
              <option value="">Assign Authority</option>
              {teacherOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Initialize Record</>}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isManageSubjectsOpen} onClose={() => setIsManageSubjectsOpen(false)} title={`Faculty Mapping: ${selectedClass?.name}`}>
         <form onSubmit={handleManageSubjects} className="space-y-5">
            <p className="text-xs text-gray-500 font-medium italic leading-relaxed">Synchronize academic faculty and subject domains to this class unit.</p>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Domain</label>
               <select required value={subjectMapping.subject_id} onChange={e => setSubjectMapping({...subjectMapping, subject_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                  <option value="">Select Subject</option>
                  {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Specialist (Teacher)</label>
               <select required value={subjectMapping.teacher_id} onChange={e => setSubjectMapping({...subjectMapping, teacher_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                  <option value="">Select Teacher</option>
                  {teacherOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
               </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
               {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Commit Mapping</>}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default Classes;
