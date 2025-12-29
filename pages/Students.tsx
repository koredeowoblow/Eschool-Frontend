
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Student } from '../types';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable, FilterConfig } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import api from '../services/api';

// Fix: Make filters parameter optional to match FetchParams interface
const fetchStudentsApi = async ({ page, search, filters }: { page: number, search: string, filters?: any }) => {
  const response = await api.get('/students', {
    params: { 
      page, 
      search, 
      per_page: 10,
      ...filters
    }
  });
  return response.data;
};

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fix: Add <Student> generic to fix 'unknown' type on data rows and include 'filters' in destructuring
  const { 
    data, 
    isLoading, 
    search, 
    setSearch, 
    page, 
    setPage, 
    lastPage, 
    filters, 
    setFilters 
  } = useDataTable<Student>(fetchStudentsApi as any);

  const filtersConfig: FilterConfig[] = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ]
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ]
    }
  ], []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const columns = [
    { 
      header: 'Student Name', 
      key: 'full_name',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-white">
             {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" alt="" /> : <div className="flex items-center justify-center h-full text-gray-400 font-bold">{s.full_name[0]}</div>}
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
            placeholder="Search students directory by name or admission number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none focus:border-brand-primary shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} /> Register Student
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        isLoading={isLoading} 
        filtersConfig={filtersConfig}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        // Fix: s is now correctly typed as Student instead of unknown
        onRowClick={(s) => navigate(`/students/${s.id}`)}
      />

      {lastPage > 1 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold disabled:opacity-30 shadow-sm" disabled={page === 1}>Previous</button>
            <button onClick={() => setPage(p => p + 1)} className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-white transition-all disabled:opacity-30 shadow-sm" disabled={page === lastPage}>Next</button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Student">
        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
            <input type="text" placeholder="Johnathan Doe" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800" />
          </div>
          <button className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-4">
            Initialize Enrollment
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
