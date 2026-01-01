
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, MoreVertical, Loader2, Inbox, Save, Clock, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';

const AcademicSessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/school-sessions'); // GET api/v1/school-sessions
      setSessions(res.data.data || res.data || []);
    } catch (err) {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '', status: 'active' });
  const openEditModal = (session: any) => {
    setIsEditMode(true);
    setEditingSession(session);
    setFormData({
      name: session.name || '',
      start_date: session.start_date ? session.start_date.split('T')[0] : '',
      end_date: session.end_date ? session.end_date.split('T')[0] : '',
      status: session.status || 'active'
    });
    setIsModalOpen(true);
  };

  const { submit: submitSession, isSubmitting: isSubmittingSession } = useFormSubmit(
    (data) => {
      if (isEditMode && editingSession) {
        return api.put(`/school-sessions/${editingSession.id}`, data);
      }
      return api.post('/school-sessions', data);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingSession(null);
        setFormData({ name: '', start_date: '', end_date: '', status: 'active' });
        fetchSessions();
      }
    }
  );

  const [termData, setTermData] = useState({ name: '', start_date: '', end_date: '', status: 'active' });
  const { submit: submitTerm, isSubmitting: isSubmittingTerm } = useFormSubmit(
    (data) => api.post('/terms', { ...data, school_session_id: selectedSessionId }), // POST api/v1/terms
    {
      onSuccess: () => {
        setIsTermModalOpen(false);
        setTermData({ name: '', start_date: '', end_date: '', status: 'active' });
        fetchSessions();
      }
    }
  );

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Academic Calendar</h2>
          <p className="text-sm text-gray-500 font-medium">Institutional term and session management</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> New Session
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Calendar...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} onClick={() => openEditModal(session)} className={`card-premium p-8 border cursor-pointer ${session.is_current ? 'border-brand-primary ring-4 ring-brand-primary/5 shadow-2xl shadow-brand-primary/5' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.is_current ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{session.name}</h3>
                    {session.is_current && <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-blue-50 px-2 py-0.5 rounded">Active Session</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedSessionId(session.id); setIsTermModalOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add Term
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"><MoreVertical size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {session.terms?.length > 0 ? session.terms.map((term: any) => (
                  <div key={term.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${term.is_current ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50/50 border-gray-100 text-gray-600'}`}>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className={term.is_current ? 'text-green-500' : 'text-gray-400'} />
                      <span className="text-sm font-bold">{term.name}</span>
                    </div>
                    {term.is_current ? <CheckCircle2 className="text-green-500" size={16} /> : <button className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>}
                  </div>
                )) : <div className="col-span-3 py-6 text-center text-xs font-bold text-gray-300 uppercase tracking-widest border border-dashed border-gray-200 rounded-2xl">No terms defined for this session</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
          <Calendar size={32} strokeWidth={1} />
          <p className="font-bold">No sessions established.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Update Session" : "Initialize Session"}>
        <form onSubmit={(e) => { e.preventDefault(); submitSession(formData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session Identity</label>
            <input
              required type="text" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              placeholder="e.g. 2024/2025 Academic Cycle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
              <input
                required type="date" value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
              <input
                required type="date" value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select
              required
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none"
            >
              <option value="active">Active Session</option>
              <option value="ended">Ended / Archived</option>
            </select>
          </div>
          <button
            type="submit" disabled={isSubmittingSession}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmittingSession ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> {isEditMode ? 'Update' : 'Initialize'} Cycle</>}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isTermModalOpen} onClose={() => setIsTermModalOpen(false)} title="Add Academic Term">
        <form onSubmit={(e) => { e.preventDefault(); submitTerm(termData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Term Label</label>
            <input
              required type="text" value={termData.name}
              onChange={e => setTermData({ ...termData, name: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              placeholder="e.g. Hilary Term"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
              <input
                required type="date" value={termData.start_date}
                onChange={e => setTermData({ ...termData, start_date: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
              <input
                required type="date" value={termData.end_date}
                onChange={e => setTermData({ ...termData, end_date: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select
              required
              value={termData.status}
              onChange={e => setTermData({ ...termData, status: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-800 appearance-none"
            >
              <option value="active">Active Term</option>
              <option value="ended">Ended / Archived</option>
            </select>
          </div>
          <button
            type="submit" disabled={isSubmittingTerm}
            className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmittingTerm ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Finalize Term</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicSessions;
