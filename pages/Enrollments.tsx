
import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Loader2, Inbox, Save, Users, School, Calendar } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const fetchEnrollmentsApi = async (params: any) => {
  const res = await api.get('/enrollments', { params });
  return res.data;
};

const Enrollments: React.FC = () => {
  const { data, isLoading, refresh, search, setSearch } = useDataTable(fetchEnrollmentsApi);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { options: studentOptions } = useSelectOptions('/students');
  const { options: classOptions } = useSelectOptions('/classes');
  const { options: sessionOptions } = useSelectOptions('/school-sessions');
  const { options: termOptions } = useSelectOptions('/academic-terms');

  const [formData, setFormData] = useState({ student_id: '', class_id: '', session_id: '', term_id: '' });
  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/enrollments', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        refresh();
      }
    }
  );

  const columns = [
    {
      header: 'Enrolled Student',
      key: 'student_name',
      render: (e: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-black text-xs text-gray-400">{(e.student?.name || 'S')[0]}</div>
          <div>
            <p className="font-bold text-gray-800">{e.student?.name}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{e.student?.admission_number}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Placement',
      key: 'class_name',
      render: (e: any) => (
        <div className="flex items-center gap-2">
          <School size={14} className="text-brand-primary" />
          <span className="text-sm font-bold text-gray-700">{e.classRoom?.name || e.class_room?.name}</span>
        </div>
      )
    },
    {
      header: 'Academic Cycle',
      key: 'session',
      render: (e: any) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-brand-secondary" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500">{e.session?.name || e.school_session?.name}</span>
            <span className="text-[10px] text-gray-400 font-bold">{e.term?.name}</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Placement Registry</h2>
          <p className="text-sm text-gray-500 font-medium">Historical track of student class assignments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Enroll Student
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3 text-gray-400" size={20} />
        <input
          type="text" placeholder="Search enrollments..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand-primary shadow-sm"
        />
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Placement Entry">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Student</label>
            <select required value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
              <option value="">Select Student</option>
              {studentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Placement</label>
              <select required value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Class</option>
                {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session</label>
              <select required value={formData.session_id} onChange={e => setFormData({ ...formData, session_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Session</option>
                {sessionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Term</label>
              <select required value={formData.term_id} onChange={e => setFormData({ ...formData, term_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Term</option>
                {termOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Commit Enrollment</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Enrollments;
