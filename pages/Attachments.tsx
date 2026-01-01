
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
      console.error("Failed to sync resources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ title: '', class_id: '', subject_id: '', file: null as any });
  const { submit, isSubmitting } = useFormSubmit(
    async (data) => {
      // 1. Upload to general upload endpoint FIRST to get path (as expected by AttachmentRequest)
      const uploadFd = new FormData();
      if (data.file) uploadFd.append('file', data.file);
      const uploadRes = await api.post('/upload', uploadFd, { headers: { 'Content-Type': 'multipart/form-data' } });

      const filePath = uploadRes.data?.data?.path || uploadRes.data?.path;
      if (!filePath) throw new Error("Upload failed");

      // 2. Create the attachment record
      return api.post('/attachments', {
        title: data.title,
        class_id: data.class_id,
        subject_id: data.subject_id,
        file_path: filePath,
        file_type: data.file?.type || 'application/octet-stream'
      });
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ title: '', class_id: '', subject_id: '', file: null });
        fetchAttachments();
      }
    }
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently decommission this study resource?")) return;
    try {
      await api.delete(`/attachments/${id}`);
      fetchAttachments();
    } catch (err) {
      console.error("Purge failed:", err);
    }
  };

  const handleDownload = (filePath: string) => {
    const url = `${api.defaults.baseURL?.replace('/api', '')}/storage/${filePath}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Paperclip className="text-brand-primary" /> Study Resources</h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Academic assets distributed across class modules</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Upload Resource
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-32 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Indexing Repository...</p>
        </div>
      ) : attachments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attachments.map((file) => (
            <div key={file.id} className="card-premium p-6 group hover:border-brand-primary/20 border border-transparent transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm border border-blue-100"><FileText size={24} /></div>
                <button onClick={() => handleDelete(file.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 truncate" title={file.title}>{file.title}</h4>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tight"><School size={12} /> {file.class_room?.name || 'All Classes'}</div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tight"><BookOpen size={12} /> {file.subject?.name || 'General Resource'}</div>
              </div>
              <button
                onClick={() => handleDownload(file.file_path)}
                className="w-full py-4 bg-gray-50 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-brand-primary/10"
              >
                <Download size={14} /> Retrieve Asset
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 text-gray-400 flex flex-col items-center gap-4">
          <Inbox size={48} strokeWidth={1} />
          <p className="font-bold text-sm">Repository is currently empty.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision Academic Asset">
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Identity</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-brand-primary" placeholder="e.g. Quantum Physics - Lecture 04" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Module</label>
              <select required value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-brand-primary appearance-none">
                <option value="">Select Level</option>
                {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Unit</label>
              <select required value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:border-brand-primary appearance-none">
                <option value="">Select Domain</option>
                {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Blob Package</label>
            <input required type="file" onChange={e => setFormData({ ...formData, file: e.target.files?.[0] })} className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl font-bold text-[10px] uppercase cursor-pointer hover:bg-gray-100 transition-colors file:hidden" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mt-4">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> Authorize Distribution</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Attachments;
