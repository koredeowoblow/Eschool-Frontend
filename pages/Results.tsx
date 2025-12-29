import React, { useState, useEffect } from 'react';
import { Trophy, Download, Search, Filter, ArrowUpRight, Percent, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Results: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchResults();
  }, []);

  const filteredResults = results.filter(r => 
    r.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Trophy className="text-brand-secondary" />
            Exam Results Board
          </h2>
          <p className="text-sm text-gray-500 font-medium">Academic Performance Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            Download Broadsheet
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
            Publish Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 bg-blue-50/50 border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Average Class Score</p>
            <h3 className="text-3xl font-bold text-blue-900">{stats?.average_score || 0}%</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
            <Percent size={24} />
          </div>
        </div>
        <div className="card-premium p-6 bg-green-50/50 border-green-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Pass Rate</p>
            <h3 className="text-3xl font-bold text-green-900">{stats?.pass_rate || 0}%</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600">
            <ArrowUpRight size={24} />
          </div>
        </div>
        <div className="card-premium p-6 bg-orange-50/50 border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Top Subject</p>
            <h3 className="text-xl font-bold text-orange-900">{stats?.top_subject || 'N/A'}</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 text-xs font-black">
            A+
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by student name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 ring-brand-primary/20 transition-all" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : filteredResults.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Admission</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Total Avg</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-400">{res.admission_number}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{res.full_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${Number(res.average) > 75 ? 'text-green-600' : Number(res.average) > 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {res.average || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">#{res.position || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-brand-primary hover:underline group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Report Card <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
               <Inbox size={48} strokeWidth={1} />
               <p className="font-bold">No results found for this search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;