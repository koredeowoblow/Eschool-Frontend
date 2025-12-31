import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Calendar, Wallet, TrendingUp, Sparkles, Send, Loader2, Building, 
  Activity, ShieldCheck, Clock, Award, Inbox
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
        const statsReq = api.get('/dashboard/stats');
        
        // Handle activities 404 gracefully without interrupting stats load
        const activityReq = api.get('/dashboard/activities').catch((e: any) => {
          if (e.status !== 404) console.warn("Activity fetch error:", e.message);
          return { data: { data: [] } };
        });
        
        const [statsRes, activityRes] = await Promise.all([statsReq, activityReq]);
        
        setStats(statsRes.data.data || statsRes.data);
        setActivities(activityRes.data.data || activityRes.data || []);
      } catch (err) {
        console.warn("Dashboard statistics could not be fully loaded.");
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
    setAiResponse(result || "I couldn't get an answer. Please try again.");
    setIsAiLoading(false);
  };

  const renderStats = () => {
    if (!stats) return null;

    if (user?.role === UserRole.SUPER_ADMIN && stats.platform) {
      return (
        <>
          <StatsCard label="Schools" value={stats.platform.total_schools} icon={Building} color="bg-brand-primary" />
          <StatsCard label="Active Schools" value={stats.platform.active_schools} icon={Activity} color="bg-green-600" />
          <StatsCard label="Users" value={stats.platform.total_users.toLocaleString()} icon={Users} color="bg-blue-500" />
          <StatsCard label="Total Students" value={stats.platform.total_students.toLocaleString()} icon={UserPlus} color="bg-indigo-600" />
        </>
      );
    }

    if (user?.role === UserRole.STUDENT && stats.student) {
      return (
        <>
          <StatsCard label="Attendance" value={`${Math.round(stats.student.attendance)}%`} icon={Calendar} color="bg-brand-primary" />
          <StatsCard label="Assignments" value={stats.student.assignments} icon={Clock} color="bg-orange-500" />
          <StatsCard label="Grades" value={stats.student.avg_marks.toFixed(1)} icon={Award} color="bg-brand-secondary" />
        </>
      );
    }

    return (
      <>
        <StatsCard label="Students" value={stats.general?.students || 0} icon={Users} color="bg-brand-primary" />
        <StatsCard label="Teachers" value={stats.general?.teachers || 0} icon={UserPlus} color="bg-blue-500" />
        <StatsCard label="Classes" value={stats.general?.classes || 0} icon={Building} color="bg-indigo-600" />
        <StatsCard label="Fees Collected" value={formatCurrency(stats.finance?.payments?.total_amount || 0)} icon={Wallet} color="bg-emerald-600" />
      </>
    );
  };

  const getChartData = () => {
    if (!stats?.charts) return [];
    const chartKey = user?.role === UserRole.SUPER_ADMIN ? 'registration_trends' : 'attendance_trends';
    const chart = stats.charts[chartKey] || Object.values(stats.charts)[0];
    if (!chart) return [];
    return chart.labels.map((label, i) => ({ label, val: chart.data[i] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === UserRole.SUPER_ADMIN ? 'Platform Overview' : `Welcome, ${user?.name.split(' ')[0]}`}
          </h1>
          <p className="text-slate-500 font-medium">Quick summary of school activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-gray-100 rounded-3xl animate-pulse"></div>
          ))
        ) : renderStats()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="card-premium p-6 border-gray-100">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-primary" /> Activity Chart
            </h2>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dx={-10} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={3} fill="#2563eb" fillOpacity={0.1} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="card-premium p-6 border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Clock size={16} className="text-brand-primary" /> Recent Tasks
                </h3>
                <div className="space-y-4">
                   {activities.length > 0 ? activities.slice(0, 4).map((act, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                           <p className="text-xs font-bold text-gray-800">{act.message || act.title}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">{act.time || 'Today'}</p>
                        </div>
                     </div>
                   )) : (
                    <div className="py-10 text-center text-gray-400">
                      <Inbox size={24} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-bold">No tasks found</p>
                    </div>
                   )}
                </div>
             </div>
             <div className="card-premium p-6 border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <ShieldCheck size={16} className="text-green-500" /> Status
                </h3>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                   <p className="text-xs font-bold text-green-800">All systems are working fine.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium p-7 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Sparkles className="text-brand-secondary" size={24} />
              <h2 className="text-lg font-bold uppercase tracking-tight">AI Assistant</h2>
            </div>
            <div className="relative mb-6 z-10">
              <input 
                type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask a question..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-5 text-sm outline-none focus:bg-white/20 transition-all pr-12"
                onKeyDown={(e) => e.key === 'Enter' && handleAiAssistant()}
              />
              <button onClick={handleAiAssistant} disabled={isAiLoading} className="absolute right-2 top-1.5 p-2 bg-brand-primary text-white rounded-xl">
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            {aiResponse && (
              <div className="p-4 bg-white/5 rounded-2xl text-xs font-medium italic relative z-10">
                "{aiResponse}"
              </div>
            )}
          </div>

          <div className="card-premium p-6 border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Recent Events</h3>
            <div className="space-y-4">
               {activities.length > 0 ? activities.map((item, idx) => (
                 <div key={idx} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                    <div>
                       <p className="text-xs font-bold text-gray-800 leading-tight">{item.message}</p>
                       <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{item.time || 'Recently'}</p>
                    </div>
                 </div>
               )) : (
                 <div className="text-center py-10 text-gray-300 font-bold text-xs italic">No new events</div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;