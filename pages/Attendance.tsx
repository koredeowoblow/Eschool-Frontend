import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, Search, Save, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Attendance: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClassStudents = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/students', { params: { paginate: 0 } });
        const list = res.data.data || res.data;
        setStudents(list);
        
        // Initialize attendance state
        const initial = Object.fromEntries(list.map((s: any) => [s.id, 'Present']));
        setAttendance(initial);
      } catch (err) {
        console.error("Failed to load students for attendance", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassStudents();
  }, []);

  const toggleStatus = (id: string, status: string) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const getStatusStyle = (id: string, status: string) => {
    const active = attendance[id] === status;
    if (status === 'Present') return active ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100';
    if (status === 'Absent') return active ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100';
    if (status === 'Late') return active ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100';
    return '';
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daily Attendance</h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Register for Academic Session 2024/25</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-700 outline-none ring-1 ring-gray-200 focus:ring-brand-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
            <Save size={18} />
            Save Register
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs font-medium outline-none" 
            />
          </div>
          {!isLoading && (
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] font-bold text-gray-400 uppercase">Present: {Object.values(attendance).filter(v => v === 'Present').length}</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-gray-400 uppercase">Absent: {Object.values(attendance).filter(v => v === 'Absent').length}</span></div>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase">Loading student roster...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-2 text-gray-300">
               <Inbox size={48} strokeWidth={1}/>
               <p className="font-bold">No students found.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        attendance[student.id] === 'Present' ? 'bg-green-500' :
                        attendance[student.id] === 'Absent' ? 'bg-red-500' : 'bg-orange-500'
                      }`}></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-sm border border-white">
                          {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover"/> : student.name[0]}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => toggleStatus(student.id, 'Present')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${getStatusStyle(student.id, 'Present')}`}
                        >
                          <CheckCircle2 size={14} />
                          Present
                        </button>
                        <button 
                          onClick={() => toggleStatus(student.id, 'Late')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${getStatusStyle(student.id, 'Late')}`}
                        >
                          <Clock size={14} />
                          Late
                        </button>
                        <button 
                          onClick={() => toggleStatus(student.id, 'Absent')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${getStatusStyle(student.id, 'Absent')}`}
                        >
                          <XCircle size={14} />
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;