import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, Loader2, User, School, Calendar, Mail } from 'lucide-react';
import { Student } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable, FilterConfig } from '../components/common/DataTable';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchStudentsApi = async ({ page, search, filters }: { page: number, search: string, filters?: any }) => {
  const response = await api.get('/students', {
    params: { page, search, per_page: 10, ...filters }
  });
  return response.data;
};

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    data, isLoading, search, setSearch, page, setPage, lastPage, filters, setFilters, refresh 
  } = useDataTable<Student>(fetchStudentsApi as any);

  const { options: classOptions, isLoading: isLoadingClasses } = useSelectOptions('/classes');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    class_room_id: '',
    gender: 'male',
    dob: '',
    email: ''
  });

  const { submit, isSubmitting, errors } = useFormSubmit(
    (data) => api.post('/students', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        refresh();
        setFormData({ first_name: '', last_name: '', class_room_id: '', gender: 'male', dob: '', email: '' });
      }
    }
  );

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }]
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]
    }
  ], []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const columns = [
    { 
      header: 'Student Name', 
      key: 'full_name',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-white">
             {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400 font-bold">{s.full_name[0]}</div>}
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{s.full_name}</span>
        </div>
      )
    },
    { header: 'Admission No', key: 'admission_number', className: 'text-sm text-gray-400 font-black uppercase tracking-tighter' },
    { 
      header: 'Class', 
      key: 'class_room',
      render: (s: Student) => (
        <span className="px-3 py-1 bg-blue-50 text-brand-primary text-[10px] font-black rounded-lg uppercase tracking-widest">
          {s.class_room?.name || 'Unassigned'}
        </span>
      )
    },
    { 
      header: 'Gender', 
      key: 'gender',
      render: (s: Student) => <span className="text-sm text-gray-500 font-medium capitalize">{s.user?.gender || 'N/A'}</span>
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (s: Student) => (
        <span className={`px-2 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
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
          <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search students directory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none focus:border-brand-primary shadow-sm transition-all"
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Register Student
        </button>
      </div>

      <DataTable 
        columns={columns} data={data} isLoading={isLoading} 
        filtersConfig={filtersConfig} activeFilters={filters}
        onFilterChange={handleFilterChange} onClearFilters={() => setFilters({})}
        onRowClick={(s) => navigate(`/students/${s.id}`)}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Student Enrollment">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
              <input 
                required type="text" value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-brand-primary font-bold ${errors.first_name ? 'border-red-400' : 'border-gray-100'}`} 
              />
              {errors.first_name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.first_name[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
              <input 
                required type="text" value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-brand-primary font-bold ${errors.last_name ? 'border-red-400' : 'border-gray-100'}`} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Class</label>
            <div className="relative">
              <select 
                required value={formData.class_room_id}
                onChange={e => setFormData({...formData, class_room_id: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold appearance-none"
              >
                <option value="">Select Class</option>
                {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {isLoadingClasses && <Loader2 className="absolute right-4 top-3.5 animate-spin text-gray-400" size={16} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
              <input 
                required type="date" value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold" 
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Finalize Enrollment"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;