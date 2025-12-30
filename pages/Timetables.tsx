
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, MonitorPlay, Loader2, Inbox, Plus, School, BookOpen, Save } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Timetables: React.FC = () => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const TIMES = ['08:00', '09:30', '11:00', '12:30', '14:00'];
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { options: classOptions } = useSelectOptions('/classes');
  const { options: subjectOptions } = useSelectOptions('/subjects');

  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/timetables');
      setSchedule(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({ class_room_id: '', subject_id: '', day: 'Mon', start_time: '08:00', end_time: '09:30' });
  const { submit, isSubmitting } = useFormSubmit(
    (data) => api.post('/timetables', data),
    { onSuccess: () => { setIsModalOpen(false); fetchTimetable(); } }
  );

  useEffect(() => {
    fetchTimetable();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Academic Timetable</h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Institutional schedule management</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> Define Slot
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Schedule...</p>
             </div>
          ) : (
            <table className="w-full table-fixed border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="w-24 p-4 border-r border-gray-100 text-center">Time</th>
                  {DAYS.map(day => <th key={day} className="p-4 border-r border-gray-100 text-center">{day}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TIMES.map(time => (
                  <tr key={time} className="h-28">
                    <td className="p-4 text-center text-xs font-black text-gray-400 bg-gray-50/20 border-r border-gray-100">{time}</td>
                    {DAYS.map(day => {
                      const session = schedule.find(s => s.day === day && s.start_time?.startsWith(time));
                      return (
                        <td key={`${day}-${time}`} className="p-2 border-r border-gray-50 align-top">
                          {session ? (
                            <div className="p-3 rounded-xl h-full bg-blue-50 border border-blue-100 flex flex-col justify-between group hover:shadow-lg transition-all">
                              <div>
                                <p className="text-[10px] font-black uppercase text-brand-primary mb-1 line-clamp-1">{session.subject?.name || session.subject_name}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase">{session.class_room?.name}</p>
                              </div>
                              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400 mt-2">
                                <Clock size={10}/> {session.start_time} - {session.end_time}
                              </div>
                            </div>
                          ) : <div className="h-full bg-gray-50/20 rounded-xl border border-dashed border-gray-100 opacity-30"></div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initialize Schedule Slot">
        <form onSubmit={e => { e.preventDefault(); submit(formData); }} className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
                <select required value={formData.class_room_id} onChange={e => setFormData({...formData, class_room_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                   <option value="">Select Class</option>
                   {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Subject</label>
                <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                   <option value="">Select Subject</option>
                   {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
             </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Day of Week</label>
              <select required value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commencement (Start)</label>
                <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Conclusion (End)</label>
                <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black" />
              </div>
           </div>
           <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
             {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Commit to Schedule</>}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default Timetables;
