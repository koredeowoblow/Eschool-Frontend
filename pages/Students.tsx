
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, Loader2, Users, UserPlus, Activity, UserMinus } from 'lucide-react';
import { Student } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';
import Modal from '../components/common/Modal';
import UserAvatar from '../components/common/UserAvatar';
import StatsCard from '../components/common/StatsCard';
import api from '../services/api';

const fetchStudentsApi = async ({ page, search, filters }: { page: number, search: string, filters?: any }) => {
  const response = await api.get('/students', {
    params: { page, search, per_page: 10, ...filters }
  });
  return response.data;
};

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'class' | 'parent'>('info');
  const [assignExistingGuardian, setAssignExistingGuardian] = useState(false);
  
  const { data, isLoading, search, setSearch, refresh } = useDataTable<Student>(fetchStudentsApi as any);
  const { options: classOptions } = useSelectOptions('/classes');
  const { options: sectionOptions } = useSelectOptions('/sections');
  const { options: sessionOptions } = useSelectOptions('/school-sessions');
  const { options: termOptions } = useSelectOptions('/terms');
  const { options: guardianOptions } = useSelectOptions('/guardians');

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data.data || res.data));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'male',
    date_of_birth: '',
    admission_number: '',
    admission_date: new Date().toISOString().split('T')[0],
    class_id: '',
    section_id: '',
    school_session_id: '',
    term_id: '',
    password: 'password123',
    guardian_id: '',
    guardian: {
      name: '',
      email: '',
      phone: '',
      relation: 'Father',
      occupation: '',
      password: 'password123'
    }
  });

  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/students', {
      ...data,
      assign_existing_guardian: assignExistingGuardian
    }),
    {
      successMessage: "Student added successfully.",
      onSuccess: () => {
        setIsModalOpen(false);
        refresh();
        setActiveFormTab('info');
      }
    }
  );

  const columns = [
    { 
      header: 'Name', 
      key: 'full_name',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={s.avatar} name={s.full_name} />
          <span className="font-bold text-gray-800">{s.full_name}</span>
        </div>
      )
    },
    { header: 'ID Number', key: 'admission_number', className: 'text-sm font-bold text-gray-400' },
    { 
      header: 'Class', 
      key: 'class_room',
      render: (s: Student) => (
        <span className="px-3 py-1 bg-blue-50 text-brand-primary text-[10px] font-bold rounded-lg uppercase">
          {s.class_room?.name || 'None'}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (s: Student) => (
        <span className={`px-2 py-1 text-[9px] font-bold rounded-full uppercase ${
          s.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {s.status ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (s: Student) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }} className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Eye size={18} /></button>
          <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Edit2 size={18} /></button>
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Students" value={stats?.total_students || 0} icon={Users} color="bg-brand-primary" />
        <StatsCard label="Active" value={stats?.active_students || 0} icon={Activity} color="bg-green-600" />
        <StatsCard label="Inactive" value={stats?.inactive_students || 0} icon={UserMinus} color="bg-gray-400" />
        <StatsCard label="New Students" value={stats?.recent_admissions || 0} icon={UserPlus} color="bg-orange-500" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Search students..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:border-brand-primary transition-all"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Add Student
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} onRowClick={(s) => navigate(`/students/${s.id}`)} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Student">
        <div className="flex gap-1 mb-6 border-b border-gray-50 pb-4">
           {(['info', 'class', 'parent'] as const).map((t) => (
             <button 
               key={t} onClick={() => setActiveFormTab(t)}
               className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeFormTab === t ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
             >
               {t === 'info' ? 'Profile' : t === 'class' ? 'Class' : 'Guardian'}
             </button>
           ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          {activeFormTab === 'info' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Name</label>
                <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Birth Date</label>
                  <input required type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email</label>
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
              </div>
              <button type="button" onClick={() => setActiveFormTab('class')} className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all">Next: Class Details</button>
            </div>
          )}

          {activeFormTab === 'class' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">ID Number</label>
                  <input required type="text" placeholder="Admission No" value={formData.admission_number} onChange={e => setFormData({...formData, admission_number: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Admission Date</label>
                  <input required type="date" value={formData.admission_date} onChange={e => setFormData({...formData, admission_date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Class</label>
                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm">
                  <option value="">Select Class</option>
                  {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => setActiveFormTab('parent')} className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all">Next: Guardian Info</button>
            </div>
          )}

          {activeFormTab === 'parent' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                 <input type="checkbox" id="existing" checked={assignExistingGuardian} onChange={e => setAssignExistingGuardian(e.target.checked)} className="w-4 h-4 text-brand-primary" />
                 <label htmlFor="existing" className="text-sm font-bold text-gray-700 cursor-pointer">Use Registered Guardian</label>
               </div>

               {assignExistingGuardian ? (
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Search Guardians</label>
                    <select required value={formData.guardian_id} onChange={e => setFormData({...formData, guardian_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm">
                        <option value="">Select Guardian...</option>
                        {guardianOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                 </div>
               ) : (
                 <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Guardian Name</label>
                      <input required={!assignExistingGuardian} type="text" placeholder="Full Name" value={formData.guardian.name} onChange={e => setFormData({...formData, guardian: {...formData.guardian, name: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Phone</label>
                        <input required={!assignExistingGuardian} type="text" placeholder="Contact No" value={formData.guardian.phone} onChange={e => setFormData({...formData, guardian: {...formData.guardian, phone: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Relation</label>
                        <select value={formData.guardian.relation} onChange={e => setFormData({...formData, guardian: {...formData.guardian, relation: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm">
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                      </div>
                    </div>
                 </div>
               )}
              
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold uppercase shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18} /> Save Student</>}
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Students;
