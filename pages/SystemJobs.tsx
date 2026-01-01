
import React, { useState, useEffect } from 'react';
import { Cpu, Activity, AlertCircle, CheckCircle2, RotateCw, Trash2, ChevronRight, X, Loader2, Play, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';

const SystemJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/jobs', { params: { page } });
      const rolesData = res.data?.data ?? res.data;
      setJobs(Array.isArray(rolesData) ? rolesData : rolesData.data || []);
      setPagination(rolesData.links ? rolesData : null);
    } catch (err) {
      console.error("Failed to load dead letter queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRetry = async (id: string | 'all') => {
    setIsRetrying(true);
    try {
      const endpoint = id === 'all' ? '/jobs/retry/all' : `/jobs/retry/${id}`;
      await api.post(endpoint);
      fetchJobs();
      setSelectedJob(null);
    } catch (err) {
      console.error("Rescue operation failed:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleForget = async (id: string) => {
    if (!window.confirm("Permanently discard this failed execution trace?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
      setSelectedJob(null);
    } catch (err) {
      console.error("Purge failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Cpu className="text-brand-primary" />
            Dead Letter Queue
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Managing failed background transactions and async exceptions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchJobs()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
          <button
            onClick={() => handleRetry('all')}
            className="px-6 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all"
          >
            Retry All Failures
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100 min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Job Payload ID</th>
                <th className="px-6 py-5">Execution Channel</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Fatal Exception Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : jobs.length > 0 ? (
                jobs.map((j) => (
                  <tr key={j.id} onClick={() => setSelectedJob(j)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="font-bold text-gray-700 text-sm truncate max-w-[300px]">{j.uuid || j.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 font-black uppercase text-[9px] tracking-widest rounded-lg">
                        {j.queue}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
                        Execution Failed
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-xs font-bold text-gray-400 flex items-center justify-end gap-2 group-hover:text-brand-primary">
                      {j.failed_at} <ChevronRight size={14} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-32">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <CheckCircle2 size={48} strokeWidth={1} />
                      <p className="font-bold text-sm">System integrity confirmed. No failed jobs detected.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Async Exception Insight">
        {selectedJob && (
          <div className="space-y-6">
            <div className="p-5 bg-red-50 text-red-700 border border-red-100 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} />
                <span className="font-black uppercase text-[10px] tracking-widest">Fatal Execution Trace</span>
              </div>
              <span className="text-xs font-bold">{selectedJob.failed_at}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payload Identity</label>
                <div className="p-5 bg-gray-900 rounded-3xl font-mono text-[11px] text-brand-secondary overflow-x-auto custom-scrollbar border border-white/5">
                  <pre>{JSON.stringify(selectedJob.connection + ':' + selectedJob.queue, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Stack Trace Summary</label>
                <div className="p-5 bg-gray-50 rounded-3xl font-mono text-[10px] text-red-600 border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar leading-relaxed">
                  {selectedJob.exception || 'Stack trace buffer empty.'}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => handleForget(selectedJob.id)}
                className="flex-1 py-4 bg-gray-50 text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
              >
                Purge Trace
              </button>
              <button
                onClick={() => handleRetry(selectedJob.id)} disabled={isRetrying}
                className="flex-2 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
              >
                {isRetrying ? <Loader2 className="animate-spin" size={20} /> : <><Play size={18} /> Re-Dispatch Job</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemJobs;
