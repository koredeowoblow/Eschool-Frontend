
import React from 'react';
import { Receipt, Search, Filter, ArrowDownToLine } from 'lucide-react';

const Payments: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-xl text-sm font-bold shadow-sm">
            <Filter size={18} /> Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold shadow-lg">
            <ArrowDownToLine size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Receipt #</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                  <td className="px-6 py-5 font-black text-brand-primary">RCP-00{i}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-800">John Doe</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Grade 10A</p>
                  </td>
                  <td className="px-6 py-5 font-black text-gray-800">$1,200</td>
                  <td className="px-6 py-5 text-xs font-bold text-gray-500">Card Payment</td>
                  <td className="px-6 py-5 text-xs text-gray-400 font-bold">May 20, 2024</td>
                  <td className="px-6 py-5 text-right">
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
