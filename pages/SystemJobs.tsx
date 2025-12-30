
import React, { useState, useEffect } from 'react';
import { Cpu, Activity, AlertCircle, CheckCircle2, RotateCw, Trash2, ChevronRight, X, Loader2, Play } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';

const SystemJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/system-jobs');
      setJobs(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRetry = async (id: string) => {
    setIsRetrying(true);
    try {
      await api.post(`/system-jobs/${id}/retry`);
      fetchJobs();
      setSelectedJob(null);
    } catch (err) {
      console.error("Retry failed", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const counts = {
    queued: jobs.filter(j => j.status === 'Queued').length,
    processing: jobs.filter(j => j.status === 'Processing').length,
    failed: jobs.filter(j => j.status === 'Failed').length,
    finished: jobs.filter(j => j.status === 'Finished').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Cpu className="text-brand-primary" />
          Background Operations
        </h2>
        <div className="flex gap-2">
          <button onClick={fetchJobs} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
          <button className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Flush Queues</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium p-6 bg-blue-50/30 border-blue-100 border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><RotateCw size={80} /></div>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 relative z-10">Queued</p>
          <p className="text-2xl font-black text-blue-900 relative z-10">{counts.queued}</p>
        </div>
        <div className="card-premium p-6 bg-green-50/30 border-green-100 border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Activity size={80} /></div>
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1 relative z-10">Processing</p>
          <p className="text-2xl font-black text-green-900 relative z-10">{counts.processing}</p>
        </div>
        <div className="card-premium p-6 bg-red-50/30 border-red-100 border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><AlertCircle size={80} /></div>
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 relative z-10">Failed</p>
          <p className="text-2xl font-black text-red-900 relative z-10">{counts.failed}</p>
        </div>
        <div className="card-premium p-6 bg-gray-50/30 border-gray-200 border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle2 size={80} /></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Success (24h)</p>
          <p className="text-2xl font-black text-gray-900 relative z-10">{counts.finished}</p>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Job Namespace</th>
                <th className="px-6 py-4">Queue Channel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Last Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : jobs.length > 0 ? (
                jobs.map((j) => (
                  <tr key={j.id} onClick={() => setSelectedJob(j)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-5 font-bold text-gray-800 text-sm group-hover:text-brand-primary transition-colors">{j.name}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 font-black uppercase text-[9px] tracking-widest rounded-lg">
                        {j.queue}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          j.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                          j.status === 'Failed' ? 'bg-red-100 text-red-700' : 
                          j.status === 'Queued' ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'
                        }`}>
                          {j.status}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-right text-xs font-bold text-gray-400 flex items-center justify-end gap-2 group-hover:text-brand-primary">
                       {j.created_at} <ChevronRight size={14} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-20 text-center font-bold text-gray-400">Queue is currently empty.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Job Context Detail">
        {selectedJob && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl flex items-center justify-between ${
              selectedJob.status === 'Failed' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-bold uppercase text-[10px] tracking-widest">Job Status: {selectedJob.status}</span>
              </div>
              <span className="text-xs font-bold">{selectedJob.created_at}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payload Data</label>
                <div className="p-4 bg-gray-900 rounded-2xl font-mono text-xs text-brand-secondary overflow-x-auto whitespace-pre custom-scrollbar">
                  {JSON.stringify(selectedJob.payload, null, 2)}
                </div>
              </div>

              {selectedJob.status === 'Failed' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Exception Trace</label>
                  <div className="p-4 bg-red-50 rounded-2xl font-mono text-[10px] text-red-600 border border-red-100 max-h-40 overflow-y-auto custom-scrollbar leading-relaxed">
                    {selectedJob.exception || 'Stack trace not captured.'}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setSelectedJob(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Close Panel</button>
              {selectedJob.status === 'Failed' && (
                <button 
                  onClick={() => handleRetry(selectedJob.id)} disabled={isRetrying}
                  className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  {isRetrying ? <Loader2 className="animate-spin" size={18}/> : <><Play size={16}/> Retry Operation</>}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemJobs;
