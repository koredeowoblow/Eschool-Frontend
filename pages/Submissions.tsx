
import React from 'react';
import { CheckSquare, Download, MessageSquare, Star, Search, Filter } from 'lucide-react';

const Submissions: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Homework Submissions</h2>
          <p className="text-sm text-gray-500 font-medium">Assignment: Calculus Worksheet #4 • Math 10A</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold shadow-sm"><Filter size={18}/> Filter</button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="p-4 bg-gray-50/30 border-b border-gray-50 flex items-center justify-between">
           <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Find student..." className="w-full pl-9 pr-4 py-2 bg-white border-none rounded-lg text-xs font-medium outline-none" />
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Graded: 12 / 30</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Submission Date</th>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Marks</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Alice Smith', date: '2 hours ago', status: 'Graded', marks: '18/20' },
                { name: 'John Doe', date: '5 hours ago', status: 'Pending', marks: '-' },
              ].map((sub, i) => (
                <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-800 text-sm">{sub.name}</td>
                  <td className="px-6 py-5 text-xs text-gray-400 font-bold">{sub.date}</td>
                  <td className="px-6 py-5">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-brand-primary hover:text-white transition-all">
                      <Download size={12}/> Worksheet.pdf
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    {sub.status === 'Graded' ? (
                      <span className="font-black text-brand-primary">{sub.marks}</span>
                    ) : (
                      <input type="number" placeholder="00" className="w-12 p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-black outline-none focus:ring-2 ring-brand-primary/10" />
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-brand-secondary transition-colors"><MessageSquare size={18}/></button>
                       <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Star size={18}/></button>
                    </div>
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

export default Submissions;
