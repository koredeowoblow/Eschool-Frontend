
import React from 'react';
import { BarChart3, PieChart, FileDown, TrendingUp, Users, BookOpen } from 'lucide-react';

const Reports: React.FC = () => {
  const reportCategories = [
    { name: 'Academic Performance', icon: BookOpen, count: 12, color: 'bg-blue-600' },
    { name: 'Student Demographics', icon: Users, count: 4, color: 'bg-orange-500' },
    { name: 'Financial Summaries', icon: TrendingUp, count: 8, color: 'bg-green-600' },
    { name: 'Attendance Trends', icon: BarChart3, count: 15, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Reports</h2>
        <p className="text-sm text-gray-500 font-medium">Data-driven insights for school administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCategories.map((cat, i) => (
          <div key={i} className="card-premium p-6 group cursor-pointer hover:border-brand-primary/10 border border-transparent transition-all">
            <div className={`w-12 h-12 ${cat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200`}>
              <cat.icon size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{cat.name}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.count} Reports Available</p>
          </div>
        ))}
      </div>

      <div className="card-premium p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Popular Reports</h3>
        <div className="space-y-2">
          {[
            { title: 'Annual GPA Progression', format: 'PDF', size: '2.4 MB', date: 'May 2024' },
            { title: 'Termly Revenue Distribution', format: 'Excel', size: '1.1 MB', date: 'Apr 2024' },
            { title: 'Staff Performance Matrix', format: 'PDF', size: '4.8 MB', date: 'May 2024' },
            { title: 'Student Withdrawal Analysis', format: 'CSV', size: '0.5 MB', date: 'Mar 2024' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center group-hover:text-brand-primary transition-colors">
                  <FileDown size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{report.title}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {report.format} • {report.size} • Created {report.date}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 text-xs font-bold text-brand-primary border border-brand-primary/20 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
