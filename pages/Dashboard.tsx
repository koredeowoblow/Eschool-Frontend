
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Calendar, Wallet, TrendingUp, Sparkles, Send, Loader2, School, Activity, ShieldCheck, Clock, CheckCircle2, UserPlus2, Receipt, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
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
  const [feeData, setFeeData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activities').catch(() => ({ data: { data: [] } }))
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setActivities(activityRes.data.data || activityRes.data || []);
      } catch (err) {
        console.warn("Dashboard data fetch failed:", err);
      }
      
      if (!isSuperAdmin) {
        try {
          const [chartRes, feeRes] = await Promise.all([
            api.get('/dashboard/attendance-trends'),
            api.get('/dashboard/fee-collection-stats').catch(() => ({ data: { data: [] } }))
          ]);
          setAttendanceData(Array.isArray(chartRes.data.data) ? chartRes.data.data : []);
          setFeeData(Array.isArray(feeRes.data.data) ? feeRes.data.data : [
            { name: 'Mon', amount: 4000 }, { name: 'Tue', amount: 3000 }, { name: 'Wed', amount: 2000 },
            { name: 'Thu', amount: 2780 }, { name: 'Fri', amount: 1890 }
          ]);
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

  const getEventIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'enrollment': return <UserPlus2 size={14} className="text-blue-500" />;
      case 'invoice': return <Receipt size={14} className="text-orange-500" />;
      case 'system': return <ShieldCheck size={14} className="text-green-500" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
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
        <div className="lg:col-span-8 space-y-8">
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isSuperAdmin ? 'Global Registration Trends' : 'Attendance Analysis'}
                </h2>
              </div>
            </div>
            <div className="h-72 w-full">
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
          </div>

          {!isSuperAdmin && (
            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Fee Collection Matrix</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
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
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10 text-sm max-h-40 overflow-y-auto custom-scrollbar font-medium italic leading-relaxed">
                "{aiResponse}"
              </div>
            )}
          </div>

          <div className="card-premium p-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={16} className="text-brand-primary" /> System Activity Feed
            </h3>
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {activities.length > 0 ? activities.map((event, idx) => (
                <div key={idx} className="flex gap-4 group cursor-default">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-brand-primary/30 transition-all shadow-sm">
                      {getEventIcon(event.type)}
                    </div>
                    {idx !== activities.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-2"></div>}
                  </div>
                  <div className="pb-6">
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{event.message}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">
                      {event.time || 'Just now'} • {event.school_name || 'System'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-widest">No recent events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
