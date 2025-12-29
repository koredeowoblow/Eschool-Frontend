import React, { useState, useEffect } from 'react';
import { Trophy, Download, Search, Filter, ArrowUpRight, Percent, Loader2, Inbox, Edit3, Save, School, BookOpen } from 'lucide-react';
import api from '../services/api';
import { useSelectOptions } from '../hooks/useSelectOptions';

const Results: React.FC = () => {
  const [viewMode, setViewMode] = useState<'view' | 'entry'>('view');
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [entryConfig, setEntryConfig] = useState({ class_id: '', subject_id: '', assessment_id: '' });
  const [entryData, setEntryData] = useState<Record<string, { ca: string, exam: string }>>({});

  const { options: classOptions } = useSelectOptions('/classes');
  const { options: subjectOptions } = useSelectOptions('/subjects');

  useEffect(() => {
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
    if (viewMode === 'view') fetchResults();
  }, [viewMode]);

  const fetchEntryStudents = async () => {
    if (!entryConfig.class_id) return;
    setIsLoading(true);
    try {
      const res = await api.get('/students', { params: { class_id: entryConfig.class_id, per_page: 100 } });
      const list = res.data.data || res.data || [];
      setResults(list);
      const initial = Object.fromEntries(list.map((s: any) => [s.id, { ca: '', exam: '' }]));
      setEntryData(initial);
    } catch (err) {
      console.error("Failed to load students for entry", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'entry' && entryConfig.class_id) {
      fetchEntryStudents();
    }
  }, [entryConfig.class_id, viewMode]);

  const handleScoreChange = (id: string, field: 'ca' | 'exam', value: string) => {
    setEntryData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const filteredResults = results.filter(r => 
    (r.full_name || r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Trophy className="text-brand-secondary" />
            {viewMode === 'view' ? 'Exam Results Board' : 'Grade Entry Portal'}
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Academic Session 2024/25 Performance Portfolio</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'view' ? 'entry' : 'view')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all ${
              viewMode === 'entry' ? 'bg-brand-secondary text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {viewMode === 'view' ? <Edit3 size={18} /> : <ArrowUpRight size={18} />}
            {viewMode === 'view' ? 'Enter Marks' : 'View Summary'}
          </button>
          {viewMode === 'view' ? (
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
              <Download size={18} /> Download Summary
            </button>
          ) : (
            <button className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20">
              <Save size={18} /> Save Batch
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
              <div><p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Top Subject</p><h3 className="text-xl font-black text-orange-900">{stats?.top_subject || 'Curriculum'}</h3></div>
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600 font-black">A+</div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="relative">
             <School size={16} className="absolute left-3 top-3 text-gray-400" />
             <select 
               value={entryConfig.class_id} onChange={e => setEntryConfig({...entryConfig, class_id: e.target.value})}
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-brand-primary appearance-none"
             >
               <option value="">Target Class</option>
               {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
           </div>
           <div className="relative">
             <BookOpen size={16} className="absolute left-3 top-3 text-gray-400" />
             <select 
               value={entryConfig.subject_id} onChange={e => setEntryConfig({...entryConfig, subject_id: e.target.value})}
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
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parsing Registry...</p>
            </div>
          ) : viewMode === 'entry' && !entryConfig.class_id ? (
            <div className="flex flex-col items-center py-24 text-gray-300 gap-4">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><Edit3 size={32} strokeWidth={1}/></div>
               <p className="font-bold">Select a Class and Subject to begin mark entry.</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Student Identity</th>
                  {viewMode === 'view' ? (
                    <>
                      <th className="px-6 py-4 text-center">Avg Score</th>
                      <th className="px-6 py-4 text-center">Rank</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-center">CA (40)</th>
                      <th className="px-6 py-4 text-center">Exam (60)</th>
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
                          {(res.full_name || res.name || '?')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{res.full_name || res.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.admission_number || 'STU-REF'}</p>
                        </div>
                      </div>
                    </td>
                    {viewMode === 'view' ? (
                      <>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${Number(res.average || res.avg_score) > 75 ? 'text-green-600' : 'text-orange-600'}`}>
                            {res.average || res.avg_score || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-500">#{res.position || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Report Card <ArrowUpRight size={14} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="number" max="40" value={entryData[res.id]?.ca}
                            onChange={(e) => handleScoreChange(res.id, 'ca', e.target.value)}
                            placeholder="00" className="w-16 p-2 bg-gray-50 border border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:ring-2 ring-brand-primary/10" 
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="number" max="60" value={entryData[res.id]?.exam}
                            onChange={(e) => handleScoreChange(res.id, 'exam', e.target.value)}
                            placeholder="00" className="w-16 p-2 bg-gray-50 border border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:ring-2 ring-brand-primary/10" 
                          />
                        </td>
                        <td className="px-6 py-4 text-center font-black text-brand-primary">
                          {(Number(entryData[res.id]?.ca || 0) + Number(entryData[res.id]?.exam || 0)) || 0}%
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
               <p className="font-bold">No academic data found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;