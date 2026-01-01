
import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, XCircle, Clock, Download, MoreVertical, Loader2, Inbox, School, BookOpen, Save, Calendar } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const LessonNotes: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { options: classOptions } = useSelectOptions('/classes');
  const { options: subjectOptions } = useSelectOptions('/subjects');

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/lesson-notes');
      setNotes(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load lesson notes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    class_id: '',
    subject_id: '',
    date: new Date().toISOString().split('T')[0],
    content: ''
  });

  const openEditModal = (note: any) => {
    setIsEditMode(true);
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      class_id: note.class_room_id ? String(note.class_room_id) : (note.class_id ? String(note.class_id) : ''),
      subject_id: note.subject_id ? String(note.subject_id) : '',
      date: note.date || new Date().toISOString().split('T')[0],
      content: note.content || ''
    });
    setIsModalOpen(true);
  };

  const { submit, isSubmitting } = useFormSubmit(
    (data) => {
      if (isEditMode && editingNote) {
        return api.put(`/lesson-notes/${editingNote.id}`, data);
      }
      return api.post('/lesson-notes', data);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingNote(null);
        fetchNotes();
        setFormData({ title: '', class_id: '', subject_id: '', date: new Date().toISOString().split('T')[0], content: '' });
      }
    }
  );

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Curriculum Assets</h2>
          <p className="text-sm text-gray-500 font-medium">Digital lesson plan repository</p>
        </div>
        <button onClick={() => {
          setIsEditMode(false);
          setEditingNote(null);
          setFormData({ title: '', class_id: '', subject_id: '', date: new Date().toISOString().split('T')[0], content: '' });
          setIsModalOpen(true);
        }} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> Submit New Note
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {notes.map((note) => (
            <div key={note.id} onClick={() => openEditModal(note)} className="card-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-brand-primary transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{note.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1"><School size={12} /> {note.class_room?.name}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {note.subject?.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${note.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {note.status || 'Pending Review'}
                </span>
                <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Download size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
          <Inbox size={48} strokeWidth={1} />
          <p className="font-bold">Registry empty.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Update Lesson Note" : "New Lesson Submission"}>
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lesson Narrative (Title)</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" placeholder="e.g. Introduction to Thermodynamics" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
              <select required value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Class</option>
                {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Subject</label>
              <select required value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Subject</option>
                {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Scheduled Presentation Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-4 text-gray-400" />
              <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Curriculum Content (Draft)</label>
            <textarea required rows={5} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm" placeholder="Paste lesson summary or full notes here..." />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Finalize Submission</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LessonNotes;
