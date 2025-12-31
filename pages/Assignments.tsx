
import React, { useState, useEffect } from 'react';
import { Plus, Book, Calendar, Users, ChevronRight, FileText, Loader2, Inbox, Upload } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  const { options: classOptions } = useSelectOptions('/classes');
  const [selectedClass, setSelectedClass] = useState('');
  const { options: subjectOptions } = useSelectOptions(selectedClass ? `/subjects?class_id=${selectedClass}` : '/subjects');

  const [formData, setFormData] = useState({
    title: '',
    class_room_id: '',
    subject_id: '',
    due_date: '',
    description: '',
    priority: 'Medium'
  });

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load assignments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (assignment: any) => {
    setIsEditMode(true);
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      class_room_id: assignment.class_room_id ? String(assignment.class_room_id) : '',
      subject_id: assignment.subject_id ? String(assignment.subject_id) : '',
      due_date: assignment.due_date || '',
      description: assignment.description || '',
      priority: assignment.priority || 'Medium'
    });
    setIsModalOpen(true);
  };

  const { submit, isSubmitting, errors } = useFormSubmit(
    (data) => {
      if (isEditMode && editingAssignment) {
        return api.put(`/assignments/${editingAssignment.id}`, data);
      }
      return api.post('/assignments', data);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingAssignment(null);
        fetchAssignments();
        setFormData({ title: '', class_room_id: '', subject_id: '', due_date: '', description: '', priority: 'Medium' });
      }
    }
  );

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Academic Assignments</h2>
          <p className="text-sm text-gray-500 font-medium">Track and grade student submissions</p>
        </div>
        <button onClick={() => {
          setIsEditMode(false);
          setEditingAssignment(null);
          setFormData({ title: '', class_room_id: '', subject_id: '', due_date: '', description: '', priority: 'Medium' });
          setIsModalOpen(true);
        }} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((task) => (
            <div key={task.id} onClick={() => openEditModal(task)} className="card-premium p-6 group hover:border-brand-primary/20 border border-transparent transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-secondary flex items-center justify-center">
                  <Book size={24} />
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                  {task.priority || 'Standard'} Priority
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-brand-primary transition-colors">{task.title}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{task.subject_name || task.subject?.name || 'Academic'}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                  <Calendar size={14} className="text-brand-primary" />
                  DUE: {task.due_date}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                  <Users size={14} className="text-brand-secondary" />
                  {task.submissions_count || 0}/{task.total_students || 0} SUBMISSIONS
                </div>
              </div>

              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-brand-primary h-full rounded-full"
                  style={{ width: `${((task.submissions_count || 0) / (task.total_students || 1)) * 100}%` }}
                ></div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-white transition-all">
                <FileText size={14} />
                View Submissions
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
          <Inbox size={48} strokeWidth={1} />
          <p className="font-bold">No assignments found for this term.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Update Assignment" : "Create New Assignment"}>
        <form onSubmit={(e) => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Task Title</label>
            <input
              required type="text" value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:border-brand-primary font-bold ${errors.title ? 'border-red-400' : 'border-gray-100'}`}
              placeholder="e.g. Mid-Term Math Project"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class</label>
              <select
                required value={formData.class_room_id}
                onChange={e => {
                  setFormData({ ...formData, class_room_id: e.target.value });
                  setSelectedClass(e.target.value);
                }}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold appearance-none"
              >
                <option value="">Select Class</option>
                {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <select
                required value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold appearance-none"
              >
                <option value="">Select Subject</option>
                {subjectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
              <input
                required type="date" value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Task Instructions</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-medium text-sm"
              placeholder="Provide clear steps for the students..."
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Upload size={18} /> Publish Assignment</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;
