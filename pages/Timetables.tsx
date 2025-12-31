
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, MonitorPlay, Loader2, Inbox, Plus, School, BookOpen, Save, Calendar, X } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Timetables: React.FC = () => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { options: classOptions } = useSelectOptions('/classes');
  const { options: subjectOptions } = useSelectOptions('/subjects');
  const { options: teacherOptions } = useSelectOptions('/teachers');

  const [formData, setFormData] = useState({
    class_room_id: '',
    subject_id: '',
    teacher_id: '',
    day: 'Monday',
    start_time: '08:00',
    end_time: '09:00'
  });

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

  useEffect(() => {
    fetchTimetable();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const openEditModal = (slot: any) => {
    setIsEditMode(true);
    setEditingSlot(slot);
    setFormData({
      class_room_id: slot.class_room_id ? String(slot.class_room_id) : '',
      subject_id: slot.subject_id ? String(slot.subject_id) : '',
      teacher_id: slot.teacher_id ? String(slot.teacher_id) : '',
      day: slot.day || 'Monday',
      start_time: slot.start_time || '08:00',
      end_time: slot.end_time || '09:00'
    });
    setIsModalOpen(true);
  };

  const { submit, isSubmitting } = useFormSubmit(
    (data) => {
      if (isEditMode && editingSlot) {
        return api.put(`/timetables/${editingSlot.id}`, data);
      }
      return api.post('/timetables', data);
    },
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingSlot(null);
        fetchTimetable();
      }
    }
  );

  const handleCellClick = (day: string, time: string) => {
    // Calculate end time (1 hour block default)
    const [hour, min] = time.split(':');
    const endHour = String(Number(hour) + 1).padStart(2, '0');

    setFormData({
      ...formData,
      day,
      start_time: time,
      end_time: `${endHour}:${min}`
    });
    setIsModalOpen(true);
  };

  const getSubjectColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
      'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-amber-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-brand-primary" />
            Institutional Scheduling Grid
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Click any empty cell to provision a subject slot</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus size={18} /> Manual Entry
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Grid Matrix...</p>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="w-24 p-4 border-r border-gray-100 text-center">Time Slot</th>
                  {DAYS.map(day => <th key={day} className="p-4 border-r border-gray-100 text-center">{day}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TIMES.map(time => (
                  <tr key={time} className="h-32">
                    <td className="p-4 text-center text-xs font-black text-gray-400 bg-gray-50/20 border-r border-gray-100">{time}</td>
                    {DAYS.map(day => {
                      const session = schedule.find(s => s.day === day && s.start_time?.startsWith(time));
                      return (
                        <td
                          key={`${day}-${time}`}
                          className="p-1 border-r border-gray-50 align-top relative group"
                          onClick={() => !session && handleCellClick(day, time)}
                        >
                          {session ? (
                            <div onClick={(e) => { e.stopPropagation(); openEditModal(session); }} className={`p-3 rounded-xl h-full text-white shadow-sm transition-all hover:shadow-md cursor-pointer ${getSubjectColor(session.subject?.name || 'Academic')}`}>
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] font-black uppercase leading-tight line-clamp-2">{session.subject?.name || session.subject_name}</p>
                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"><X size={10} /></button>
                              </div>
                              <p className="text-[9px] font-bold text-white/80 uppercase">{session.class_room?.name}</p>
                              <div className="flex items-center gap-1 text-[8px] font-black text-white/60 mt-auto pt-2 border-t border-white/10">
                                <Clock size={10} /> {session.start_time} - {session.end_time}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full rounded-xl border-2 border-dashed border-transparent group-hover:border-gray-100 group-hover:bg-gray-50/50 flex items-center justify-center cursor-pointer transition-all">
                              <Plus size={16} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
                            </div>
                          )}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Update Schedule Slot" : "Provision Schedule Slot"}>
        <form onSubmit={e => { e.preventDefault(); submit(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Unit</label>
              <select required value={formData.class_room_id} onChange={e => setFormData({ ...formData, class_room_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Class</option>
                {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Domain</label>
              <select required value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                <option value="">Select Subject</option>
                {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Teacher</label>
            <select required value={formData.teacher_id} onChange={e => setFormData({ ...formData, teacher_id: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
              <option value="">Select Teacher</option>
              {teacherOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Day of Week</label>
            <select required value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commencement (Start)</label>
              <input required type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Conclusion (End)</label>
              <input required type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase shadow-lg flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Commit to Schedule</>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Timetables;
