
import React, { useState, useEffect } from 'react';
import { Paperclip, Plus, FileText, Download, Trash2, Search, Loader2, Inbox, BookOpen, School, Save } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Attachments: React.FC = () => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { options: classOptions } = useSelectOptions('/classes');
  const { options: subjectOptions } = useSelectOptions('/subjects');

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attachments');
      setAttachments(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load attachments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ title: '', class_room_id: '', subject_id: '', file: null as any });
  const { submit, isSubmitting } = useFormSubmit(
    (data) => {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('class_room_id', data.class_room_id);
      fd.append('subject_id', data.subject_id);
      if (data.file) fd.append('file', data.file);
      return api.post('/attachments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        fetchAttachments();
      }
    }
  );

  useEffect(() => {
    fetchAttachments();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Paperclip className="text-brand-primary" /> Study Materials</h2>
          <p className="text-sm text-gray-500 font-medium">Academic resources pinned to subjects and classes</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Upload Material
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : attachments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attachments.map((file) => (
            <div key={file.id} className="card-premium p-6 group hover:border-brand-primary/20 border border-transparent transition-all">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={24}/></div>
                 <button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
               </div>
               <h4 className="font-bold text-gray-800 mb-2 truncate">{file.title}</h4>
               <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><School size={12}/> {file.class_room?.name}</div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><BookOpen size={12}/> {file.subject?.name}</div>
               </div>
               <button className="w-full py-3 bg-gray-50 text-brand-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2">
                 <Download size={16}/> Download Asset
               </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No academic materials discovered.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Study Asset">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Title</label>
             <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" placeholder="e.g. Physics Week 4 Slide Pack" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
               <select required value={formData.class_room_id} onChange={e => setFormData({...formData, class_room_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                 <option value="">Select Class</option>
                 {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Subject</label>
               <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                 <option value="">Select Subject</option>
                 {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
               </select>
             </div>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source File</label>
             <input required type="file" onChange={e => setFormData({...formData, file: e.target.files?.[0]})} className="w-full p-3.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl font-bold text-xs" />
           </div>
           <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
             {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Authorize Upload</>}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default Attachments;
