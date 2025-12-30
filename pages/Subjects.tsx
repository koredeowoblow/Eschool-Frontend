
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Plus, Loader2, Inbox, Hash, Save } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { options: teacherOptions } = useSelectOptions('/teachers');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacher_id: ''
  });

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { submit, isSubmitting, errors } = useFormSubmit(
    (data) => api.post('/subjects', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        fetchSubjects();
        setFormData({ name: '', code: '', teacher_id: '' });
      }
    }
  );

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Academic Subjects</h2>
          <p className="text-sm text-gray-500 font-medium">Core curriculum and departmental management</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-brand-primary/20 transition-all active:scale-95">
          <Plus size={18} />
          Create Subject
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Indexing Curriculum...</p>
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className="card-premium p-6 group cursor-pointer hover:border-brand-primary/30 border border-transparent transition-all">
              <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <BookOpen size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{sub.name}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{sub.code}</p>
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <Users size={14} className="text-brand-primary" />
                  {sub.teacher || 'No Head Assigned'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <Clock size={14} className="text-brand-secondary" />
                  {sub.classes_count || 0} Active Classes
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold uppercase tracking-widest text-xs">Curriculum is empty.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Subject">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Title</label>
            <input 
              required type="text" value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 ${errors.name ? 'border-red-400' : 'border-gray-100'}`}
              placeholder="e.g. Advanced Physics"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Code</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-4 text-gray-400" />
              <input 
                required type="text" value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
                placeholder="PHY-202"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department Head (Teacher)</label>
            <div className="relative">
              <select 
                value={formData.teacher_id}
                onChange={e => setFormData({...formData, teacher_id: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold appearance-none"
              >
                <option value="">Assign Lead Teacher</option>
                {teacherOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Initialize Subject</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;
