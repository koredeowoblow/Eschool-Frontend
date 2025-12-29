
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, MonitorPlay, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Timetables: React.FC = () => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const TIMES = ['08:00', '09:30', '11:00', '12:30', '14:00'];
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    fetchTimetable();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Weekly Timetable</h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Academic Schedule 2024/25</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button className="px-4 py-2 bg-white text-brand-primary text-xs font-bold rounded-lg shadow-sm">Grid View</button>
          <button className="px-4 py-2 text-gray-500 text-xs font-bold rounded-lg">List View</button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Schedule...</p>
             </div>
          ) : (
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-24 p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 text-xs font-bold text-gray-800 border-r border-gray-100">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map(time => (
                  <tr key={time} className="border-t border-gray-50">
                    <td className="p-4 text-center text-xs font-bold text-gray-400 bg-gray-50/30 border-r border-gray-100">
                      {time}
                    </td>
                    {DAYS.map(day => {
                      const session = schedule.find(s => s.day === day && s.time === time);
                      return (
                        <td key={`${day}-${time}`} className="p-2 border-r border-gray-50 min-h-[100px] align-top">
                          {session ? (
                            <div className={`p-3 rounded-xl h-full border transition-all hover:scale-[1.02] cursor-pointer ${
                              session.type === 'Online' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
                            }`}>
                              <p className={`text-[10px] font-black uppercase mb-1 ${
                                session.type === 'Online' ? 'text-orange-600' : 'text-brand-primary'
                              }`}>{session.subject_name}</p>
                              <p className="text-[9px] font-bold text-gray-600 mb-2">{session.teacher_name}</p>
                              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400 uppercase">
                                {session.type === 'Online' ? <MonitorPlay size={10}/> : <MapPin size={10}/>}
                                {session.room}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full bg-gray-50/20 rounded-xl border border-dashed border-gray-100 min-h-[60px]"></div>
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
    </div>
  );
};

export default Timetables;
