
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Calendar, Wallet, TrendingUp, Sparkles, Send, Loader2, School as SchoolIcon, 
  Activity, ShieldCheck, Clock, Receipt, BarChart3, PiggyBank, Building, BookOpen, FileText, Award,
  // Fix: Added missing Inbox import
  Inbox
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import StatsCard from '../components/common/StatsCard';
import { getAcademicAdvice } from '../services/geminiService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole, DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activities').catch(() => ({ data: { data: [] } }))
        ]);
        
        setStats(statsRes.data.data || statsRes.data);
        setActivities(activityRes.data.data || activityRes.data || []);
      } catch (err) {
        console.warn("Dashboard data fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAiAssistant = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    const result = await getAcademicAdvice(aiQuery);
    setAiResponse(result || "I was unable to process that query at this time.");
    setIsAiLoading(false);
  };

  const renderStats = () => {
    if (!stats) return null;

    if (user?.role === UserRole.SUPER_ADMIN && stats.platform) {
      return (
        <>
          <StatsCard label="Total Schools" value={stats.platform.total_schools} icon={Building} color="bg-brand-primary" />
          <StatsCard label="Active Schools" value={stats.platform.active_schools} icon={Activity} color="bg-green-600" />
          <StatsCard label="Total Users" value={stats.platform.total_users.toLocaleString()} icon={Users} color="bg-brand-secondary" />
          <StatsCard label="Total Students" value={stats.platform.total_students.toLocaleString()} icon={UserPlus} color="bg-indigo-600" />
          <StatsCard label="Total Teachers" value={stats.platform.total_teachers.toLocaleString()} icon={ShieldCheck} color="bg-emerald-600" />
          <StatsCard label="Platform Revenue" value={formatCurrency(stats.platform.total_revenue)} icon={Wallet} color="bg-blue-800" />
        </>
      );
    }

    if (user?.role === UserRole.STUDENT && stats.student) {
      return (
        <>
          <StatsCard label="Attendance Rate" value={`${Math.round(stats.student.attendance)}%`} icon={Calendar} color="bg-brand-primary" />
          <StatsCard label="Active Assignments" value={stats.student.assignments} icon={FileText} color="bg-orange-500" />
          <StatsCard label="Average Grade" value={stats.student.avg_marks.toFixed(1)} icon={Award} color="bg-brand-secondary" />
        </>
      );
    }

    if (user?.role === UserRole.TEACHER && stats.teacher) {
      return (
        <>
          <StatsCard label="Total Classes" value={stats.teacher.classes} icon={SchoolIcon} color="bg-brand-primary" />
          <StatsCard label="Total Students" value={stats.teacher.students} icon={Users} color="bg-brand-secondary" />
          <StatsCard label="Pending Grading" value={stats.teacher.assignments} icon={FileText} color="bg-orange-500" />
        </>
      );
    }

    return (
      <>
        <StatsCard label="Total Students" value={stats.general?.students || 0} icon={Users} color="bg-brand-primary" />
        <StatsCard label="Active Teachers" value={stats.general?.teachers || 0} icon={UserPlus} color="bg-brand-secondary" />
        <StatsCard label="Total Classes" value={stats.general?.classes || 0} icon={Building} color="bg-indigo-600" />
        <StatsCard label="Total Revenue" value={formatCurrency(stats.finance?.payments?.total_amount || 0)} icon={Wallet} color="bg-emerald-600" />
        <StatsCard label="Outstanding Balance" value={formatCurrency(stats.finance?.outstanding_balance || 0)} icon={PiggyBank} color="bg-rose-500" />
        <StatsCard label="Collectable Fees" value={formatCurrency(stats.general?.collectable_fees || 0)} icon={Receipt} color="bg-orange-500" />
      </>
    );
  };

  const getChartData = () => {
    if (!stats?.charts) return [];
    // Handle either registration_trends or attendance_trends based on role
    const chartKey = user?.role === UserRole.SUPER_ADMIN ? 'registration_trends' : 'attendance_trends';
    const chart = stats.charts[chartKey] || Object.values(stats.charts)[0];
    if (!chart) return [];
    return chart.labels.map((label, i) => ({ label, val: chart.data[i] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === UserRole.SUPER_ADMIN ? 'Platform Operations' : `Hello, ${user?.name.split(' ')[0]}`}
          </h1>
          <p className="text-slate-500 font-medium">
            {user?.role === UserRole.SUPER_ADMIN ? 'System-wide multi-tenant intelligence' : 'Consolidated view of institutional performance'}
          </p>
        </div>
        <div className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           Status: High Availability
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/50 border border-gray-100 rounded-3xl animate-pulse"></div>
          ))
        ) : renderStats()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
               </div>
               <h2 className="text-xl font-bold text-slate-800">Operational Pulse</h2>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dx={-10} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={3} fill="url(#colorPulse)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="card-premium p-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Clock size={16} className="text-brand-primary" /> Upcoming Deadlines
                </h3>
                <div className="space-y-4">
                   {activities.length > 0 ? activities.slice(0, 4).map((act, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-primary shadow-sm"><FileText size={16}/></div>
                        <div className="flex-1">
                           <p className="text-xs font-bold text-gray-800 line-clamp-1">{act.message || act.title}</p>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{act.time || 'Due Today'}</p>
                        </div>
                     </div>
                   )) : (
                    <div className="py-10 text-center text-gray-400">
                      {/* Fix: Inbox component used here requires importing from lucide-react */}
                      <Inbox size={24} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No active tasks</p>
                    </div>
                   )}
                </div>
             </div>
             <div className="card-premium p-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <ShieldCheck size={16} className="text-emerald-500" /> Platform Security
                </h3>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-xs font-bold text-emerald-800">All institutional nodes are currently healthy and synchronized.</p>
                   <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Latency: 24ms</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium p-7 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 blur-3xl -mr-16 -mt-16 group-hover:opacity-40 transition-opacity"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Sparkles className="text-brand-secondary" size={24} />
              <h2 className="text-lg font-black uppercase italic tracking-tighter">Gemini Intel</h2>
            </div>
            <div className="relative mb-6 z-10">
              <input 
                type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask intelligence agent..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-5 text-sm outline-none focus:bg-white/20 transition-all pr-12"
                onKeyDown={(e) => e.key === 'Enter' && handleAiAssistant()}
              />
              <button onClick={handleAiAssistant} disabled={isAiLoading} className="absolute right-2 top-1.5 p-2 bg-brand-primary text-white rounded-xl shadow-lg">
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            {aiResponse && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs leading-relaxed font-medium italic relative z-10 animate-in fade-in slide-in-from-top-2">
                "{aiResponse}"
              </div>
            )}
          </div>

          <div className="card-premium p-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Recent Logged Events</h3>
            <div className="space-y-6">
               {activities.length > 0 ? activities.map((item, idx) => (
                 <div key={idx} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    <div>
                       <p className="text-xs font-bold text-gray-800 leading-tight">{item.message}</p>
                       <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{item.time || 'Recently'}</p>
                    </div>
                 </div>
               )) : (
                 <div className="text-center py-10 text-gray-300 italic text-xs font-bold">No active logs found</div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
