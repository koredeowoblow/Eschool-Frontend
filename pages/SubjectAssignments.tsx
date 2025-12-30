
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, UserCheck, Plus, Search, Loader2, Inbox, Save, Trash2, ArrowRight, FilterX } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const fetchAssignmentsApi = async (params: any) => {
  const res = await api.get('/subject-assignments', { params });
  return res.data;
};

const SubjectAssignments: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const teacherFilter = searchParams.get('teacher_id');
  
  const { data, isLoading, refresh, setFilters, filters } = useDataTable(fetchAssignmentsApi);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { options: teacherOptions } = useSelectOptions('/teachers');
  const { options: subjectOptions } = useSelectOptions('/subjects');

  // Apply teacher filter from URL if present (Section 10 Requirement)
  useEffect(() => {
    if (teacherFilter) {
      setFilters(prev => ({ ...prev, teacher_id: teacherFilter }));
    }
  }, [teacherFilter]);

  const [formData, setFormData] = useState({ teacher_id: teacherFilter || '', subject_id: '' });
  
  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/subject-assignments', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        refresh();
      }
    }
  );

  const clearFilters = () => {
    setSearchParams({});
    setFilters({});
  };

  const columns = [
    { 
      header: 'Academic Expert', 
      key: 'teacher_name',
      render: (a: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center font-black text-xs">{(a.teacher?.name || 'T')[0]}</div>
          <div>
            <p className="font-bold text-gray-800">{a.teacher?.name || 'Unknown Teacher'}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{a.teacher?.employee_number}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Assigned Subject', 
      key: 'subject_name',
      render: (a: any) => (
        <div className="flex items-center gap-2">
           <ArrowRight size={14} className="text-gray-300" />
           <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100">{a.subject?.name}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (a: any) => (
        <button className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Faculty Mapping</h2>
          <p className="text-sm text-gray-500 font-medium">Link teachers to their specialized subjects</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(filters).length > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-200 transition-all">
              <FilterX size={16} /> Clear Filters
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
            <Plus size={18} /> New Assignment
          </button>
        </div>
      </div>

      {teacherFilter && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-primary text-white rounded-lg flex items-center justify-center font-bold text-xs">FT</div>
             <p className="text-xs font-bold text-brand-primary">Filtering results for Teacher ID: <span className="underline">{teacherFilter}</span></p>
           </div>
           <button onClick={clearFilters} className="text-[10px] font-black text-brand-primary uppercase hover:underline">Show All Assignments</button>
        </div>
      )}

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Faculty Resource">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Specialist</label>
             <select 
               required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})}
               className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
             >
               <option value="">Select Teacher</option>
               {teacherOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Domain</label>
             <select 
               required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})}
               className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
             >
               <option value="">Select Subject</option>
               {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
             </select>
           </div>
           <button 
             type="submit" disabled={isSubmitting}
             className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
           >
             {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Commit Assignment</>}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectAssignments;
