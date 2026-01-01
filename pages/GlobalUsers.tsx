
import React, { useState } from 'react';
import { Globe, Search, User, Shield, Mail, Trash2, Edit2, Loader2, Inbox, Save } from 'lucide-react';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useSelectOptions } from '../hooks/useSelectOptions';
import Modal from '../components/common/Modal';
import api from '../services/api';

const fetchGlobalUsersApi = async (params: any) => {
  const response = await api.get('/users', { params }); // Matching provided routes
  return response.data;
};

const GlobalUsers: React.FC = () => {
  const { data, isLoading, search, setSearch, refresh } = useDataTable(fetchGlobalUsersApi);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', status: 'active' });

  const { options: roleOptions } = useSelectOptions('/roles');

  const openEditModal = (user: any) => {
    setEditingUser(user);
    const existingRole = user.roles?.[0]?.name || user.role || '';
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: existingRole,
      status: user.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const { submit: handleUpdate, isSubmitting } = useFormSubmit(
    (data) => api.put(`/users/${editingUser.id}`, data),
    { onSuccess: () => { setIsEditModalOpen(false); refresh(); } }
  );

  const toggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/users/${user.id}`, { status: newStatus });
      refresh();
    } catch (err) {
      console.error("Status toggle failed:", err);
    }
  };

  const columns = [
    {
      header: 'Identity',
      key: 'name',
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 overflow-hidden">
            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0] || 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-800">{u.name}</p>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              {u.roles?.[0]?.name || u.role || 'User'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Organization',
      key: 'school_name',
      render: (u: any) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <Shield size={14} className="text-brand-primary" /> {u.school?.name || u.school_name || 'System Level'}
        </div>
      )
    },
    { header: 'Email Address', key: 'email', className: 'text-sm text-gray-400 font-medium' },
    {
      header: 'Account Status',
      key: 'status',
      render: (u: any) => (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {u.status || 'active'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (u: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEditModal(u)} className="p-2 text-gray-300 hover:text-brand-primary transition-all"><Edit2 size={16} /></button>
          <button onClick={() => toggleStatus(u)} className={`p-2 transition-all ${u.status === 'active' ? 'text-gray-300 hover:text-red-500' : 'text-green-500 hover:text-green-600'}`}>
            <Shield size={16} fill={u.status === 'suspended' ? 'currentColor' : 'none'} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Globe className="text-brand-primary" />
            Global User Registry
          </h2>
          <p className="text-sm text-gray-500 font-medium">Monitoring all accounts across the platform</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text" placeholder="Search global registry..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Identity Management">
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:border-brand-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:border-brand-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secuity Role</label>
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:border-brand-primary">
                <option value="">User Tier</option>
                {roleOptions.map(o => <option key={o.value} value={o.label}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Level</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:border-brand-primary">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <button disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-2 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            Apply Identity Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default GlobalUsers;
