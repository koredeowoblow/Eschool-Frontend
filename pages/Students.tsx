
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, Loader2, User, School, Calendar, Mail, UserPlus, ShieldCheck, Lock, Activity, Users, UserMinus } from 'lucide-react';
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
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'academic' | 'guardian'>('basic');
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
      successMessage: "Institutional record successfully synchronized.",
      onSuccess: () => {
        setIsModalOpen(false);
        refresh();
        setActiveFormTab('basic');
      }
    }
  );

  const columns = [
    { 
      header: 'Student Name', 
      key: 'full_name',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={s.avatar} name={s.full_name} />
          <span className="font-bold text-gray-800 tracking-tight">{s.full_name}</span>
        </div>
      )
    },
    { header: 'Admission No', key: 'admission_number', className: 'text-sm text-gray-400 font-black uppercase' },
    { 
      header: 'Class', 
      key: 'class_room',
      render: (s: Student) => (
        <span className="px-3 py-1 bg-blue-50 text-brand-primary text-[10px] font-black rounded-lg uppercase">
          {s.class_room?.name || 'Unassigned'}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (s: Student) => (
        <span className={`px-2 py-1 text-[9px] font-black rounded-full uppercase ${
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
          <button onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }} className="p-2 text-gray-400 hover:text-brand-primary rounded-lg transition-colors"><Eye size={18} /></button>
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-lg transition-colors"><Edit2 size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Students" value={stats?.total_students || 0} icon={Users} color="bg-brand-primary" />
        <StatsCard label="Active" value={stats?.active_students || 0} icon={Activity} color="bg-green-600" />
        <StatsCard label="Inactive" value={stats?.inactive_students || 0} icon={UserMinus} color="bg-gray-400" />
        <StatsCard label="Recent Admissions" value={stats?.recent_admissions || 0} icon={UserPlus} color="bg-orange-500" />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Search student registry..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none focus:border-brand-primary shadow-sm"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Register Student
        </button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} onRowClick={(s) => navigate(`/students/${s.id}`)} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Enrollment Protocol">
        <div className="flex gap-1 mb-6 border-b border-gray-50 pb-4">
           {(['basic', 'academic', 'guardian'] as const).map((t) => (
             <button 
               key={t} onClick={() => setActiveFormTab(t)}
               className={`flex-1 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${activeFormTab === t ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
             >
               {t}
             </button>
           ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          {activeFormTab === 'basic' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity (Full Name)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Birth Date</label>
                  <input required type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
              </div>
              <button type="button" onClick={() => setActiveFormTab('academic')} className="w-full py-4 bg-gray-800 text-white rounded-xl font-black uppercase tracking-widest">Next: Academic Data</button>
            </div>
          )}

          {activeFormTab === 'academic' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admission No</label>
                  <input required type="text" value={formData.admission_number} onChange={e => setFormData({...formData, admission_number: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admission Date</label>
                  <input required type="date" value={formData.admission_date} onChange={e => setFormData({...formData, admission_date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Class</label>
                  <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                    <option value="">Select Level</option>
                    {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section</label>
                  <select required value={formData.section_id} onChange={e => setFormData({...formData, section_id: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                    <option value="">Select Wing</option>
                    {sectionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" onClick={() => setActiveFormTab('guardian')} className="w-full py-4 bg-gray-800 text-white rounded-xl font-black uppercase tracking-widest">Next: Guardian Mapping</button>
            </div>
          )}

          {activeFormTab === 'guardian' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                 <input 
                    type="checkbox" 
                    id="existing-guardian"
                    checked={assignExistingGuardian} 
                    onChange={e => setAssignExistingGuardian(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-primary"
                 />
                 <label htmlFor="existing-guardian" className="text-sm font-bold text-gray-700 cursor-pointer">Assign Existing Guardian</label>
               </div>

               {assignExistingGuardian ? (
                 <div className="space-y-1 py-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Registered Guardian</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <select required={assignExistingGuardian} value={formData.guardian_id} onChange={e => setFormData({...formData, guardian_id: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold appearance-none">
                         <option value="">Lookup Registry...</option>
                         {guardianOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Identity</label>
                      <input required={!assignExistingGuardian} type="text" value={formData.guardian.name} onChange={e => setFormData({...formData, guardian: {...formData.guardian, name: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input required={!assignExistingGuardian} type="text" value={formData.guardian.phone} onChange={e => setFormData({...formData, guardian: {...formData.guardian, phone: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Relation</label>
                        <select value={formData.guardian.relation} onChange={e => setFormData({...formData, guardian: {...formData.guardian, relation: e.target.value}})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                        </select>
                      </div>
                    </div>
                 </div>
               )}
              
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18}/> Commit Registration</>}
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Students;
