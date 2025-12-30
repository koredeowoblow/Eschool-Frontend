
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Calendar, Wallet, TrendingUp, Sparkles, Send, Loader2, School, Activity, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import StatsCard from '../components/common/StatsCard';
import { getAcademicAdvice } from '../services/geminiService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data.data || statsRes.data);
      } catch (err) {
        console.warn("Stats fetch failed:", err);
      }
      
      if (!isSuperAdmin) {
        try {
          const chartRes = await api.get('/dashboard/attendance-trends');
          setAttendanceData(Array.isArray(chartRes.data.data) ? chartRes.data.data : []);
        } catch (err) {
          setAttendanceData([]);
        }
      }
    };
    fetchDashboardData();
  }, [isSuperAdmin]);

  const handleAiAssistant = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    const result = await getAcademicAdvice(aiQuery);
    setAiResponse(result || "No response received.");
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSuperAdmin ? 'Platform Pulse' : `Welcome, ${user?.name.split(' ')[0]}`}
          </h1>
          <p className="text-slate-500 font-medium">
            {isSuperAdmin ? 'Real-time multi-tenant health monitoring.' : 'Monitoring school operations with precision.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
             <ShieldCheck size={18} className="text-green-500" /> System: Stable
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isSuperAdmin ? (
          <>
            <StatsCard label="Total Schools" value={stats?.total_schools || 0} icon={School} color="bg-brand-primary" />
            <StatsCard label="Global Users" value={stats?.total_users?.toLocaleString() || 0} icon={Users} color="bg-brand-secondary" />
            <StatsCard label="System Uptime" value="99.9%" icon={Activity} color="bg-emerald-600" />
            <StatsCard label="Platform ARR" value={`$${(stats?.revenue || 0).toLocaleString()}`} icon={Wallet} color="bg-indigo-600" />
          </>
        ) : (
          <>
            <StatsCard label="Total Students" value={stats?.total_students || 0} icon={Users} color="bg-brand-primary" trend={stats?.student_trend} />
            <StatsCard label="Active Teachers" value={stats?.total_teachers || 0} icon={UserPlus} color="bg-brand-secondary" />
            <StatsCard label="Avg. Attendance" value={`${stats?.attendance_rate || 0}%`} icon={Calendar} color="bg-indigo-600" />
            <StatsCard label="Monthly Revenue" value={`$${(stats?.revenue || 0).toLocaleString()}`} icon={Wallet} color="bg-emerald-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="card-premium p-6 h-full min-h-[400px]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {isSuperAdmin ? 'Global Registration Trends' : 'Attendance Trends'}
              </h2>
            </div>
            {attendanceData.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey={isSuperAdmin ? "registrations" : "attendance"} stroke="#0d6efd" strokeWidth={4} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-300 gap-2">
                <TrendingUp size={48} strokeWidth={1} />
                <p className="text-sm font-bold uppercase tracking-widest">Awaiting trend data from tenants</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium p-7 bg-gradient-to-br from-brand-primary to-blue-800 text-white border-none shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-brand-secondary" size={24} />
              <h2 className="text-lg font-black uppercase italic">Gemini AI Assistant</h2>
            </div>
            <div className="relative mb-6">
              <input 
                type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
                placeholder={isSuperAdmin ? "Query global system data..." : "Query school data..."}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 px-5 text-sm outline-none focus:bg-white/20 transition-all pr-14"
                onKeyDown={(e) => e.key === 'Enter' && handleAiAssistant()}
              />
              <button onClick={handleAiAssistant} disabled={isAiLoading} className="absolute right-2.5 top-2 p-2 bg-brand-secondary text-white rounded-xl shadow-lg">
                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            {aiResponse && (
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10 text-sm max-h-40 overflow-y-auto custom-scrollbar">
                <p className="italic font-medium leading-relaxed">"{aiResponse}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
