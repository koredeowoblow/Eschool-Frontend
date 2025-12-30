
import React, { useState } from 'react';
import { BarChart3, FileDown, BookOpen, Search, Loader2, Inbox, Table, AlertCircle, RefreshCw, Layers, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useSelectOptions } from '../hooks/useSelectOptions';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadsheet' | 'missing'>('broadsheet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [broadsheet, setBroadsheet] = useState<any>(null);
  const [missingMarks, setMissingMarks] = useState<any[]>([]);
  const [filters, setFilters] = useState({ class_id: '', term_id: '' });
  
  const { options: classOptions } = useSelectOptions('/classes');
  const { options: termOptions } = useSelectOptions('/terms');

  const handleGenerateReport = async () => {
    if (!filters.class_id || !filters.term_id) return;
    setIsGenerating(true);
    try {
      if (activeTab === 'broadsheet') {
        const res = await api.get('/reports/broadsheet', { params: filters });
        setBroadsheet(res.data.data || res.data);
      } else {
        const res = await api.get('/reports/missing', { params: filters }); // GET api/v1/reports/missing
        setMissingMarks(res.data.data || res.data || []);
      }
    } catch (err) {
      console.error("Report generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCollate = async () => {
    setIsGenerating(true);
    try {
      await api.post('/reports/collate', filters);
      alert("Results collation successful! You can now generate the broadsheet.");
    } catch (err) {
      console.error("Collation error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Table className="text-brand-primary" /> Institutional Reports</h2>
          <p className="text-sm text-gray-500 font-medium">Consolidated academic performance and data audits</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <div className="flex bg-gray-100 p-1 rounded-xl mr-2">
              <button onClick={() => setActiveTab('broadsheet')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'broadsheet' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Broadsheet</button>
              <button onClick={() => setActiveTab('missing')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'missing' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Missing Data</button>
           </div>
           {activeTab === 'broadsheet' && (
             <button onClick={handleCollate} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
               <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} /> Collate Session
             </button>
           )}
           <button 
             onClick={handleGenerateReport} disabled={isGenerating || !filters.class_id}
             className="px-8 py-3 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2"
           >
             {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
             Fetch View
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
         <select 
           value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}
           className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:border-brand-primary transition-all"
         >
           <option value="">Select Targeted Class</option>
           {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
         <select 
           value={filters.term_id} onChange={e => setFilters({...filters, term_id: e.target.value})}
           className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:border-brand-primary transition-all"
         >
           <option value="">Select Target Term</option>
           {termOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100 min-h-[400px]">
        {activeTab === 'broadsheet' ? (
          broadsheet ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-black uppercase text-gray-400">Student Identity</th>
                    {broadsheet.subjects?.map((s: any) => (
                      <th key={s.id} className="p-4 font-black uppercase text-gray-400 text-center border-l border-gray-100">{s.code}</th>
                    ))}
                    <th className="p-4 font-black uppercase text-brand-primary text-center border-l border-gray-100">Avg %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {broadsheet.records?.map((row: any) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{row.name}</td>
                      {broadsheet.subjects?.map((s: any) => (
                        <td key={s.id} className="p-4 text-center border-l border-gray-50 text-gray-600 font-medium">
                          {row.scores?.[s.id] || '-'}
                        </td>
                      ))}
                      <td className="p-4 text-center border-l border-gray-50 font-black text-brand-primary">{row.average}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300 gap-4">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><BookOpen size={32} strokeWidth={1} /></div>
               <p className="font-bold">Select parameters to generate the broadsheet matrix.</p>
            </div>
          )
        ) : (
          missingMarks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr><th className="px-6 py-4">Subject Domain</th><th className="px-6 py-4">Lead Teacher</th><th className="px-6 py-4">Incomplete Entries</th><th className="px-6 py-4 text-right">Audit</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {missingMarks.map((m, i) => (
                    <tr key={i} className="hover:bg-red-50/20 transition-colors">
                      <td className="px-6 py-5 font-bold text-gray-800">{m.subject_name}</td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">{m.teacher_name}</td>
                      <td className="px-6 py-5"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black">{m.missing_count} Students</span></td>
                      <td className="px-6 py-5 text-right"><button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Send Reminder</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300 gap-4">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><ShieldAlert size={32} strokeWidth={1} /></div>
               <p className="font-bold">No data irregularities found for current class/term.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Reports;
