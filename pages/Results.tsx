import React, { useState, useEffect } from 'react';
import { Trophy, Download, Search, Filter, ArrowUpRight, Percent, Loader2, Inbox, Edit3, Save, School, BookOpen, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useSelectOptions } from '../hooks/useSelectOptions';
import Modal from '../components/common/Modal';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useNotification } from '../context/NotificationContext';

const Results: React.FC = () => {
  const [viewMode, setViewMode] = useState<'view' | 'entry'>('view');
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  // Entry Mode State
  const [entryConfig, setEntryConfig] = useState({ class_id: '', subject_id: '', assessment_id: '' });
  const [entryData, setEntryData] = useState<Record<string, { ca: string, exam: string, result_id: string | null }>>({});

  // Edit Mode State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ marks_obtained: '', grade: '', comments: '' });

  // Options
  const { options: classOptions } = useSelectOptions('/classes');
  const { options: subjectOptions } = useSelectOptions('/subjects');
  // Dynamic assessment loading based on selected class
  const assessmentsEndpoint = entryConfig.class_id ? `/assessments?class_id=${entryConfig.class_id}` : '/assessments';
  const { options: assessmentOptions } = useSelectOptions(assessmentsEndpoint, 'title');

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const [resultsRes, statsRes] = await Promise.all([
        api.get('/results'),
        api.get('/results/stats')
      ]);
      setResults(resultsRes.data.data || resultsRes.data || []);
      setStats(statsRes.data.data || statsRes.data);
    } catch (err) {
      console.error("Failed to load results", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'view') fetchResults();
  }, [viewMode]);

  const fetchEntryData = async () => {
    if (!entryConfig.class_id || !entryConfig.assessment_id) return;
    setIsLoading(true);
    try {
      // Fetch students and existing results for this assessment
      const [studentsRes, resultsRes] = await Promise.all([
        api.get('/students', { params: { class_id: entryConfig.class_id, per_page: 100 } }),
        api.get('/results', { params: { assessment_id: entryConfig.assessment_id, class_id: entryConfig.class_id, per_page: 100 } })
      ]);

      const studentsList = studentsRes.data.data || studentsRes.data || [];
      const existingResults = resultsRes.data.data || resultsRes.data || [];

      setResults(studentsList); // Using results state to hold students list in entry mode

      // Map existing results to students
      const initialMap: Record<string, any> = {};
      studentsList.forEach((student: any) => {
        const result = existingResults.find((r: any) => r.student_id === student.id);
        if (result) {
          // Backend stores total 'marks_obtained'. We split arbitrarily for UI or put all in Exam if no CA logic.
          // Since backend has no 'ca', we put total in 'exam' column for now, or split 40/60 if we had logic.
          // For simplicity, we put total in 'exam' and 0 in 'ca' to avoid data loss, or just show total.
          initialMap[student.id] = {
            ca: '0',
            exam: String(result.marks_obtained || 0),
            result_id: result.id
          };
        } else {
          initialMap[student.id] = { ca: '', exam: '', result_id: null };
        }
      });
      setEntryData(initialMap);

    } catch (err) {
      console.error("Failed to load entry data", err);
      showNotification("Failed to load lists", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'entry' && entryConfig.class_id && entryConfig.assessment_id) {
      fetchEntryData();
    }
  }, [entryConfig.class_id, entryConfig.assessment_id, viewMode]);

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', value: string) => {
    setEntryData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSaveBatch = async () => {
    setIsLoading(true);
    let successCount = 0;
    try {
      const promises = Object.entries(entryData).map(async ([studentId, data]) => {
        const total = (Number(data.ca) || 0) + (Number(data.exam) || 0);
        if (total === 0 && !data.result_id) return; // Skip empty new entries

        const payload = {
          student_id: Number(studentId),
          assessment_id: Number(entryConfig.assessment_id),
          marks_obtained: total,
          // Optional: we can add grade calculation locally or let backend handle
        };

        if (data.result_id) {
          await api.put(`/results/${data.result_id}`, payload);
        } else {
          await api.post('/results', payload);
        }
        successCount++;
      });

      await Promise.all(promises);
      showNotification(`Successfully saved ${successCount} results`, 'success');
      fetchEntryData(); // Refresh to get new IDs
    } catch (err) {
      console.error("Batch save failed", err);
      showNotification("Some results failed to save", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (result: any) => {
    setEditingResult(result);
    setEditFormData({
      marks_obtained: String(result.marks_obtained || result.score || result.average || 0),
      grade: result.grade || '',
      comments: result.remark || result.comments || ''
    });
    setIsEditModalOpen(true);
  };

  const { submit: submitUpdate, isSubmitting: isUpdating } = useFormSubmit(
    (data) => api.put(`/results/${editingResult.id}`, data),
    {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setEditingResult(null);
        fetchResults();
      }
    }
  );

  const filteredResults = results.filter(r =>
    (r.full_name || r.name || r.student?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Trophy className="text-brand-secondary" />
            {viewMode === 'view' ? 'Exam Results Board' : 'Grade Entry Portal'}
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Academic Session Performance Portfolio</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'view' ? 'entry' : 'view')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all ${viewMode === 'entry' ? 'bg-brand-secondary text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
          >
            {viewMode === 'view' ? <Edit3 size={18} /> : <ArrowUpRight size={18} />}
            {viewMode === 'view' ? 'Enter Marks' : 'View Summary'}
          </button>
          {viewMode === 'entry' && (
            <button
              onClick={handleSaveBatch}
              disabled={isLoading || !entryConfig.assessment_id}
              className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Batch
            </button>
          )}
        </div>
      </div>

      {viewMode === 'view' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium p-6 bg-blue-50/50 border-blue-100 flex items-center justify-between">
              <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Class Avg</p><h3 className="text-3xl font-black text-blue-900">{stats?.average_score || 0}%</h3></div>
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600"><Percent size={24} /></div>
            </div>
            <div className="card-premium p-6 bg-green-50/50 border-green-100 flex items-center justify-between">
              <div><p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Pass Rate</p><h3 className="text-3xl font-black text-green-900">{stats?.pass_rate || 0}%</h3></div>
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600"><ArrowUpRight size={24} /></div>
            </div>
            <div className="card-premium p-6 bg-orange-50/50 border-orange-100 flex items-center justify-between">
              {/* Stats Placeholder */}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="relative">
            <School size={16} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={entryConfig.class_id} onChange={e => setEntryConfig({ ...entryConfig, class_id: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-brand-primary appearance-none"
            >
              <option value="">Target Class</option>
              {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 font-bold text-xs">AS</div>
            <select
              value={entryConfig.assessment_id} onChange={e => setEntryConfig({ ...entryConfig, assessment_id: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-brand-primary appearance-none"
            >
              <option value="">Select Assessment</option>
              {assessmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <BookOpen size={16} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={entryConfig.subject_id} onChange={e => setEntryConfig({ ...entryConfig, subject_id: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-brand-primary appearance-none"
            >
              <option value="">Target Subject</option>
              {subjectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="card-premium overflow-hidden border border-gray-100 min-h-[400px]">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text" placeholder="Search roster..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 ring-brand-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processing Data...</p>
            </div>
          ) : viewMode === 'entry' && (!entryConfig.class_id || !entryConfig.assessment_id) ? (
            <div className="flex flex-col items-center py-24 text-gray-300 gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><Edit3 size={32} strokeWidth={1} /></div>
              <p className="font-bold">Select Class and Assessment to load roster.</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Student Identity</th>
                  {viewMode === 'view' ? (
                    <>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">Grade</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-center">CA</th>
                      <th className="px-6 py-4 text-center">Exam</th>
                      <th className="px-6 py-4 text-center w-24">Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                          {(res.full_name || res.name || res.student?.user?.name || '?')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{res.full_name || res.name || res.student?.user?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.admission_number || res.student?.admission_number || 'ID-REF'}</p>
                        </div>
                      </div>
                    </td>
                    {viewMode === 'view' ? (
                      <>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${Number(res.marks_obtained || res.average) > 75 ? 'text-green-600' : 'text-gray-800'}`}>
                            {res.marks_obtained || res.average || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-500">{res.grade || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openUpdateModal(res)} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline inline-flex items-center gap-1">
                            Modify <Edit3 size={14} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number" value={entryData[res.id]?.ca}
                            onChange={(e) => handleScoreChange(res.id, 'ca', e.target.value)}
                            placeholder="-" className="w-16 p-2 bg-gray-50 border border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:ring-2 ring-brand-primary/10"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number" value={entryData[res.id]?.exam}
                            onChange={(e) => handleScoreChange(res.id, 'exam', e.target.value)}
                            placeholder="-" className="w-16 p-2 bg-gray-50 border border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:ring-2 ring-brand-primary/10"
                          />
                        </td>
                        <td className="px-6 py-4 text-center font-black text-brand-primary">
                          {(Number(entryData[res.id]?.ca || 0) + Number(entryData[res.id]?.exam || 0)) || 0}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4">
              <Inbox size={48} strokeWidth={1} />
              <p className="font-bold">No academic data found.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Result">
        <form onSubmit={(e) => { e.preventDefault(); submitUpdate(editFormData); }} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marks Obtained</label>
            <input
              required type="number" value={editFormData.marks_obtained}
              onChange={e => setEditFormData({ ...editFormData, marks_obtained: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Grade Letter</label>
            <input
              type="text" value={editFormData.grade} maxLength={5}
              onChange={e => setEditFormData({ ...editFormData, grade: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
              placeholder="e.g. A+"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teacher's Remark</label>
            <textarea
              rows={3} value={editFormData.comments}
              onChange={e => setEditFormData({ ...editFormData, comments: e.target.value })}
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
              placeholder="Optional comments..."
            />
          </div>
          <button type="submit" disabled={isUpdating} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
            {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Update Result</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Results;