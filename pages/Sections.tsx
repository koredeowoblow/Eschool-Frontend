
import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, Trash2, Loader2, Inbox, Save } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Sections: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sections');
      const data = res.data.data || res.data || [];
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load sections", err);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ name: '' });
  const openEditModal = (section: any) => {
    setIsEditMode(true);
    setEditingSection(section);
    setFormData({ name: section.name || '' });
    setIsModalOpen(true);
  };

  const { submit, isSubmitting, errors } = useFormSubmit(
    (data) => {
      if (isEditMode && editingSection) {
        return api.put(`/sections/${editingSection.id}`, data);
      }
      return api.post('/sections', data);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingSection(null);
        setFormData({ name: '' });
        fetchSections();
      }
    }
  );

  useEffect(() => {
    fetchSections();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await api.delete(`/sections/${id}`);
      fetchSections();
    } catch (err) {
      console.error("Failed to delete section", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Sections</h2>
          <p className="text-sm text-gray-500 font-medium">Organize classes into divisions (e.g., Primary, Junior Secondary)</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Add Section
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Retrieving Divisions...</p>
        </div>
      ) : sections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div key={section.id} onClick={() => openEditModal(section)} className="card-premium p-6 flex items-center justify-between border-l-4 border-brand-primary group cursor-pointer">
              <div>
                <h4 className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{section.name}</h4>
                <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                  <Users size={12} className="text-brand-primary" /> {section.classes_count || 0} Classes Assigned
                </p>
              </div>
              <button
                onClick={() => handleDelete(section.id)}
                className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Remove Section"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Inbox size={32} strokeWidth={1} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-gray-600">No sections discovered.</p>
            <p className="text-xs font-medium max-w-xs mx-auto">Click 'Add Section' to begin structuring your academic hierarchy.</p>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Update Academic Section" : "New Academic Section"}>
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section Name</label>
            <input
              required type="text" value={formData.name}
              onChange={e => setFormData({ name: e.target.value })}
              className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 ${errors.name ? 'border-red-400' : 'border-gray-100'}`}
              placeholder="e.g. Senior Secondary"
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name[0]}</p>}
          </div>
          <button
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Initialize Section</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Sections;
