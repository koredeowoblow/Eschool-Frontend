
import React from 'react';
import { Cpu, Activity, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

const SystemJobs: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Cpu className="text-brand-primary" />
          Background Jobs
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            <RotateCw size={14} className="animate-spin-slow" /> Refresh
          </button>
          <button className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg">Clear Queues</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium p-6 bg-blue-50/30 border-blue-100 border">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Queued</p>
          <p className="text-2xl font-black text-blue-900">42</p>
        </div>
        <div className="card-premium p-6 bg-green-50/30 border-green-100 border">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Processing</p>
          <p className="text-2xl font-black text-green-900">12</p>
        </div>
        <div className="card-premium p-6 bg-red-50/30 border-red-100 border">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Failed</p>
          <p className="text-2xl font-black text-red-900">3</p>
        </div>
        <div className="card-premium p-6 bg-gray-50/30 border-gray-200 border">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Finished (24h)</p>
          <p className="text-2xl font-black text-gray-900">1.5k</p>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Job Name</th>
              <th className="px-6 py-4">Queue</th>
              <th className="px-6 py-4">Payload</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { name: 'App\\Jobs\\SendFeeReminder', q: 'high', p: 'school_id: 12', s: 'Processing' },
              { name: 'App\\Jobs\\GenerateResultsPdf', q: 'default', p: 'student_id: 442', s: 'Queued' },
              { name: 'App\\Jobs\\SyncLibraryData', q: 'low', p: 'null', s: 'Failed' },
            ].map((j, i) => (
              <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-5 font-bold text-gray-800 text-sm">{j.name}</td>
                <td className="px-6 py-5 uppercase font-bold text-gray-400 text-[10px]">{j.q}</td>
                <td className="px-6 py-5 font-mono text-xs text-brand-primary">{j.p}</td>
                <td className="px-6 py-5">
                   <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      j.s === 'Processing' ? 'bg-blue-100 text-blue-700' : j.s === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {j.s}
                    </span>
                </td>
                <td className="px-6 py-5 text-right text-xs font-bold text-gray-400">2s ago</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemJobs;
