
import React, { useState } from 'react';
import { CheckSquare, Download, MessageSquare, Star, Search, Filter, Loader2, Inbox, Save } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';

const fetchSubmissionsApi = async ({ page, search, filters }: any) => {
  const response = await api.get('/assignment-submissions', { params: { page, search, ...filters } }); // GET api/v1/assignment-submissions
  return response.data;
};

const Submissions: React.FC = () => {
  const { data, isLoading, search, setSearch, refresh } = useDataTable(fetchSubmissionsApi);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<Record<string, string>>({});

  const handleGrade = async (id: string) => {
    if (!gradeInput[id]) return;
    setGradingId(id);
    try {
      await api.put(`/assignment-submissions/${id}`, { marks: gradeInput[id], status: 'Graded' }); // PUT api/v1/assignment-submissions/{id}
      refresh();
    } catch (err) {
      console.error("Grading failed", err);
    } finally {
      setGradingId(null);
    }
  };

  const columns = [
    { 
      header: 'Student Identity', 
      key: 'student_name',
      render: (sub: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400">{(sub.student_name || 'S')[0]}</div>
          <p className="font-bold text-gray-800 text-sm">{sub.student_name}</p>
        </div>
      )
    },
    { header: 'Task', key: 'assignment_title', className: 'text-xs font-bold text-gray-500' },
    { header: 'Uploaded', key: 'created_at', className: 'text-xs text-gray-400 font-bold' },
    { 
      header: 'Grade / Feedback', 
      key: 'marks',
      render: (sub: any) => (
        <div className="flex items-center gap-2">
          {sub.status === 'Graded' ? (
            <span className="w-12 py-1 bg-green-50 text-green-700 text-center font-black rounded-lg border border-green-100">{sub.marks}%</span>
          ) : (
            <div className="flex items-center gap-1">
              <input 
                type="number" max="100" 
                value={gradeInput[sub.id] || ''}
                onChange={(e) => setGradeInput({...gradeInput, [sub.id]: e.target.value})}
                className="w-12 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-black outline-none focus:ring-2 ring-brand-primary/10" 
              />
              <button onClick={() => handleGrade(sub.id)} className="p-1.5 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition-all">
                {gradingId === sub.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      key: 'actions',
      className: 'text-right',
      render: (sub: any) => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-gray-400 hover:text-brand-primary rounded-xl transition-all" title="Download Asset"><Download size={18}/></button>
          <button className="p-2 text-gray-400 hover:text-brand-secondary rounded-xl transition-all"><MessageSquare size={18}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Learning Submissions</h2>
          <p className="text-sm text-gray-500 font-medium">Monitoring independent student performance</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input 
            type="text" placeholder="Search by student or task..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
};

export default Submissions;
