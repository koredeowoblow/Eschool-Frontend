
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, Search, Save, Loader2, Inbox, School } from 'lucide-react';
import api from '../services/api';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useNotification } from '../context/NotificationContext';

const Attendance: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const { showNotification } = useNotification();

  const { options: classOptions, isLoading: isLoadingClasses } = useSelectOptions('/classes');

  const fetchClassStudents = async (classId: string) => {
    if (!classId) return;
    setIsLoading(true);
    try {
      const res = await api.get('/students', { params: { class_id: classId, per_page: 100 } });
      const list = res.data.data || res.data || [];
      setStudents(list);
      
      const initial = Object.fromEntries(list.map((s: any) => [s.id, 'Present']));
      setAttendance(initial);
    } catch (err) {
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  const handleSaveAttendance = async () => {
    if (!selectedClass || students.length === 0) return;
    setIsSaving(true);
    try {
      // Synchronized with Backend specialized workflow requirements: student_id[], status[], note[]
      const payload = {
        date,
        class_id: selectedClass,
        student_id: Object.keys(attendance),
        status: Object.values(attendance),
        note: Object.keys(attendance).map(id => notes[id] || '')
      };
      await api.post('/attendance', payload);
      showNotification("Attendance register synchronized for selected class.", 'success');
    } catch (err: any) {
      showNotification(err.message || "Failed to sync attendance.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusStyle = (id: string, status: string) => {
    const active = attendance[id] === status;
    if (status === 'Present') return active ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100';
    if (status === 'Absent') return active ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100';
    if (status === 'Late') return active ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100';
    return '';
  };

  const filteredStudents = students.filter(s => 
    (s.full_name || s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center">
             <School size={24} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-gray-800 tracking-tight">Daily Register</h2>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Academic Session 2024/25</p>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 outline-none ring-1 ring-gray-100 focus:ring-brand-primary transition-all appearance-none min-w-[160px]"
            >
              <option value="">Select Class</option>
              {classOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input 
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-700 outline-none ring-1 ring-gray-200 focus:ring-brand-primary transition-all"
            />
          </div>
          <button 
            onClick={handleSaveAttendance}
            disabled={isSaving || !selectedClass}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Register
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100 min-h-[400px]">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" placeholder="Filter current roster..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs font-medium outline-none" 
            />
          </div>
          {!isLoading && students.length > 0 && (
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] font-black text-gray-400 uppercase">Present: {Object.values(attendance).filter(v => v === 'Present').length}</span></div>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Syncing Roster...</p>
            </div>
          ) : !selectedClass ? (
            <div className="flex flex-col items-center py-24 gap-4 text-gray-300">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                 <School size={32} strokeWidth={1}/>
               </div>
               <p className="font-bold text-gray-400">Please select a class to start marking attendance.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-2 text-gray-300">
               <Inbox size={48} strokeWidth={1}/>
               <p className="font-bold">No students matched your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4 w-20">Status</th>
                  <th className="px-6 py-4">Student Identity</th>
                  <th className="px-6 py-4 text-center">Marking Action</th>
                  <th className="px-6 py-4">Internal Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        attendance[student.id] === 'Present' ? 'bg-green-500' :
                        attendance[student.id] === 'Absent' ? 'bg-red-500' : 'bg-orange-500'
                      }`}></div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{student.full_name || student.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{student.admission_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setAttendance({...attendance, [student.id]: 'Present'})} className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${getStatusStyle(student.id, 'Present')}`}>Present</button>
                        <button onClick={() => setAttendance({...attendance, [student.id]: 'Late'})} className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${getStatusStyle(student.id, 'Late')}`}>Late</button>
                        <button onClick={() => setAttendance({...attendance, [student.id]: 'Absent'})} className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${getStatusStyle(student.id, 'Absent')}`}>Absent</button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" placeholder="Add remark..." 
                        value={notes[student.id] || ''}
                        onChange={e => setNotes({...notes, [student.id]: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 text-xs outline-none focus:ring-1 ring-brand-primary/20"
                      />
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
