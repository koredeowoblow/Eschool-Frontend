
import React, { useState, useEffect } from 'react';
import { ListChecks, Plus, Book, Calendar, Settings, Loader2, Inbox, Award, Layers, Trash2, Edit2, Save, School } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useSelectOptions } from '../hooks/useSelectOptions';

const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  const { options: classOptions } = useSelectOptions('/classes');
  const { options: termOptions } = useSelectOptions('/terms');

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/assessments');
      setAssessments(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load assessments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ title: '', class_room_id: '', term_id: '', max_score: '100' });
  
  const { submit, isSubmitting } = useFormSubmit(
    (data) => selectedAssessment 
      ? api.put(`/assessments/${selectedAssessment.id}`, data) 
      : api.post('/assessments', data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedAssessment(null);
        setFormData({ title: '', class_room_id: '', term_id: '', max_score: '100' });
        fetchAssessments();
      }
    }
  );

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleEdit = (item: any) => {
    setSelectedAssessment(item);
    setFormData({ 
      title: item.title, 
      class_room_id: String(item.class_room_id || ''), 
      term_id: String(item.term_id || ''), 
      max_score: String(item.max_score || '100') 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Learning Assessments</h2>
          <p className="text-sm text-gray-500 font-medium">Standardized evaluation schema management</p>
        </div>
        <button onClick={() => { setSelectedAssessment(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> New Definition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : assessments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {assessments.map((item) => (
                <div key={item.id} className="card-premium p-6 flex items-center justify-between group hover:border-brand-primary/20 border border-transparent transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center font-black">
                      {item.max_score}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{item.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>{item.class_room?.name}</span>
                        <span>{item.term?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-brand-primary transition-all"><Edit2 size={18}/></button>
                    <button className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-premium p-20 text-center text-gray-400 border border-dashed border-gray-200">
               <Inbox size={48} className="mx-auto mb-4"/>
               <p className="font-bold text-sm">No assessment schemas established.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAssessment ? "Modify Definition" : "Initialize Evaluation"}>
         <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assessment Title</label>
              <input 
                required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" placeholder="e.g. Mid-Term Examination"
              />
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
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Term</label>
                 <select required value={formData.term_id} onChange={e => setFormData({...formData, term_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                   <option value="">Select Term</option>
                   {termOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maximum Score Capability</label>
              <input 
                required type="number" value={formData.max_score} onChange={e => setFormData({...formData, max_score: e.target.value})}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black text-lg"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Synchronize Schema</>}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default Assessments;
